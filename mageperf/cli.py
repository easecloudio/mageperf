import asyncio
import json as json_lib
from enum import Enum
from typing import Any, Optional

import typer
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table

from mageperf.core.analysis_orchestrator import get_orchestrator
from mageperf.storage.store import ReportStore

app = typer.Typer(
    name="mageperf",
    help="EaseCloud Magento Performance Analyzer",
    add_completion=False,
)
console = Console()

@app.callback(invoke_without_command=True)
def main():
    """EaseCloud mageperf — Magento Performance CLI"""
    pass

config_app = typer.Typer(help="Manage mageperf configuration")
app.add_typer(config_app, name="config")

@config_app.command("set")
def config_set(key: str, value: str):
    """Set a configuration value."""
    import json as _json
    from mageperf.config import Config, DEFAULTS
    key = key.replace("-", "_")  # normalize dash to underscore
    # Coerce to the type of the default value if a default exists
    default_val = DEFAULTS.get(key)
    if default_val is not None:
        try:
            typed_value = type(default_val)(value)
        except (ValueError, TypeError):
            typed_value = value
    else:
        # Try JSON parse for unknown keys (handles int, float, bool)
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
    key = key.replace("-", "_")  # normalize dash to underscore
    val = Config().get(key)
    console.print(val if val is not None else "[dim]not set[/dim]")


class OutputFormat(str, Enum):
    summary = "summary"
    json = "json"
    table = "table"


@app.command()
def analyze(
    url: str = typer.Argument(..., help="Magento store URL to analyze"),
    format: OutputFormat = typer.Option(OutputFormat.summary, "--format", "-f"),
    output: Optional[str] = typer.Option(None, "--output", "-o", help="Write JSON to file"),
    open_browser: bool = typer.Option(False, "--open", help="Open browser UI after analysis"),
    no_pagespeed: bool = typer.Option(False, "--no-pagespeed", help="Skip PageSpeed API"),
):
    """Analyze a Magento store's performance, security, and configuration."""
    from mageperf.config import Config

    cfg = Config()
    api_key = None if no_pagespeed else cfg.get("pagespeed_api_key")
    store = ReportStore()

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        transient=True,
    ) as progress:
        task = progress.add_task("Analyzing...", total=100)

        def on_progress(msg: str, pct: int):
            progress.update(task, completed=pct, description=msg)

        orchestrator = get_orchestrator(progress_callback=on_progress)
        report = asyncio.run(
            orchestrator.run_full_analysis(url, pagespeed_api_key=api_key)
        )

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
    table.add_column("ID", style="cyan")
    table.add_column("URL")
    table.add_column("Score", justify="right")
    table.add_column("Date")
    for r in reports:
        table.add_row(
            r.get("id", ""),
            r.get("url", ""),
            str(r.get("overall_score", "?")),
            r.get("created_at", "")[:10],
        )
    console.print(table)


@app.command("open")
def open_report(report_id: str = typer.Argument(..., help="Report ID to open")):
    """Open a saved report in the browser UI."""
    from mageperf.config import Config
    if not ReportStore().get(report_id):
        console.print(f"[red]✗[/red] Report '{report_id}' not found.")
        raise typer.Exit(code=1)
    cfg = Config()
    _open_report_in_browser(report_id, cfg.get("server_port"))


@app.command("clean")
def clean_reports(
    force: bool = typer.Option(False, "--force", "-f", help="Skip confirmation"),
):
    """Delete all saved local reports."""
    if not force:
        typer.confirm("Delete all saved reports?", abort=True)
    store = ReportStore()
    reports = list(store.list())  # collect first to avoid mid-loop mutation
    deleted = 0
    for r in reports:
        store.delete(r["id"])
        deleted += 1
    console.print(f"[green]✓[/green] Deleted {deleted} report(s).")


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
        [f for f in report.get("findings", []) if isinstance(f, dict) and f.get("severity") == "critical"]
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


def _open_report_in_browser(report_id: str, port: Any):
    import webbrowser
    import subprocess
    import sys
    import time
    import httpx

    port = int(port or 4780)
    subprocess.Popen(
        [sys.executable, "-m", "mageperf.cli", "serve", "--no-open"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    # Poll until server is ready (up to 5 seconds)
    for _ in range(10):
        try:
            httpx.get(f"http://localhost:{port}/", timeout=0.5)
            break
        except Exception:
            time.sleep(0.5)
    webbrowser.open(f"http://localhost:{port}/report/{report_id}")


@app.command("serve")
def serve(
    port: int = typer.Option(None, "--port", "-p", help="Port to serve on"),
    no_open: bool = typer.Option(False, "--no-open", help="Don't open browser"),
):
    """Start the local report UI server."""
    from mageperf.server.server import LocalServer
    from mageperf.config import Config
    import webbrowser
    import threading
    import time

    cfg = Config()
    port = port or cfg.get("server_port") or 4780
    port = int(port)
    srv = LocalServer(port=port)
    url = f"http://localhost:{port}"
    console.print(
        f"[green]✓[/green] mageperf UI running at [bold]{url}[/bold]  (Ctrl+C to stop)"
    )

    if not no_open:
        def _open_when_ready():
            import httpx
            for _ in range(20):
                try:
                    httpx.get(url, timeout=0.5)
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


if __name__ == "__main__":
    app()
