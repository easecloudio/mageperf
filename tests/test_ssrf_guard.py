"""SSRF guard: every connection made by the shared client must be validated."""
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pytest

from mageperf.utils import security
from mageperf.utils.http_client import HTTPClient
from mageperf.utils.security import SSRFBlockedError, _is_private_ip


class _Recorder(BaseHTTPRequestHandler):
    hits: list = []
    redirect_to: str = ""

    def _handle(self):
        type(self).hits.append((self.command, self.path))
        if self.path == "/redirect" and type(self).redirect_to:
            self.send_response(302)
            self.send_header("Location", type(self).redirect_to)
        else:
            self.send_response(200)
            self.send_header("Server", "internal-admin-panel/9.9")
        self.send_header("Content-Length", "0")
        self.end_headers()

    do_GET = do_HEAD = _handle

    def log_message(self, *args):
        pass


@pytest.fixture
def server():
    handler = type("Handler", (_Recorder,), {"hits": [], "redirect_to": ""})
    httpd = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    yield httpd, handler
    httpd.shutdown()
    httpd.server_close()


@pytest.fixture
async def client():
    c = HTTPClient()
    yield c
    await c.close()


@pytest.mark.parametrize(
    "ip",
    ["127.0.0.1", "10.0.0.1", "172.16.0.1", "192.168.1.1", "169.254.169.254",
     "100.64.0.1", "0.0.0.0", "::1", "fe80::1", "fc00::1", "::ffff:127.0.0.1",
     "::ffff:169.254.169.254", "not-an-ip"],
)
def test_non_public_addresses_blocked(ip):
    assert _is_private_ip(ip)


@pytest.mark.parametrize("ip", ["93.184.215.14", "8.8.8.8", "2606:4700:4700::1111"])
def test_public_addresses_allowed(ip):
    assert not _is_private_ip(ip)


@pytest.mark.asyncio
@pytest.mark.parametrize("method", ["get_with_retry", "head_with_retry"])
async def test_direct_internal_request_never_connects(server, client, method):
    httpd, handler = server
    url = f"http://127.0.0.1:{httpd.server_port}/internal-admin/theme.css"
    with pytest.raises(SSRFBlockedError):
        await getattr(client, method)(url)
    assert handler.hits == []


@pytest.mark.asyncio
async def test_redirect_to_internal_host_blocked(server, client, monkeypatch):
    """A 'public' page that 302s to an internal host must not reach it."""
    httpd, handler = server
    port = httpd.server_port

    # Treat the local test server as the public store; 10.x stays private.
    monkeypatch.setattr(security, "_is_private_ip", lambda ip: ip != "127.0.0.1")

    async def fake_resolve(host, _port):
        return {"store.test": ["127.0.0.1"], "internal.test": ["10.255.255.1"]}[host]

    monkeypatch.setattr(security, "_resolve", fake_resolve)
    handler.redirect_to = f"http://internal.test:{port}/internal-admin/metrics"

    with pytest.raises(SSRFBlockedError, match="10.255.255.1"):
        await client.get_with_retry(f"http://store.test:{port}/redirect")
    assert handler.hits == [("GET", "/redirect")]


@pytest.mark.asyncio
async def test_connects_to_validated_address(server, client, monkeypatch):
    """The socket goes to the address that was checked, not a second lookup."""
    httpd, handler = server
    monkeypatch.setattr(security, "_is_private_ip", lambda ip: ip != "127.0.0.1")
    calls = []

    async def fake_resolve(host, _port):
        calls.append(host)
        return ["127.0.0.1"]

    monkeypatch.setattr(security, "_resolve", fake_resolve)

    resp = await client.get_with_retry(f"http://store.test:{httpd.server_port}/ok")
    assert resp.status_code == 200
    assert calls == ["store.test"]
    assert handler.hits == [("GET", "/ok")]


@pytest.mark.asyncio
async def test_blocked_request_is_not_retried(server, client, monkeypatch):
    calls = []
    real_resolve = security._resolve

    async def counting_resolve(host, port):
        calls.append(host)
        return await real_resolve(host, port)

    monkeypatch.setattr(security, "_resolve", counting_resolve)
    httpd, _ = server
    with pytest.raises(SSRFBlockedError):
        await client.get_with_retry(f"http://127.0.0.1:{httpd.server_port}/", backoff_factor=0)
    assert len(calls) == 1
