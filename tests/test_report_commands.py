import pytest
from typer.testing import CliRunner
from unittest.mock import patch
from mageperf.cli import app

runner = CliRunner()

_ID_1 = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
_ID_2 = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"

SAMPLE_REPORTS = [
    {
        "id": _ID_1,
        "url": "https://a.com",
        "created_at": "2026-04-14T10:00:00Z",
        "overall_score": 80,
        "status": "completed",
    },
    {
        "id": _ID_2,
        "url": "https://b.com",
        "created_at": "2026-04-13T10:00:00Z",
        "overall_score": 65,
        "status": "completed",
    },
]


def test_list_shows_reports():
    with patch("mageperf.cli.ReportStore") as MockStore:
        MockStore.return_value.list.return_value = SAMPLE_REPORTS
        result = runner.invoke(app, ["list"])
    assert result.exit_code == 0
    assert "a.com" in result.output
    assert "b.com" in result.output


def test_list_empty():
    with patch("mageperf.cli.ReportStore") as MockStore:
        MockStore.return_value.list.return_value = []
        result = runner.invoke(app, ["list"])
    assert result.exit_code == 0
    assert "No reports" in result.output


def test_clean_removes_all(tmp_path):
    with patch("mageperf.storage.store.REPORTS_DIR", tmp_path / "reports"):
        from mageperf.storage.store import ReportStore
        s = ReportStore()
        s.save({"id": _ID_1, "url": "https://x.com"})
        result = runner.invoke(app, ["clean", "--force"])
    assert result.exit_code == 0
    assert "Deleted 1" in result.output
