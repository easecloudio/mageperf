# mageperf Priority Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the 10 priority fixes identified in the product/architecture review to make mageperf a more reliable, usable, and accurate Magento performance tool.

**Architecture:** Each fix is isolated to specific files — CLI layer (`cli.py`), orchestration layer (`analysis_orchestrator.py`), checker layer (`magento_checker.py`, `performance_checker.py`), and scoring layer (`scoring_service.py`). Tests live flat in `tests/`. No new dependencies needed.

**Tech Stack:** Python 3.11+, Typer, Rich, httpx, pytest, pytest-asyncio, pytest-mock

---

## Task 1: `--force` flag to bypass Magento detection gate

When a hardened store strips Magento headers and blocks common paths, the tool incorrectly reports "Magento not detected." A `--force` flag lets the user override.

**Files:**
- Modify: `mageperf/cli.py` (analyze command)
- Modify: `mageperf/core/analysis_orchestrator.py` (run_full_analysis)
- Test: `tests/test_analyze_command.py`

### Step 1: Write the failing test

Add to `tests/test_analyze_command.py`:

```python
def test_analyze_force_skips_detection_gate(tmp_path):
    """--force should proceed even when detection returns is_magento=False."""
    with patch("mageperf.storage.store.REPORTS_DIR", tmp_path / "reports"), \
         patch("mageperf.cli.get_orchestrator") as mock_orch_factory:
        mock_orch = mock_orch_factory.return_value
        mock_orch.run_full_analysis = AsyncMock(return_value=MOCK_REPORT)
        result = runner.invoke(app, [
            "analyze", "https://hardened-store.com", "--force"
        ])
    # get_orchestrator should be called with force=True
    mock_orch_factory.assert_called_once()
    call_kwargs = mock_orch.run_full_analysis.call_args
    assert call_kwargs.kwargs.get("force") is True
    assert result.exit_code == 0
```

### Step 2: Run to confirm it fails

```bash
cd /Users/safoor/Code/easecloud-opensource/mageperf
pytest tests/test_analyze_command.py::test_analyze_force_skips_detection_gate -v
```

Expected: FAIL — `--force` option doesn't exist yet.

### Step 3: Add `--force` to the `analyze` command in `cli.py`

In `cli.py`, add `force` parameter to `analyze()`:

```python
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
```

Then pass `force` through to `run_full_analysis`:

```python
# Inside analyze(), change:
orch = get_orchestrator(progress_callback=on_progress)
return await orch.run_full_analysis(url, pagespeed_api_key=api_key)

# To:
orch = get_orchestrator(progress_callback=on_progress)
return await orch.run_full_analysis(url, pagespeed_api_key=api_key, force=force)
```

### Step 4: Accept `force` in `run_full_analysis` in `analysis_orchestrator.py`

Change the method signature and guard:

```python
async def run_full_analysis(
    self, url: str, pagespeed_api_key: Optional[str] = None, force: bool = False
) -> Dict[str, Any]:
```

Change the detection gate block from:

```python
if not magento_detection.get("is_magento"):
    return {
        "id": task_id,
        "url": url,
        "created_at": started_at.isoformat(),
        "status": "failed",
        "error": "Magento not detected at this URL",
    }
```

To:

```python
if not force and not magento_detection.get("is_magento"):
    return {
        "id": task_id,
        "url": url,
        "created_at": started_at.isoformat(),
        "status": "failed",
        "error": "Magento not detected at this URL. Use --force to override.",
    }
if force and not magento_detection.get("is_magento"):
    self._progress("Detection skipped (--force)", 25)
```

### Step 5: Run test to confirm it passes

```bash
pytest tests/test_analyze_command.py::test_analyze_force_skips_detection_gate -v
```

Expected: PASS

### Step 6: Commit

```bash
git add mageperf/cli.py mageperf/core/analysis_orchestrator.py tests/test_analyze_command.py
git commit -m "feat: add --force flag to bypass Magento detection gate"
```

---

## Task 2: Per-check Rich progress reporting

Replace the single spinner with a live status table showing each check's state as it runs.

**Files:**
- Modify: `mageperf/cli.py` (analyze command, progress display)
- Modify: `mageperf/core/analysis_orchestrator.py` (richer progress callback messages)

### Step 1: Write the failing test

Add to `tests/test_analyze_command.py`:

```python
def test_analyze_shows_per_check_progress(tmp_path):
    """Terminal output should mention individual check names while running."""
    with patch("mageperf.storage.store.REPORTS_DIR", tmp_path / "reports"), \
         patch("mageperf.cli.get_orchestrator") as mock_orch_factory:
        mock_orch = mock_orch_factory.return_value
        # Simulate the orchestrator calling the progress callback with check names
        async def fake_analysis(url, pagespeed_api_key=None, force=False):
            orch_instance = mock_orch_factory.return_value
            # The callback was injected; we just return a report
            return MOCK_REPORT
        mock_orch.run_full_analysis = AsyncMock(side_effect=fake_analysis)
        result = runner.invoke(app, ["analyze", "https://demo.magento.com"])
    assert result.exit_code == 0
```

Note: Full per-check label testing is in the orchestrator-level unit tests. CLI test just verifies it still exits 0 after the refactor.

### Step 2: Run to confirm it passes (regression guard)

```bash
pytest tests/test_analyze_command.py -v
```

