import json
import mimetypes
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from typing import Optional

from mageperf.storage.store import ReportStore
from mageperf.utils.logger import logger

STATIC_DIR = Path(__file__).parent / "static"


class _Handler(BaseHTTPRequestHandler):
    _store: ReportStore  # set by LocalServer

    def log_message(self, format, *args):
        pass  # suppress default access logs

    def do_GET(self):
        path = self.path.split("?")[0]

        # API routes
        if path == "/api/reports":
            self._json(self._store.list())
        elif path.startswith("/api/reports/"):
            report_id = path[len("/api/reports/"):]
            report = self._store.get(report_id)
            if report:
                self._json(report)
            else:
                self._not_found()
        else:
            self._static(path)

    def _json(self, data):
        body = json.dumps(data, default=str).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _not_found(self):
        self.send_response(404)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()

    def _static(self, path: str):
        if path in ("/", ""):
            file_path = STATIC_DIR / "index.html"
        else:
            file_path = STATIC_DIR / path.lstrip("/")

        # Next.js static export uses trailingSlash — serve directory's index.html
        if file_path.is_dir():
            file_path = file_path / "index.html"

        # SPA fallback — all other unmatched routes serve root index.html
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
        self.end_headers()
        self.wfile.write(body)


class LocalServer:
    def __init__(self, port: int = 4780):
        self.port = port
        self._httpd: Optional[HTTPServer] = None
        # Create handler class with shared store
        store = ReportStore()

        class Handler(_Handler):
            _store = store

        self._handler_class = Handler

    def serve(self) -> None:
        self._httpd = HTTPServer(("localhost", self.port), self._handler_class)
        self._httpd.serve_forever()

    def shutdown(self) -> None:
        if self._httpd:
            self._httpd.shutdown()
