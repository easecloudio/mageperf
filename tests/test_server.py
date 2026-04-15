import pytest
import json
import threading
import time
import httpx
from unittest.mock import patch
from pathlib import Path

from mageperf.server.server import LocalServer

@pytest.fixture
def server_with_reports(tmp_path):
    reports_dir = tmp_path / "reports"
    reports_dir.mkdir()
    (reports_dir / "r1.json").write_text(
        json.dumps({"id": "r1", "url": "https://a.com", "overall_score": 80})
    )
    static_dir = tmp_path / "static"
    static_dir.mkdir()
    (static_dir / "index.html").write_text("<html>mageperf</html>")
    with patch("mageperf.storage.store.REPORTS_DIR", reports_dir), \
         patch("mageperf.server.server.STATIC_DIR", static_dir):
        srv = LocalServer(port=14780)
        thread = threading.Thread(target=srv.serve, daemon=True)
        thread.start()
        time.sleep(0.3)
        yield srv

def test_api_reports_list(server_with_reports):
    r = httpx.get("http://localhost:14780/api/reports")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 1
    assert data[0]["id"] == "r1"

def test_api_reports_get(server_with_reports):
    r = httpx.get("http://localhost:14780/api/reports/r1")
    assert r.status_code == 200
    assert r.json()["overall_score"] == 80

def test_api_reports_404(server_with_reports):
    r = httpx.get("http://localhost:14780/api/reports/nope")
    assert r.status_code == 404

def test_static_files(server_with_reports):
    r = httpx.get("http://localhost:14780/")
    assert r.status_code == 200
    assert "mageperf" in r.text