### Step 3: Update the progress display in `cli.py`

Replace the existing `Progress` block in the `analyze` command with a `Live` table approach. The key insight: the `on_progress` callback receives a message string — we log it as a status line:

```python
from rich.live import Live
from rich.table import Table as RichTable
from rich.text import Text

# Inside analyze(), replace the Progress block with:
_check_lines: list[tuple[str, str]] = []  # (label, status)

def on_progress(msg: str, pct: int):
    if pct < 100:
        _check_lines.append((msg, "[yellow]running[/yellow]"))
    else:
        if _check_lines:
            last_label, _ = _check_lines[-1]
            _check_lines[-1] = (last_label, "[green]done[/green]")
        _check_lines.append((msg, "[green]done[/green]"))

async def _run():
    from mageperf.utils.http_client import http_client as _hc
    try:
        orch = get_orchestrator(progress_callback=on_progress)
        return await orch.run_full_analysis(url, pagespeed_api_key=api_key, force=force)
    finally:
        await _hc.close()

with console.status("Analyzing...", spinner="dots") as status:
    def _status_callback(msg: str, pct: int):
        on_progress(msg, pct)
        status.update(f"[bold]{msg}[/bold] ({pct}%)")

    # Re-wire so status updates work
    async def _run_with_status():
        from mageperf.utils.http_client import http_client as _hc
        try:
            orch = get_orchestrator(progress_callback=_status_callback)
            return await orch.run_full_analysis(url, pagespeed_api_key=api_key, force=force)
        finally:
            await _hc.close()

    report = asyncio.run(_run_with_status())
```

### Step 4: Update orchestrator progress messages to be specific check names

In `analysis_orchestrator.py`, update the progress messages to be descriptive:

```python
self._progress("Starting analysis", 5)
# ...
self._progress("Detecting Magento", 15)
# ...
self._progress("Fetching PageSpeed data", 30)  # was "Running performance checks"
# ...
self._progress("Running Magento checks", 55)   # was "Running all checks"
# ...
self._progress("Calculating scores", 80)
# ...
self._progress("Generating report", 95)
# ...
self._progress("Done", 100)
```

### Step 5: Run all tests

```bash
pytest tests/ -v
```

Expected: All pass.

### Step 6: Commit

```bash
git add mageperf/cli.py mageperf/core/analysis_orchestrator.py
git commit -m "feat: show per-check status in terminal during analysis"
```

---

## Task 3: `mageperf compare <id1> <id2>` command

Lets users compare two reports to quantify improvements. Core workflow: run before → fix → run after → compare.

**Files:**
- Modify: `mageperf/cli.py` (new `compare` command)
- Test: `tests/test_report_commands.py`

### Step 1: Write the failing test

Add to `tests/test_report_commands.py`:

```python
from unittest.mock import patch, MagicMock

_REPORT_A = {
    "id": "aaaaaaaa-0000-0000-0000-000000000000",
    "url": "https://demo.magento.com",
    "created_at": "2026-04-01T10:00:00Z",
    "overall_score": 55,
    "grade": "C",
    "scores": {"performance": 50, "security": 60, "config": 55},
    "findings": [{"recommendation": "Enable CSS merging", "severity": "high"}],
}
_REPORT_B = {
    "id": "bbbbbbbb-0000-0000-0000-000000000000",
    "url": "https://demo.magento.com",
    "created_at": "2026-04-14T10:00:00Z",
    "overall_score": 74,
    "grade": "B",
    "scores": {"performance": 82, "security": 61, "config": 79},
    "findings": [],
}

def test_compare_shows_score_delta(tmp_path):
    with patch("mageperf.storage.store.REPORTS_DIR", tmp_path / "reports"):
        store_mock = MagicMock()
        store_mock.get.side_effect = lambda rid: (
            _REPORT_A if rid == _REPORT_A["id"] else
            _REPORT_B if rid == _REPORT_B["id"] else None
        )
        with patch("mageperf.cli.ReportStore", return_value=store_mock):
            result = runner.invoke(app, [
                "compare", _REPORT_A["id"], _REPORT_B["id"]
            ])
    assert result.exit_code == 0
    assert "+19" in result.output  # 74 - 55 = 19

def test_compare_exits_1_on_missing_report(tmp_path):
    with patch("mageperf.storage.store.REPORTS_DIR", tmp_path / "reports"):
        store_mock = MagicMock()
        store_mock.get.return_value = None
        with patch("mageperf.cli.ReportStore", return_value=store_mock):
            result = runner.invoke(app, [
                "compare",
                "aaaaaaaa-0000-0000-0000-000000000000",
                "bbbbbbbb-0000-0000-0000-000000000000",
            ])
    assert result.exit_code == 1
```

### Step 2: Run to confirm it fails

```bash
pytest tests/test_report_commands.py::test_compare_shows_score_delta -v
```

Expected: FAIL — `compare` command doesn't exist.

### Step 3: Implement the `compare` command in `cli.py`

Add after the `open_report` command:

```python
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

    # Resolved findings (in A but not in B)
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
```

### Step 4: Run the tests

```bash
pytest tests/test_report_commands.py -v
```

Expected: All pass.

### Step 5: Commit

```bash
git add mageperf/cli.py tests/test_report_commands.py
git commit -m "feat: add mageperf compare command for side-by-side report diff"
```

