import json
import mimetypes
import re
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Optional

from mageperf.storage.store import ReportStore
from mageperf.utils.logger import logger

STATIC_DIR = Path(__file__).parent / "static"

_UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
)

_SECURITY_HEADERS = [
    ("X-Content-Type-Options", "nosniff"),
    ("X-Frame-Options", "DENY"),
    ("Referrer-Policy", "no-referrer"),
    (
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;",
    ),
    ("Cache-Control", "no-store"),
]


class _Handler(BaseHTTPRequestHandler):
    _store: ReportStore  # set by LocalServer
    _allowed_hosts: tuple  # set by LocalServer

    def log_message(self, format, *args):
        pass  # suppress default access logs

    def _check_host(self) -> bool:
        host = self.headers.get("Host", "")
        # Reject DNS-rebinding: only localhost / 127.0.0.1 are valid origins.
        # Strip port component before comparing.
        hostname = host.split(":")[0].lower()
        return hostname in self._allowed_hosts

    def do_GET(self):
        if not self._check_host():
            self.send_response(400)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"Bad Request")
            return

        path = self.path.split("?")[0]

        if path == "/api/reports":
            self._json(self._store.list())
        elif path.startswith("/api/reports/"):
            report_id = path[len("/api/reports/"):]
            if not _UUID_RE.match(report_id):
                self._not_found()
                return
            report = self._store.get(report_id)
            if report:
                self._json(report)
            else:
                self._not_found()
        else:
            self._static(path)

    def _add_security_headers(self):
        for name, value in _SECURITY_HEADERS:
            self.send_header(name, value)

    def _json(self, data):
        body = json.dumps(data, default=str).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self._add_security_headers()
        self.end_headers()
        self.wfile.write(body)

    def _not_found(self):
        self.send_response(404)
        self.send_header("Content-Type", "text/plain")
        self._add_security_headers()
        self.end_headers()

    def _static(self, path: str):
        static_root = STATIC_DIR.resolve()

        if path in ("/", ""):
            file_path = STATIC_DIR / "index.html"
        else:
            try:
                candidate = (STATIC_DIR / path.lstrip("/")).resolve()
            except Exception:
                self._not_found()
                return
            # Containment check — prevent path traversal
            if not str(candidate).startswith(str(static_root) + "/") and candidate != static_root:
                self._not_found()
                return
            file_path = candidate

        # Next.js static export uses trailingSlash — serve directory's index.html
        if file_path.is_dir():
            file_path = file_path / "index.html"

        # SPA fallback — unmatched routes serve root index.html
        if not file_path.exists():
            file_path = STATIC_DIR / "index.html"

        if not file_path.exists():
            self._not_found()
            return

        mime, _ = mimetypes.guess_type(str(file_path))
        body = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", mime or "application/octet-stream")
        self.send_header("Content-Length", str(len(body)))
        self._add_security_headers()
        self.end_headers()
        self.wfile.write(body)


class LocalServer:
    def __init__(self, port: int = 4780):
        self.port = port
        self._httpd: Optional[ThreadingHTTPServer] = None

        if not STATIC_DIR.exists():
            logger.warning(
                "UI static files not found at %s — run 'cd ui && npm install && npm run build' first.",
                STATIC_DIR,
            )

        store = ReportStore()
        allowed_hosts = ("localhost", "127.0.0.1", "")

        class Handler(_Handler):
            _store = store
            _allowed_hosts = allowed_hosts

        self._handler_class = Handler

    def serve(self) -> None:
        self._httpd = ThreadingHTTPServer(("localhost", self.port), self._handler_class)
        self._httpd.serve_forever()

    def shutdown(self) -> None:
        if self._httpd:
            self._httpd.shutdown()
