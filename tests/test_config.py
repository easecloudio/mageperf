import json
import pytest
from pathlib import Path
from unittest.mock import patch

from mageperf.config import Config

@pytest.fixture
def tmp_config(tmp_path):
    config_dir = tmp_path / ".easecloud" / "mageperf"
    config_path = config_dir / "config.json"
    with patch("mageperf.config.CONFIG_DIR", config_dir), \
         patch("mageperf.config.CONFIG_PATH", config_path):
        yield config_path

def test_config_defaults(tmp_config):
    cfg = Config()
    assert cfg.get("server_port") == 4780
    assert cfg.get("default_format") == "summary"
    assert cfg.get("pagespeed_api_key") is None

def test_config_set_and_get(tmp_config):
    cfg = Config()
    cfg.set("pagespeed_api_key", "test-key-123")
    cfg2 = Config()  # reload from disk
    assert cfg2.get("pagespeed_api_key") == "test-key-123"

def test_config_persists_to_disk(tmp_config):
    cfg = Config()
    cfg.set("server_port", 5000)
    data = json.loads(tmp_config.read_text())
    assert data["server_port"] == 5000
