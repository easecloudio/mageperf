import json
import threading
import time
from unittest.mock import patch

import httpx
import pytest

from mageperf.server.server import LocalServer

_REPORT_UUID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
_PORT = 14780


@pytest.fixture
def server_with_reports(tmp_path):
    reports_dir = tmp_path / "reports"
    reports_dir.mkdir()
    (reports_dir / f"{_REPORT_UUID}.json").write_text(
        json.dumps({"id": _REPORT_UUID, "url": "https://a.com", "overall_score": 80})
    )
    static_dir = tmp_path / "static"
    static_dir.mkdir()
    (static_dir / "index.html").write_text("<html>mageperf</html>")

    with patch("mageperf.storage.store.REPORTS_DIR", reports_dir), \
         patch("mageperf.server.server.STATIC_DIR", static_dir):
        srv = LocalServer(port=_PORT)
        thread = threading.Thread(target=srv.serve, daemon=True)
        thread.start()
        time.sleep(0.3)
        yield srv
        srv.shutdown()
        thread.join(timeout=2.0)


def test_api_reports_list(server_with_reports):
    r = httpx.get(f"http://localhost:{_PORT}/api/reports")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 1
    assert data[0]["id"] == _REPORT_UUID


def test_api_reports_get(server_with_reports):
    r = httpx.get(f"http://localhost:{_PORT}/api/reports/{_REPORT_UUID}")
    assert r.status_code == 200
    assert r.json()["overall_score"] == 80


def test_api_reports_invalid_id_returns_404(server_with_reports):
    r = httpx.get(f"http://localhost:{_PORT}/api/reports/not-a-uuid")
    assert r.status_code == 404


def test_api_reports_nonexistent_uuid_returns_404(server_with_reports):
    r = httpx.get(f"http://localhost:{_PORT}/api/reports/ffffffff-ffff-ffff-ffff-ffffffffffff")
    assert r.status_code == 404


def test_static_files(server_with_reports):
    r = httpx.get(f"http://localhost:{_PORT}/")
    assert r.status_code == 200
    assert "mageperf" in r.text


def test_security_headers_present(server_with_reports):
    r = httpx.get(f"http://localhost:{_PORT}/api/reports")
    assert r.headers.get("x-content-type-options") == "nosniff"
    assert r.headers.get("x-frame-options") == "DENY"
    assert "no-store" in r.headers.get("cache-control", "")


def test_no_wildcard_cors(server_with_reports):
    r = httpx.get(f"http://localhost:{_PORT}/api/reports")
    assert r.headers.get("access-control-allow-origin") != "*"
