import pytest
from unittest.mock import patch
from mageperf.storage.store import ReportStore

_ID_1 = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
_ID_2 = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
_ID_DEL = "cccccccc-cccc-cccc-cccc-cccccccccccc"


@pytest.fixture
def store(tmp_path):
    reports_dir = tmp_path / "reports"
    with patch("mageperf.storage.store.REPORTS_DIR", reports_dir):
        yield ReportStore()


def test_save_and_get_report(store):
    report = {"id": _ID_1, "url": "https://test.com", "overall_score": 74}
    store.save(report)
    fetched = store.get(_ID_1)
    assert fetched["url"] == "https://test.com"


def test_list_reports(store):
    store.save({"id": _ID_1, "url": "https://a.com", "created_at": "2026-01-01T00:00:00Z"})
    store.save({"id": _ID_2, "url": "https://b.com", "created_at": "2026-01-02T00:00:00Z"})
    reports = store.list()
    assert len(reports) == 2


def test_get_nonexistent_returns_none(store):
    assert store.get(_ID_1) is None


def test_get_invalid_id_returns_none(store):
    assert store.get("not-a-uuid") is None
    assert store.get("../../../etc/passwd") is None


def test_delete_report(store):
    store.save({"id": _ID_DEL, "url": "https://x.com"})
    assert store.delete(_ID_DEL) is True
    assert store.get(_ID_DEL) is None
    assert store.delete(_ID_DEL) is False  # already deleted


def test_save_rejects_invalid_id(store):
    with pytest.raises(ValueError, match="Invalid report ID"):
        store.save({"id": "not-a-uuid", "url": "https://x.com"})


def test_list_empty_when_dir_missing(tmp_path):
    with patch("mageperf.storage.store.REPORTS_DIR", tmp_path / "nonexistent"):
        reports = ReportStore().list()
    assert reports == []
