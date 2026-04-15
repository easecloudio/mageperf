import pytest
import json
from typer.testing import CliRunner
from unittest.mock import patch, AsyncMock
from mageperf.cli import app

runner = CliRunner()

MOCK_REPORT = {
    "id": "test-uuid-0001",
    "url": "https://demo.magento.com",
    "created_at": "2026-04-14T10:00:00Z",
    "status": "completed",
    "magento_version": "2.4.6",
    "overall_score": 74,
    "scores": {"performance": 82, "security": 61, "config": 79},
    "findings": [],
    "recommendations": [],
}

def test_analyze_outputs_summary(tmp_path):
    with patch("mageperf.storage.store.REPORTS_DIR", tmp_path / "reports"), \
         patch("mageperf.cli.get_orchestrator") as mock_orch_factory:
        mock_orch = mock_orch_factory.return_value
        mock_orch.run_full_analysis = AsyncMock(return_value=MOCK_REPORT)
        result = runner.invoke(app, ["analyze", "https://demo.magento.com"])
    assert result.exit_code == 0
    assert "74" in result.output

def test_analyze_json_format(tmp_path):
    with patch("mageperf.storage.store.REPORTS_DIR", tmp_path / "reports"), \
         patch("mageperf.cli.get_orchestrator") as mock_orch_factory:
        mock_orch = mock_orch_factory.return_value
        mock_orch.run_full_analysis = AsyncMock(return_value=MOCK_REPORT)
        result = runner.invoke(app, ["analyze", "https://demo.magento.com", "--format", "json"])
    assert result.exit_code == 0
    data = json.loads(result.output)
    assert data["overall_score"] == 74

def test_analyze_exits_1_on_failure(tmp_path):
    with patch("mageperf.storage.store.REPORTS_DIR", tmp_path / "reports"), \
         patch("mageperf.cli.get_orchestrator") as mock_orch_factory:
        mock_orch = mock_orch_factory.return_value
        mock_orch.run_full_analysis = AsyncMock(return_value={
            "status": "failed",
            "error": "Magento not detected",
            "id": "x",
        })
        result = runner.invoke(app, ["analyze", "https://notmagento.com"])
    assert result.exit_code == 1