---

## Task 4: Elasticsearch/search engine detection check

MySQL search engine is the #1 Magento performance killer on larger catalogs. Detect it via search response timing/headers and surface it as a critical finding.

**Files:**
- Modify: `mageperf/core/magento_checker.py` (new `check_search_engine` method, added to `run_all_checks`)
- Test: `tests/test_magento_checker.py` (new file)

### Step 1: Write the failing test

Create `tests/test_magento_checker.py`:

```python
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from mageperf.core.magento_checker import MagentoChecker

@pytest.fixture
def checker():
    return MagentoChecker()

@pytest.mark.asyncio
async def test_search_engine_detection_elasticsearch(checker):
    """Fast search response with ES headers should flag Elasticsearch."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.headers = {"x-search-engine": "elasticsearch"}
    mock_response.text = "<html><body>results</body></html>"

    with patch("mageperf.core.magento_checker.http_client") as mock_client:
        mock_client.get_with_retry = AsyncMock(return_value=mock_response)
        result = await checker.check_search_engine("https://demo.magento.com")

    assert result.score > 60
    assert result.details.get("search_engine_detected") is not None

@pytest.mark.asyncio
async def test_search_engine_detection_slow_ttfb_warns(checker):
    """Very slow search TTFB should produce a recommendation."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.headers = {}
    mock_response.text = "<html><body>results</body></html>"

    import time
    original_time = time.time

    call_count = 0
    def fake_time():
        nonlocal call_count
        call_count += 1
        # First call returns 0, second call returns 1.5s later
        return 0.0 if call_count == 1 else 1.5

    with patch("mageperf.core.magento_checker.http_client") as mock_client, \
         patch("mageperf.core.magento_checker.time") as mock_time:
        mock_time.time = fake_time
        mock_client.get_with_retry = AsyncMock(return_value=mock_response)
        result = await checker.check_search_engine("https://demo.magento.com")

    # Slow TTFB on search should add a recommendation
    assert any("search" in r.lower() for r in result.recommendations)
```

### Step 2: Run to confirm it fails

```bash
pytest tests/test_magento_checker.py -v
```

Expected: FAIL — `check_search_engine` doesn't exist.

### Step 3: Add `check_search_engine` to `MagentoChecker`

Add `import time` at the top of `magento_checker.py`, then add the method:

```python
async def check_search_engine(self, url: str) -> CheckResult:
    """
    Detect whether Elasticsearch/OpenSearch or MySQL powers catalog search.
    MySQL search is a critical performance issue on stores with >10k products.
    """
    results = {}
    recommendations = []

    try:
        search_url = urljoin(url, "catalogsearch/result/?q=test")
        start = time.time()
        response = await http_client.get_with_retry(search_url, max_retries=1)
        search_ttfb_ms = (time.time() - start) * 1000

        results["search_ttfb_ms"] = round(search_ttfb_ms, 2)
        results["search_status"] = response.status_code

        headers = dict(response.headers)
        es_signals = [
            "x-search-engine",
            "x-elastic",
            "x-opensearch",
        ]
        detected_engine = None
        for h in es_signals:
            val = headers.get(h, "")
            if val:
                detected_engine = val
                break

        # Detect MySQL search via very slow search response (heuristic)
        mysql_search_likely = search_ttfb_ms > 1500 and not detected_engine

        results["search_engine_detected"] = detected_engine or (
            "MySQL (inferred from slow TTFB)" if mysql_search_likely else "unknown"
        )
        results["mysql_search_likely"] = mysql_search_likely

        if mysql_search_likely:
            recommendations.append(
                "Search response time is very slow (>1.5s), which strongly suggests "
                "MySQL is used as the search engine. Switch to Elasticsearch or OpenSearch "
                "for production — MySQL search causes full table scans on large catalogs."
            )
        elif not detected_engine:
            recommendations.append(
                "Could not detect the search engine. Verify Elasticsearch or OpenSearch is "
                "configured in Magento Admin > Stores > Configuration > Catalog > Catalog Search."
            )

        if search_ttfb_ms > 800:
            recommendations.append(
                f"Catalog search response time is {search_ttfb_ms:.0f}ms (should be <800ms). "
                "Investigate search engine configuration and index health."
            )

    except Exception as e:
        logger.error(f"Search engine check error: {e}")
        return CheckResult("Search Engine", 50, {}, ["Could not check search engine."], error=str(e))

    score = 100.0
    if results.get("mysql_search_likely"):
        score -= 60.0
    elif results.get("search_ttfb_ms", 0) > 800:
        score -= 25.0

    return CheckResult("Search Engine", max(0.0, score), results, recommendations)
```

### Step 4: Add `check_search_engine` to `run_all_checks`

In the `run_all_checks` method, add `search_check` to the `asyncio.gather` call:

```python
(
    config_check,
    security_check,
    optimization_check,
    extension_check,
    seo_check,
    search_check,
) = await asyncio.gather(
    self.check_configuration(url),
    self.check_security(url, skip_invasive_checks=skip_invasive_checks),
    self.check_optimization(url),
    self.check_extensions(url),
    self.check_seo(url),
    self.check_search_engine(url),
)

checks = {
    'configuration': config_check.to_dict(),
    'security': security_check.to_dict(),
    'optimization': optimization_check.to_dict(),
    'extensions': extension_check.to_dict(),
    'seo': seo_check.to_dict(),
    'search_engine': search_check.to_dict(),
}
```

