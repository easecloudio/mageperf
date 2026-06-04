import asyncio
import json as json_lib
import os
import signal
import sys
from enum import Enum
from pathlib import Path
from typing import Any, Optional
from urllib.parse import urlparse

import typer
from rich.console import Console
from rich.table import Table

from mageperf import __version__
from mageperf.core.analysis_orchestrator import get_orchestrator
from mageperf.storage.store import ReportStore

app = typer.Typer(
    name="mageperf",
    help="EaseCloud Magento Performance Analyzer",
    add_completion=False,
)
console = Console()

_PID_FILE = Path.home() / ".easecloud" / "mageperf" / "server.pid"


@app.callback(invoke_without_command=True)
def main(
    version: bool = typer.Option(
        False, "--version", "-V", help="Show version and exit.", is_eager=True
    ),
    verbose: bool = typer.Option(False, "--verbose", help="Enable debug logging."),
):
    """EaseCloud mageperf — Magento Performance CLI"""
    if version:
        console.print(f"mageperf {__version__}")
        raise typer.Exit()
    if verbose:
        import logging
        from mageperf.utils.logger import logger as _logger
        _logger.setLevel(logging.DEBUG)


config_app = typer.Typer(help="Manage mageperf configuration")
app.add_typer(config_app, name="config")


@config_app.command("set")
def config_set(key: str, value: str):
    """Set a configuration value."""
    import json as _json
    from mageperf.config import Config, DEFAULTS

    key = key.replace("-", "_")
    default_val = DEFAULTS.get(key)
    if default_val is not None:
        try:
            typed_value = type(default_val)(value)
        except (ValueError, TypeError):
            typed_value = value
    else:
        try:
            typed_value = _json.loads(value)
        except (_json.JSONDecodeError, ValueError):
            typed_value = value
    Config().set(key, typed_value)
    console.print(f"[green]✓[/green] {key} = {typed_value}")


@config_app.command("get")
def config_get(key: str):
    """Get a configuration value."""
    from mageperf.config import Config

    key = key.replace("-", "_")
    val = Config().get(key)
    console.print(val if val is not None else "[dim]not set[/dim]")


class OutputFormat(str, Enum):
    summary = "summary"
    json = "json"
    table = "table"


