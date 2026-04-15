import pytest
from unittest.mock import patch
from mageperf.storage.store import ReportStore

@pytest.fixture
def store(tmp_path):
    with patch("mageperf.storage.store.REPORTS_DIR", tmp_path / "reports"):
        yield ReportStore()

def test_save_and_get_report(store):
    report = {"id": "abc123", "url": "https://test.com", "overall_score": 74}
    store.save(report)
    fetched = store.get("abc123")
    assert fetched["url"] == "https://test.com"

def test_list_reports(store):
    store.save({"id": "r1", "url": "https://a.com", "created_at": "2026-01-01T00:00:00Z"})
    store.save({"id": "r2", "url": "https://b.com", "created_at": "2026-01-02T00:00:00Z"})
    reports = store.list()
    assert len(reports) == 2

def test_get_nonexistent_returns_none(store):
    assert store.get("doesnotexist") is None

def test_delete_report(store):
    store.save({"id": "del1", "url": "https://x.com"})
    assert store.delete("del1") is True
    assert store.get("del1") is None
    assert store.delete("del1") is False  # already deleted