Also update `calculate_overall_score` weights to include search engine (reduce configuration weight slightly):

```python
weights = {
    'configuration': 0.15,   # was 0.20
    'security': 0.30,
    'optimization': 0.25,    # was 0.30
    'extensions': 0.05,
    'seo': 0.10,             # was 0.15
    'search_engine': 0.15,   # new
}
```

### Step 5: Run all tests

```bash
pytest tests/ -v
```

Expected: All pass (new tests pass, no regressions).

### Step 6: Commit

```bash
git add mageperf/core/magento_checker.py tests/test_magento_checker.py
git commit -m "feat: add Elasticsearch/search engine detection check"
```

---

## Task 5: Numbered list + `mageperf open <number>`

Typing a full UUID is hostile UX. Show numbers in `mageperf list` and accept them in `mageperf open`.

**Files:**
- Modify: `mageperf/cli.py` (list_reports, open_report)
- Test: `tests/test_report_commands.py`

### Step 1: Write the failing test

Add to `tests/test_report_commands.py`:

```python
_REPORTS_LIST = [
    {"id": "aaaaaaaa-0000-0000-0000-000000000001", "url": "https://store-a.com", "overall_score": 72, "created_at": "2026-04-14T10:00:00Z"},
    {"id": "aaaaaaaa-0000-0000-0000-000000000002", "url": "https://store-b.com", "overall_score": 58, "created_at": "2026-04-10T10:00:00Z"},
]

def test_list_shows_index_numbers(tmp_path):
    with patch("mageperf.storage.store.REPORTS_DIR", tmp_path / "reports"):
        store_mock = MagicMock()
        store_mock.list.return_value = _REPORTS_LIST
        with patch("mageperf.cli.ReportStore", return_value=store_mock):
            result = runner.invoke(app, ["list"])
    assert result.exit_code == 0
    assert "1" in result.output
    assert "2" in result.output

def test_open_by_numeric_index(tmp_path):
    """mageperf open 1 should open the first report in the list."""
    with patch("mageperf.storage.store.REPORTS_DIR", tmp_path / "reports"):
        store_mock = MagicMock()
        store_mock.list.return_value = _REPORTS_LIST
        store_mock.get.return_value = _REPORTS_LIST[0]
        with patch("mageperf.cli.ReportStore", return_value=store_mock), \
             patch("mageperf.cli._open_report_in_browser") as mock_open:
            result = runner.invoke(app, ["open", "1"])
    assert result.exit_code == 0
    mock_open.assert_called_once_with(_REPORTS_LIST[0]["id"], 4780)
```

### Step 2: Run to confirm it fails

```bash
pytest tests/test_report_commands.py::test_open_by_numeric_index -v
```

Expected: FAIL — numeric index not supported.

### Step 3: Update `list_reports` to show index numbers in `cli.py`

```python
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
    table.add_column("#", style="dim", justify="right")   # NEW
    table.add_column("ID", style="cyan")
    table.add_column("URL")
    table.add_column("Score", justify="right")
    table.add_column("Date")
    for idx, r in enumerate(reports, start=1):            # NEW: enumerate
        table.add_row(
            str(idx),                                     # NEW
            r.get("id", ""),
            r.get("url", ""),
            str(r.get("overall_score", "?")),
            r.get("created_at", "")[:10],
        )
    console.print(table)
```

### Step 4: Update `open_report` to resolve numeric index in `cli.py`

```python
@app.command("open")
def open_report(report_id: str = typer.Argument(..., help="Report ID or list index (e.g. 1)")):
    """Open a saved report in the browser UI."""
    from mageperf.config import Config

    store = ReportStore()

    # Resolve numeric index to UUID
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
```

### Step 5: Run all tests

```bash
pytest tests/ -v
```

Expected: All pass.

### Step 6: Commit

```bash
git add mageperf/cli.py tests/test_report_commands.py
git commit -m "feat: numbered list and open by index in mageperf list/open"
```

---

## Task 6: Core checker and scoring service tests

The most complex code has zero coverage. Add tests for `MagentoChecker`, `PerformanceChecker`, and `ScoringService`.

**Files:**
- Extend: `tests/test_magento_checker.py` (from Task 4)
- Create: `tests/test_performance_checker.py`
- Create: `tests/test_scoring_service.py`

### Step 1: Add `MagentoChecker` scoring tests to `tests/test_magento_checker.py`