def _validate_url(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        hint = f"https://{url}" if "://" not in url else None
        msg = f"URL must start with http:// or https:// (got: {url!r})."
        if hint:
            msg += f" Did you mean: {hint}"
        raise typer.BadParameter(msg, param_hint="url")
    if not parsed.netloc:
        raise typer.BadParameter(f"URL is missing a hostname: {url!r}", param_hint="url")


@app.command()
def analyze(
    url: str = typer.Argument(..., help="Magento store URL to analyze"),
    format: OutputFormat = typer.Option(OutputFormat.summary, "--format", "-f"),
    output: Optional[str] = typer.Option(None, "--output", "-o", help="Write JSON to file"),
    open_browser: bool = typer.Option(False, "--open", help="Open browser UI after analysis"),
    no_pagespeed: bool = typer.Option(False, "--no-pagespeed", help="Skip PageSpeed API"),
    timeout: Optional[float] = typer.Option(None, "--timeout", help="HTTP request timeout in seconds (default: 20)."),
    force: bool = typer.Option(False, "--force", help="Skip Magento detection gate (use when store fingerprints are hardened)."),
):
    """Analyze a Magento store's performance, security, and configuration."""
    _validate_url(url)

    if timeout is not None:
        from mageperf.utils.http_client import http_client as _hc
        _hc.override_timeout(timeout)

    from mageperf.config import Config

    cfg = Config()
    api_key = None if no_pagespeed else cfg.get("pagespeed_api_key")
    store = ReportStore()

    try:
        with console.status("Analyzing...", spinner="dots") as status:
            def on_progress(msg: str, pct: int):
                status.update(f"[bold]{msg}[/bold] ({pct}%)")

            async def _run():
                from mageperf.utils.http_client import http_client as _hc
                try:
                    orch = get_orchestrator(progress_callback=on_progress)
                    return await orch.run_full_analysis(url, pagespeed_api_key=api_key, force=force)
                finally:
                    await _hc.close()

            report = asyncio.run(_run())
    except KeyboardInterrupt:
        console.print("\n[yellow]Analysis interrupted.[/yellow]")
        raise typer.Exit(code=130)
    except Exception as exc:
        console.print(f"[red]✗ Unexpected error:[/red] {exc}")
        raise typer.Exit(code=1)

    if report.get("status") == "failed":
        console.print(f"[red]✗ Analysis failed:[/red] {report.get('error')}")
        raise typer.Exit(code=1)

    store.save(report)

    if output:
        with open(output, "w", encoding="utf-8") as f:
            json_lib.dump(report, f, indent=2)

    if format == OutputFormat.json:
        print(json_lib.dumps(report, indent=2))
    elif format == OutputFormat.table:
        _print_table(report)
    else:
        _print_summary(report)

    if open_browser:
        _open_report_in_browser(report["id"], cfg.get("server_port"))


@app.command("list")
def list_reports():
    """List all saved local reports."""
    store = ReportStore()
    reports = store.list()
    if not reports:
        console.print(
            "[dim]No reports found. Run [bold]mageperf analyze <url>[/bold] to get started.[/dim]"
        )
        return
    table = Table(title="Saved Reports")
    table.add_column("#", style="dim", justify="right")
    table.add_column("ID", style="cyan")
    table.add_column("URL")
    table.add_column("Score", justify="right")
    table.add_column("Date")
    for idx, r in enumerate(reports, start=1):
        table.add_row(
            str(idx),
            r.get("id", ""),
            r.get("url", ""),
            str(r.get("overall_score", "?")),
            r.get("created_at", "")[:10],
        )
    console.print(table)


@app.command("open")
def open_report(report_id: str = typer.Argument(..., help="Report ID or list index (e.g. 1)")):
    """Open a saved report in the browser UI."""
    from mageperf.config import Config

    store = ReportStore()

    if report_id.isdigit():
        reports = store.list()
        idx = int(report_id) - 1
        if idx < 0 or idx >= len(reports):
            console.print(f"[red]✗[/red] No report at index {report_id}. Run [bold]mageperf list[/bold] to see available reports.")
            raise typer.Exit(code=1)
        report_id = reports[idx]["id"]

    if not store.get(report_id):
        console.print(f"[red]✗[/red] Report '{report_id}' not found.")
        raise typer.Exit(code=1)
    cfg = Config()
    _open_report_in_browser(report_id, cfg.get("server_port"))


@app.command("compare")
def compare_reports(
    report_a: str = typer.Argument(..., help="Baseline report ID (older/before)"),
    report_b: str = typer.Argument(..., help="Comparison report ID (newer/after)"),
):
    """Compare two saved reports side by side to measure improvement."""
    store = ReportStore()
    a = store.get(report_a)
    b = store.get(report_b)

    if not a:
        console.print(f"[red]✗[/red] Report '{report_a}' not found.")
        raise typer.Exit(code=1)
    if not b:
        console.print(f"[red]✗[/red] Report '{report_b}' not found.")
        raise typer.Exit(code=1)

    def _delta_str(before: float, after: float) -> str:
        diff = after - before
        if diff > 0:
            return f"[green]+{diff:.0f}[/green]"
        elif diff < 0:
            return f"[red]{diff:.0f}[/red]"
        return "[dim]±0[/dim]"

    console.print(f"\n[bold]Score Comparison[/bold]")
    console.print(f"  Baseline : {a.get('url', '')}  [{a.get('created_at', '')[:10]}]  score={a.get('overall_score', 0)}  grade={a.get('grade', '?')}")
    console.print(f"  Compared : {b.get('url', '')}  [{b.get('created_at', '')[:10]}]  score={b.get('overall_score', 0)}  grade={b.get('grade', '?')}")

    table = Table(title="Score Delta", show_header=True)
    table.add_column("Category")
    table.add_column("Before", justify="right")
    table.add_column("After", justify="right")
    table.add_column("Delta", justify="right")

    overall_before = float(a.get("overall_score", 0))
    overall_after = float(b.get("overall_score", 0))
    table.add_row(
        "[bold]Overall[/bold]",
        f"[bold]{overall_before:.0f}[/bold]",
        f"[bold]{overall_after:.0f}[/bold]",
        _delta_str(overall_before, overall_after),
    )

    all_cats = set(list(a.get("scores", {}).keys()) + list(b.get("scores", {}).keys()))
    for cat in sorted(all_cats):
        before_val = float(a.get("scores", {}).get(cat, 0))
        after_val = float(b.get("scores", {}).get(cat, 0))
        table.add_row(cat.capitalize(), f"{before_val:.0f}", f"{after_val:.0f}", _delta_str(before_val, after_val))

    console.print(table)

    a_recs = {f.get("recommendation", f) if isinstance(f, dict) else f for f in a.get("findings", [])}
    b_recs = {f.get("recommendation", f) if isinstance(f, dict) else f for f in b.get("findings", [])}
    resolved = a_recs - b_recs
    new_findings = b_recs - a_recs

    if resolved:
        console.print(f"\n[green]Resolved ({len(resolved)}):[/green]")
        for r in sorted(resolved):
            console.print(f"  [green]✓[/green] {r}")
    if new_findings:
        console.print(f"\n[yellow]New findings ({len(new_findings)}):[/yellow]")
        for f in sorted(new_findings):
            console.print(f"  [yellow]![/yellow] {f}")
    if not resolved and not new_findings:
        console.print("\n[dim]No change in findings.[/dim]")


@app.command("delete")
def delete_report(report_id: str = typer.Argument(..., help="Report ID to delete")):
    """Delete a single saved report."""
    store = ReportStore()
    if not store.delete(report_id):
        console.print(f"[red]✗[/red] Report '{report_id}' not found.")
        raise typer.Exit(code=1)
    console.print(f"[green]✓[/green] Report {report_id} deleted.")


@app.command("clean")
def clean_reports(
    force: bool = typer.Option(False, "--force", "-f", help="Skip confirmation"),
):
    """Delete all saved local reports."""
    if not force:
        typer.confirm("Delete all saved reports?", abort=True)
    store = ReportStore()
    reports = list(store.list())
    deleted = 0
    for r in reports:
        store.delete(r["id"])
        deleted += 1
    console.print(f"[green]✓[/green] Deleted {deleted} report(s).")


@app.command("stop")
def stop_server():
    """Stop the background report server."""
    if not _PID_FILE.exists():
        console.print("[dim]No server running (no PID file found).[/dim]")
        return
    try:
        pid = int(_PID_FILE.read_text().strip())
    except (ValueError, OSError):
        _PID_FILE.unlink(missing_ok=True)
        console.print("[dim]Stale PID file removed.[/dim]")
        return
    try:
        os.kill(pid, signal.SIGTERM)
        _PID_FILE.unlink(missing_ok=True)
        console.print(f"[green]✓[/green] Server (PID {pid}) stopped.")
    except ProcessLookupError:
        _PID_FILE.unlink(missing_ok=True)
        console.print("[dim]Server was not running (stale PID file removed).[/dim]")
    except PermissionError:
        console.print(f"[red]✗[/red] Cannot stop server (PID {pid}): permission denied.")
        raise typer.Exit(code=1)


def _print_summary(report: dict):
    scores = report.get("scores", {})
    console.print(
        f"\n[bold]Overall Score:[/bold] [green]{report.get('overall_score', 0)}/100[/green]"
    )
    table = Table(show_header=False, box=None)
    for key, val in scores.items():
        bar = "█" * (int(val) // 10) + "░" * (10 - int(val) // 10)
        table.add_row(f"  {key.capitalize()}", str(val), f"[cyan]{bar}[/cyan]")
    console.print(table)
    findings_count = len(
        [
            f
            for f in report.get("findings", [])
            if isinstance(f, dict) and f.get("severity") == "critical"
        ]
    )
    if findings_count:
        console.print(
            f"\n[yellow]{findings_count} critical issues found.[/yellow] "
            "Run with [bold]--open[/bold] to view full report."
        )
    report_id = report.get("id", "")
    console.print(f"[dim]Report saved: ~/.easecloud/mageperf/reports/{report_id}.json[/dim]")


def _print_table(report: dict):
    table = Table(title=f"mageperf — {report.get('url', '')}")
    table.add_column("Category")
    table.add_column("Score", justify="right")
    for key, val in report.get("scores", {}).items():
        table.add_row(key.capitalize(), str(val))
    console.print(table)


def _is_server_running(port: int) -> bool:
    import httpx as _httpx

    try:
        _httpx.get(f"http://localhost:{port}/", timeout=0.5)
        return True
    except Exception:
        return False


def _open_report_in_browser(report_id: str, port: Any):
    import subprocess
    import time
    import webbrowser

    port = int(port or 4780)

    if not _is_server_running(port):
        subprocess.Popen(
            [sys.executable, "-m", "mageperf.cli", "serve", "--no-open"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        for _ in range(10):
            if _is_server_running(port):
                break
            time.sleep(0.5)

    webbrowser.open(f"http://localhost:{port}/report/{report_id}")


@app.command("serve")
def serve(
    port: int = typer.Option(None, "--port", "-p", help="Port to serve on"),
    no_open: bool = typer.Option(False, "--no-open", help="Don't open browser"),
):
    """Start the local report UI server."""
    import threading
    import time
    import webbrowser

    from mageperf.config import Config
    from mageperf.server.server import LocalServer

    cfg = Config()
    port = port or cfg.get("server_port") or 4780
    port = int(port)
    srv = LocalServer(port=port)
    url = f"http://localhost:{port}"
    console.print(
        f"[green]✓[/green] mageperf UI running at [bold]{url}[/bold]  (Ctrl+C to stop)"
    )

    # Write PID file so `mageperf stop` can find this process
    _PID_FILE.parent.mkdir(parents=True, exist_ok=True)
    _PID_FILE.write_text(str(os.getpid()))

    if not no_open:

        def _open_when_ready():
            import httpx as _httpx

            for _ in range(20):
                try:
                    _httpx.get(url, timeout=0.5)
                    break
                except Exception:
                    time.sleep(0.25)
            webbrowser.open(url)

        threading.Thread(target=_open_when_ready, daemon=True).start()

    try:
        srv.serve()
    except KeyboardInterrupt:
        srv.shutdown()
        console.print("[dim]Server stopped.[/dim]")
    finally:
        _PID_FILE.unlink(missing_ok=True)


if __name__ == "__main__":
    app()
