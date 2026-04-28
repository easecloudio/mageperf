import json
import os
import re
import tempfile
from pathlib import Path
from typing import Any, List, Optional

REPORTS_DIR = Path.home() / ".easecloud" / "mageperf" / "reports"

_UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
)


def _ensure_reports_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)
    try:
        os.chmod(path, 0o700)
    except OSError:
        pass


class ReportStore:
    def save(self, report: dict) -> None:
        _ensure_reports_dir(REPORTS_DIR)
        report_id = str(report["id"])
        if not _UUID_RE.match(report_id):
            raise ValueError(f"Invalid report ID (must be UUID): {report_id!r}")
        path = REPORTS_DIR / f"{report_id}.json"
        # Atomic write: write to temp then rename
        fd, tmp = tempfile.mkstemp(dir=REPORTS_DIR, suffix=".tmp")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                json.dump(report, f, indent=2, default=str)
            try:
                os.chmod(tmp, 0o600)
            except OSError:
                pass
            os.replace(tmp, str(path))
        except Exception:
            try:
                os.unlink(tmp)
            except OSError:
                pass
            raise

    def get(self, report_id: str) -> Optional[dict]:
        if not _UUID_RE.match(str(report_id)):
            return None
        path = REPORTS_DIR / f"{report_id}.json"
        if not path.exists():
            return None
        return json.loads(path.read_text())

    def list(self) -> List[dict]:
        if not REPORTS_DIR.exists():
            return []
        reports = []
        paths = sorted(
            REPORTS_DIR.glob("*.json"),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )
        for path in paths:
            try:
                data = json.loads(path.read_text())
                reports.append(data)
            except (json.JSONDecodeError, OSError):
                continue
        return reports

    def delete(self, report_id: str) -> bool:
        if not _UUID_RE.match(str(report_id)):
            return False
        path = REPORTS_DIR / f"{report_id}.json"
        if path.exists():
            path.unlink()
            return True
        return False