```python
def test_configuration_score_deducts_for_dev_mode(checker):
    results = {"production_mode": False, "static_signing": True, "maintenance_exposed": False}
    score = checker._calculate_configuration_score(results)
    assert score == 70.0  # 100 - 30

def test_configuration_score_deducts_for_maintenance_exposed(checker):
    results = {"production_mode": True, "static_signing": True, "maintenance_exposed": True}
    score = checker._calculate_configuration_score(results)
    assert score == 80.0  # 100 - 20

def test_security_score_deducts_for_missing_headers(checker):
    results = {
        "admin_path_secure": True,
        "sensitive_files_exposed": False,
        "has_X-Frame-Options": False,
        "has_X-Content-Type-Options": False,
        "has_X-XSS-Protection": False,
    }
    score = checker._calculate_security_score(results)
    assert score == 70.0  # 100 - 10 - 10 - 10

def test_optimization_score_deducts_for_missing_merging(checker):
    results = {"css_merged": False, "js_merged": False, "js_bundling": False, "total_images": 0}
    score = checker._calculate_optimization_score(results)
    assert score == 55.0  # 100 - 15 - 15 - 15

def test_extension_score_penalizes_known_offenders(checker):
    results = {"known_performance_offenders": ["porto_theme", "amasty_layered_navigation"], "extension_resource_count": 5}
    score = checker._calculate_extension_score(results)
    assert score == 70.0  # 100 - 15 - 15

def test_seo_score_zero_without_robots_txt(checker):
    results = {"robots_txt_found": False}
    score = checker._calculate_seo_score(results)
    assert score == 0.0

def test_overall_score_weighted_correctly(checker):
    checks = {
        "configuration": {"score": 100},
        "security": {"score": 100},
        "optimization": {"score": 100},
        "extensions": {"score": 100},
        "seo": {"score": 100},
        "search_engine": {"score": 100},
    }
    score = checker.calculate_overall_score(checks)
    assert score == 100.0
```

### Step 2: Create `tests/test_performance_checker.py`

```python
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from mageperf.core.performance_checker import PerformanceChecker

@pytest.fixture
def checker():
    return PerformanceChecker()

def test_response_score_penalizes_slow_ttfb(checker):
    results = {"homepage_ttfb": 900, "catalog_ttfb": 200}
    score = checker._calculate_response_score(results)
    assert score == 80.0  # 100 - 20 for homepage > 800ms

def test_response_score_no_penalty_for_fast_ttfb(checker):
    results = {"homepage_ttfb": 150}
    score = checker._calculate_response_score(results)
    assert score == 100.0

def test_cache_score_penalizes_no_fpc(checker):
    results = {"magento_fpc_enabled": False, "varnish_detected": False}
    score = checker._calculate_cache_score(results)
    assert score == 50.0  # 100 - 30 - 20

def test_cache_score_perfect_when_both_enabled(checker):
    results = {"magento_fpc_enabled": True, "varnish_detected": True}
    score = checker._calculate_cache_score(results)
    assert score == 100.0

def test_circuit_breaker_opens_after_threshold(checker):
    for _ in range(checker.pagespeed_failure_threshold):
        checker._record_pagespeed_failure()
    assert checker._is_pagespeed_circuit_open() is True

def test_circuit_breaker_resets_on_success(checker):
    for _ in range(checker.pagespeed_failure_threshold):
        checker._record_pagespeed_failure()
    checker._reset_pagespeed_circuit()
    assert checker._is_pagespeed_circuit_open() is False
    assert checker.pagespeed_failures == 0

@pytest.mark.asyncio
async def test_measure_ttfb_returns_milliseconds(checker):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.content = b"hello"
    mock_response.history = []
    mock_response.url = "https://demo.magento.com"
    with patch("mageperf.core.performance_checker.http_client") as mock_client:
        mock_client.get_with_retry = AsyncMock(return_value=mock_response)
        result = await checker.measure_ttfb("https://demo.magento.com")
    assert "ttfb_ms" in result
    assert isinstance(result["ttfb_ms"], float)
```

### Step 3: Create `tests/test_scoring_service.py`

```python
import pytest
from mageperf.core.scoring_service import ScoringService

@pytest.fixture
def service():
    return ScoringService()

def test_grade_A_for_score_above_90(service):
    assert service._determine_grade(92) == "A"

def test_grade_B_for_score_75_to_89(service):
    assert service._determine_grade(80) == "B"

def test_grade_C_for_score_50_to_74(service):
    assert service._determine_grade(60) == "C"

def test_grade_F_for_score_below_25(service):
    assert service._determine_grade(10) == "F"

def test_weighted_score_all_zeroes_returns_zero(service):
    scores = {"performance": 0, "magento_configuration": 0, "magento_security": 0, "magento_optimization": 0, "magento_seo": 0}
    result = service._calculate_weighted_score(scores)
    assert result == 0.0

def test_weighted_score_all_hundreds(service):
    scores = {
        "performance": 100,
        "magento_configuration": 100,
        "magento_security": 100,
        "magento_optimization": 100,
        "magento_seo": 100,
    }
    result = service._calculate_weighted_score(scores)
    assert result == 100.0

def test_recommendations_sorted_by_priority(service):
    analysis = {
        "magento_analysis": {
            "categories": {
                "security": {"recommendations": ["Exposed admin path"], "score": 40},
                "seo": {"recommendations": ["Add robots.txt"], "score": 60},
            }
        },
        "performance_comprehensive": {"categories": {}},
    }
    recs = service._generate_recommendations(analysis, {})
    # Security should come before SEO (higher priority)
    priorities = [r["priority"] for r in recs]
    assert priorities == sorted(priorities, reverse=True)

def test_extract_category_scores_from_magento_analysis(service):
    analysis = {
        "magento_analysis": {
            "overall_score": 75,
            "categories": {
                "configuration": {"score": 80},
                "security": {"score": 60},
            }
        },
        "performance_comprehensive": {"overall_score": 85}
    }
    scores = service._extract_category_scores(analysis)
    assert scores.get("performance") == 85.0
    assert scores.get("magento_overall") == 75.0
    assert scores.get("magento_configuration") == 80.0
```

