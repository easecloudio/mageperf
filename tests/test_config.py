import json
import pytest
from pathlib import Path
from unittest.mock import patch

from typer.testing import CliRunner
from mageperf.cli import app
from mageperf.config import Config

runner = CliRunner()

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


def test_config_set_pagespeed_key_validates_online(tmp_path):
    """Setting pagespeed_api_key should call _validate_pagespeed_api_key."""
    with patch("mageperf.config.CONFIG_PATH", tmp_path / "config.json"), \
         patch("mageperf.cli._validate_pagespeed_api_key") as mock_validate:
        mock_validate.return_value = True
        result = runner.invoke(app, ["config", "set", "pagespeed_api_key", "AIzaFakeKey"])
    assert result.exit_code == 0
    mock_validate.assert_called_once_with("AIzaFakeKey")


def test_config_set_pagespeed_key_warns_on_invalid(tmp_path):
    """Warning shown when API key fails validation; key is still saved."""
    with patch("mageperf.config.CONFIG_PATH", tmp_path / "config.json"), \
         patch("mageperf.cli._validate_pagespeed_api_key") as mock_validate:
        mock_validate.return_value = False
        result = runner.invoke(app, ["config", "set", "pagespeed_api_key", "INVALID_KEY"])
    assert result.exit_code == 0
    output = result.output.lower()
    assert "warning" in output or "invalid" in output or "could not" in output
