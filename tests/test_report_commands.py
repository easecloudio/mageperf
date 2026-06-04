import pytest
from typer.testing import CliRunner
from unittest.mock import patch, MagicMock
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
    # The # column header or index values must appear
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

def test_open_by_out_of_range_index_exits_1(tmp_path):
    with patch("mageperf.storage.store.REPORTS_DIR", tmp_path / "reports"):
        store_mock = MagicMock()
        store_mock.list.return_value = _REPORTS_LIST
        with patch("mageperf.cli.ReportStore", return_value=store_mock):
            result = runner.invoke(app, ["open", "99"])
    assert result.exit_code == 1