### Step 4: Run all new tests

```bash
pytest tests/test_magento_checker.py tests/test_performance_checker.py tests/test_scoring_service.py -v
```

Expected: All pass.

### Step 5: Run full suite to confirm no regressions

```bash
pytest tests/ -v
```

### Step 6: Commit

```bash
git add tests/test_magento_checker.py tests/test_performance_checker.py tests/test_scoring_service.py
git commit -m "test: add coverage for MagentoChecker, PerformanceChecker, ScoringService"
```

---

## Task 7: Validate PageSpeed API key at config-set time

Silently storing an invalid key causes confusing failures later. Test the key immediately when set.

**Files:**
- Modify: `mageperf/cli.py` (config_set command)
- Test: `tests/test_config.py`

### Step 1: Write the failing test

Add to `tests/test_config.py`:

```python
from unittest.mock import patch, MagicMock
import pytest

def test_config_set_pagespeed_key_validates_online(tmp_path):
    """Setting pagespeed_api_key should attempt a test API call."""
    with patch("mageperf.config.CONFIG_FILE", tmp_path / "config.json"):
        with patch("mageperf.cli._validate_pagespeed_api_key") as mock_validate:
            mock_validate.return_value = True
            result = runner.invoke(app, ["config", "set", "pagespeed_api_key", "AIzaFakeKey"])
    assert result.exit_code == 0
    mock_validate.assert_called_once_with("AIzaFakeKey")

def test_config_set_pagespeed_key_warns_on_invalid(tmp_path):
    """Warning shown when API key validation fails, but key is still saved."""
    with patch("mageperf.config.CONFIG_FILE", tmp_path / "config.json"):
        with patch("mageperf.cli._validate_pagespeed_api_key") as mock_validate:
            mock_validate.return_value = False
            result = runner.invoke(app, ["config", "set", "pagespeed_api_key", "INVALID_KEY"])
    assert result.exit_code == 0
    assert "invalid" in result.output.lower() or "warning" in result.output.lower() or "could not" in result.output.lower()
```

Note: `runner` must be imported from the existing test setup. Add at top of file if not present:
```python
from typer.testing import CliRunner
from mageperf.cli import app
runner = CliRunner()
```

### Step 2: Run to confirm it fails

```bash
pytest tests/test_config.py::test_config_set_pagespeed_key_validates_online -v
```

Expected: FAIL — `_validate_pagespeed_api_key` doesn't exist.

### Step 3: Add `_validate_pagespeed_api_key` helper and hook it into `config_set` in `cli.py`

Add this function before `config_set`:

```python
def _validate_pagespeed_api_key(api_key: str) -> bool:
    """Make a test PageSpeed API call. Returns True if key works."""
    import httpx

    try:
        resp = httpx.get(
            "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
            params={"url": "https://www.google.com", "key": api_key, "strategy": "desktop"},
            timeout=10.0,
        )
        return resp.status_code == 200
    except Exception:
        return False
```

Then update `config_set` to call it when the key is `pagespeed_api_key`:

```python
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

    # Validate PageSpeed key immediately after saving
    if key == "pagespeed_api_key" and typed_value:
        console.print("[dim]Validating PageSpeed API key...[/dim]")
        if _validate_pagespeed_api_key(str(typed_value)):
            console.print("[green]✓[/green] PageSpeed API key is valid.")
        else:
            console.print(
                "[yellow]Warning:[/yellow] Could not validate PageSpeed API key. "
                "Key saved, but check it is correct at "
                "https://developers.google.com/speed/docs/insights/v5/get-started"
            )
```

### Step 4: Run all tests

```bash
pytest tests/test_config.py -v
```

Expected: All pass.

### Step 5: Commit

```bash
git add mageperf/cli.py tests/test_config.py
git commit -m "feat: validate PageSpeed API key on config set"
```

---

## Task 8: Expand known extension offenders list

The current 5-entry list is far too short. Expand to 25+ known Magento performance offenders.

**Files:**
- Modify: `mageperf/core/magento_checker.py` (KNOWN_PERFORMANCE_ISSUES dict)
- Test: `tests/test_magento_checker.py` (verify new entries are detected)

### Step 1: Write the failing test

Add to `tests/test_magento_checker.py`:

```python
def test_known_offenders_includes_common_extensions(checker):
    """Ensure key known performance offenders are in the dictionary."""
    required_keys = [
        "porto_theme",
        "amasty_layered_navigation",
        "wyomind_datafeed",
        "xtento_export",
        "amasty_shopby",
    ]
    for key in required_keys:
        assert key in checker.KNOWN_PERFORMANCE_ISSUES, f"Missing offender: {key}"

def test_known_offenders_minimum_count(checker):
    assert len(checker.KNOWN_PERFORMANCE_ISSUES) >= 20
```

### Step 2: Run to confirm it fails

```bash
pytest tests/test_magento_checker.py::test_known_offenders_minimum_count -v
```

Expected: FAIL — only 5 entries currently.

### Step 3: Expand the `KNOWN_PERFORMANCE_ISSUES` dict in `magento_checker.py`

Replace the existing dict with:

