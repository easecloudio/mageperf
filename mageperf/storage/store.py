import json
from pathlib import Path
from typing import Any, Optional, List

REPORTS_DIR = Path.home() / ".easecloud" / "mageperf" / "reports"

class ReportStore:
    def save(self, report: dict) -> None:
        REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        report_id = report["id"]
        path = REPORTS_DIR / f"{report_id}.json"
        path.write_text(json.dumps(report, indent=2, default=str))

    def get(self, report_id: str) -> Optional[dict]:
        path = REPORTS_DIR / f"{report_id}.json"
        if not path.exists():
            return None
        return json.loads(path.read_text())

    def list(self) -> List[dict]:
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
        path = REPORTS_DIR / f"{report_id}.json"
        if path.exists():
            path.unlink()
            return True
        return False
