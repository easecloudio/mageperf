import json
import os
import sys
import tempfile
from pathlib import Path
from typing import Any

CONFIG_DIR = Path.home() / ".easecloud" / "mageperf"
CONFIG_PATH = CONFIG_DIR / "config.json"

DEFAULTS = {
    "server_port": 4780,
    "default_format": "summary",
    "pagespeed_api_key": None,
}


def _ensure_config_dir() -> None:
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    try:
        os.chmod(CONFIG_DIR, 0o700)
    except OSError:
        pass


class Config:
    def __init__(self):
        self._data = {**DEFAULTS}
        if CONFIG_PATH.exists():
            try:
                self._data.update(json.loads(CONFIG_PATH.read_text()))
            except json.JSONDecodeError:
                print(
                    f"Warning: config file {CONFIG_PATH} is corrupted and will be ignored. "
                    "Delete it to reset to defaults.",
                    file=sys.stderr,
                )
            except OSError:
                pass

    def get(self, key: str) -> Any:
        return self._data.get(key, DEFAULTS.get(key))

    def set(self, key: str, value: Any) -> None:
        self._data[key] = value
        _ensure_config_dir()
        # Atomic write: write to temp then rename
        fd, tmp = tempfile.mkstemp(dir=CONFIG_DIR, suffix=".tmp")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                json.dump(self._data, f, indent=2)
            try:
                os.chmod(tmp, 0o600)
            except OSError:
                pass
            os.replace(tmp, str(CONFIG_PATH))
        except Exception:
            try:
                os.unlink(tmp)
            except OSError:
                pass
            raise

    def all(self) -> dict:
        return dict(self._data)