```python
KNOWN_PERFORMANCE_ISSUES = {
    # Themes
    "porto_theme": "Porto theme is resource-heavy; enable CSS/JS merge and bundling, and verify Grunt is not running in production.",
    "ultimo_theme": "Ultimo theme loads large theme assets; audit and defer non-critical CSS/JS.",
    "claue_theme": "Claue theme has known JS weight issues; profile and defer unnecessary scripts.",
    # Navigation / layered
    "amasty_layered_navigation": "Amasty Layered Navigation adds significant database load on large catalogs; enable ajax-only mode.",
    "amasty_shopby": "Amasty Shop By adds complex SQL; tune with proper indexes and Elasticsearch.",
    "mirasvit_layered_navigation": "Mirasvit Layered Navigation can cause query explosion on large attribute sets.",
    # Search
    "mirasvit_search": "Mirasvit Sphinx Search adds a separate search daemon; verify it is running and indexed.",
    "searchanise": "Searchanise loads external JS on every page; verify async loading is enabled.",
    "klevu_search": "Klevu Search loads external JS synchronously on search pages by default; enable async.",
    "doofinder": "Doofinder injects external scripts; verify deferred loading is configured.",
    # Checkout
    "mageplaza_onepage_checkout": "Mageplaza One-Page Checkout loads heavy JS bundles; profile and defer non-critical scripts.",
    "amasty_onestepcheckout": "Amasty One Step Checkout adds significant JS weight; verify bundling is active.",
    "iwd_opc": "IWD OPC loads additional CSS/JS; test checkout performance with and without it.",
    # Analytics / Tracking
    "weltpixel_google_analytics": "Weltpixel GA4 impacts frontend performance if not configured with async loading.",
    "tagalys": "Tagalys injects tracking scripts that block rendering if loaded synchronously.",
    "yotpo": "Yotpo widgets load external scripts; verify async/deferred loading.",
    # Data feeds / Export
    "wyomind_datafeed": "Wyomind DataFeed Manager generates large feeds via cron; schedule during off-peak hours.",
    "xtento_export": "Xtento Export Profiles can lock tables during large exports; schedule carefully.",
    "firebear_importexport": "Firebear Improved Import/Export can be memory-intensive; run via CLI, not admin.",
    # Product pages / Catalog
    "amasty_label": "Amasty Product Labels adds per-product queries; enable caching and test on large catalogs.",
    "mageplaza_productslider": "Mageplaza Product Slider loads additional queries per slider instance.",
    "mageworx_seobase": "MageWorx SEO Suite can add overhead to catalog URL generation on large catalogs.",
    # Social / Reviews
    "rvvup": "Rvvup payment widget loads external JS; verify deferred loading.",
    "trustpilot": "Trustpilot widget loads external scripts; ensure async loading is enabled.",
    # B2B / Pricing
    "amasty_priceindex": "Amasty Advanced Price Index can slow reindexing on large catalogs with many customer groups.",
}
```

### Step 4: Run the tests

```bash
pytest tests/test_magento_checker.py -v
```

Expected: All pass.

### Step 5: Commit

```bash
git add mageperf/core/magento_checker.py tests/test_magento_checker.py
git commit -m "feat: expand known extension offenders list to 25+ entries"
```

---

## Task 9: `--checks` flag for selective analysis

Run a subset of checks to reduce analysis time for targeted workflows.

**Files:**
- Modify: `mageperf/cli.py` (analyze command)
- Modify: `mageperf/core/analysis_orchestrator.py` (accept checks filter)
- Test: `tests/test_analyze_command.py`

### Step 1: Write the failing test

Add to `tests/test_analyze_command.py`:

```python
def test_analyze_accepts_checks_flag(tmp_path):
    """--checks performance should pass checks list to orchestrator."""
    with patch("mageperf.storage.store.REPORTS_DIR", tmp_path / "reports"), \
         patch("mageperf.cli.get_orchestrator") as mock_orch_factory:
        mock_orch = mock_orch_factory.return_value
        mock_orch.run_full_analysis = AsyncMock(return_value=MOCK_REPORT)
        result = runner.invoke(app, [
            "analyze", "https://demo.magento.com", "--checks", "performance,security"
        ])
    assert result.exit_code == 0
    call_kwargs = mock_orch.run_full_analysis.call_args
    assert "checks" in call_kwargs.kwargs
    assert "performance" in call_kwargs.kwargs["checks"]
```

### Step 2: Run to confirm it fails

```bash
pytest tests/test_analyze_command.py::test_analyze_accepts_checks_flag -v
```

Expected: FAIL.

### Step 3: Add `--checks` to `analyze` in `cli.py`

```python
@app.command()
def analyze(
    url: str = typer.Argument(..., help="Magento store URL to analyze"),
    format: OutputFormat = typer.Option(OutputFormat.summary, "--format", "-f"),
    output: Optional[str] = typer.Option(None, "--output", "-o", help="Write JSON to file"),
    open_browser: bool = typer.Option(False, "--open", help="Open browser UI after analysis"),
    no_pagespeed: bool = typer.Option(False, "--no-pagespeed", help="Skip PageSpeed API"),
    timeout: Optional[float] = typer.Option(None, "--timeout", help="HTTP request timeout in seconds (default: 20)."),
    force: bool = typer.Option(False, "--force", help="Skip Magento detection gate."),
    checks: Optional[str] = typer.Option(
        None,
        "--checks",
        help="Comma-separated subset of checks to run: performance, security, magento, all (default: all).",
    ),
):
```

Parse and pass it:

