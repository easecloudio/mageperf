import json
from pathlib import Path
from typing import Any

CONFIG_DIR = Path.home() / ".easecloud" / "mageperf"
CONFIG_PATH = CONFIG_DIR / "config.json"

DEFAULTS = {
    "server_port": 4780,
    "default_format": "summary",
    "pagespeed_api_key": None,
}

class Config:
    def __init__(self):
        self._data = {**DEFAULTS}
        if CONFIG_PATH.exists():
            try:
                self._data.update(json.loads(CONFIG_PATH.read_text()))
            except (json.JSONDecodeError, OSError):
                pass

    def get(self, key: str) -> Any:
        return self._data.get(key, DEFAULTS.get(key))

    def set(self, key: str, value: Any) -> None:
        self._data[key] = value
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        CONFIG_PATH.write_text(json.dumps(self._data, indent=2))

    def all(self) -> dict:
        return dict(self._data)