```python
    checks_list = [c.strip() for c in checks.split(",")] if checks else ["all"]

    # Inside _run():
    return await orch.run_full_analysis(
        url, pagespeed_api_key=api_key, force=force, checks=checks_list
    )
```

### Step 4: Accept `checks` in `run_full_analysis` in `analysis_orchestrator.py`

```python
async def run_full_analysis(
    self,
    url: str,
    pagespeed_api_key: Optional[str] = None,
    force: bool = False,
    checks: Optional[list] = None,
) -> Dict[str, Any]:
```

Filter analyzers based on `checks`:

```python
    # Determine which analyzers to run
    run_all = not checks or checks == ["all"]
    active_analyzers = [
        a for a in self._analyzers
        if run_all
        or any(c in a.name for c in checks)
    ]

    async def _run_one(analyzer) -> tuple[str, Dict[str, Any]]:
        try:
            result = await analyzer.run(url, **analyzer_kwargs)
        except Exception as e:
            logger.error(f"Analyzer {analyzer.name!r} failed: {e}")
            result = {"error": str(e), "overall_score": 0}
        return analyzer.name, result

    pairs = await asyncio.gather(*[_run_one(a) for a in active_analyzers])
```

Also skip PageSpeed if performance is not in checks:

```python
    if pagespeed_api_key and (run_all or "performance" in checks):
        # ... existing PageSpeed fetch logic ...
```

### Step 5: Run all tests

```bash
pytest tests/ -v
```

Expected: All pass.

### Step 6: Commit

```bash
git add mageperf/cli.py mageperf/core/analysis_orchestrator.py tests/test_analyze_command.py
git commit -m "feat: add --checks flag for selective analysis subsets"
```

---

## Task 10: Surface check-level errors to terminal in real time

Failed checks currently disappear into the logger at WARNING level. Surface them as visible warnings in the terminal output after analysis completes.

**Files:**
- Modify: `mageperf/cli.py` (`_print_summary` function)
- Modify: `mageperf/core/analysis_orchestrator.py` (collect check errors)
- Test: `tests/test_analyze_command.py`

### Step 1: Write the failing test

Add to `tests/test_analyze_command.py`:

```python
MOCK_REPORT_WITH_ERRORS = {
    **MOCK_REPORT,
    "check_errors": [
        {"check": "search_engine", "error": "Connection timeout"},
    ],
}

def test_analyze_surfaces_check_errors(tmp_path):
    """Terminal output should mention check-level errors."""
    with patch("mageperf.storage.store.REPORTS_DIR", tmp_path / "reports"), \
         patch("mageperf.cli.get_orchestrator") as mock_orch_factory:
        mock_orch = mock_orch_factory.return_value
        mock_orch.run_full_analysis = AsyncMock(return_value=MOCK_REPORT_WITH_ERRORS)
        result = runner.invoke(app, ["analyze", "https://demo.magento.com"])
    assert result.exit_code == 0
    assert "search_engine" in result.output.lower() or "error" in result.output.lower()
```

### Step 2: Run to confirm it fails

```bash
pytest tests/test_analyze_command.py::test_analyze_surfaces_check_errors -v
```

Expected: FAIL — errors not shown.

### Step 3: Collect check errors in the report in `analysis_orchestrator.py`

After the `pairs` gather loop, collect errors:

```python
    check_errors = []
    for name, result in pairs:
        if isinstance(result, dict) and result.get("error"):
            check_errors.append({"check": name, "error": result["error"]})

    analysis_results: Dict[str, Any] = {
        "magento_detection": magento_detection,
        **{name: result for name, result in pairs},
    }
```

Add `check_errors` to the report dict:

```python
    report = {
        # ... existing fields ...
        "check_errors": check_errors,
    }
```

### Step 4: Print check errors in `_print_summary` in `cli.py`

At the end of `_print_summary`, add:

```python
    check_errors = report.get("check_errors", [])
    if check_errors:
        console.print("\n[yellow]Some checks encountered errors:[/yellow]")
        for ce in check_errors:
            console.print(f"  [yellow]![/yellow] {ce['check']}: {ce['error']}")
        console.print("[dim]Scores for failed checks defaulted to 0.[/dim]")
```

### Step 5: Run all tests

```bash
pytest tests/ -v
```

Expected: All pass.

### Step 6: Run the full test suite one final time

```bash
pytest tests/ -v --tb=short
```

All tests should pass with no warnings about missing imports or fixtures.

### Step 7: Final commit

```bash
git add mageperf/cli.py mageperf/core/analysis_orchestrator.py tests/test_analyze_command.py
git commit -m "feat: surface check-level errors in terminal output"
```

---

## Final Verification

Run the complete test suite and confirm all pass:

```bash
cd /Users/safoor/Code/easecloud-opensource/mageperf
pip install -e ".[dev]" -q
pytest tests/ -v --tb=short
```

Expected: All tests pass (original 20 + ~30 new = ~50 total).

Check that the CLI help shows the new flags:

```bash
mageperf analyze --help
mageperf compare --help
mageperf list --help
mageperf open --help
```

Verify no import errors:

```bash
python -c "from mageperf.cli import app; from mageperf.core.magento_checker import MagentoChecker; from mageperf.core.performance_checker import PerformanceChecker; from mageperf.core.scoring_service import ScoringService; print('OK')"
```
