import json
import pytest
from typer.testing import CliRunner
from unittest.mock import patch, AsyncMock
from mageperf.cli import app

runner = CliRunner()

_REPORT_UUID = "12345678-1234-5678-abcd-567812345678"

MOCK_REPORT = {
    "id": _REPORT_UUID,
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


def test_analyze_rejects_url_without_scheme(tmp_path):
    result = runner.invoke(app, ["analyze", "store.example.com"])
    assert result.exit_code != 0
    assert "http" in result.output.lower() or "http" in (result.stderr or "").lower()


def test_analyze_rejects_non_http_scheme(tmp_path):
    result = runner.invoke(app, ["analyze", "ftp://store.example.com"])
    assert result.exit_code != 0


def test_analyze_force_skips_detection_gate(tmp_path):
    """--force should pass force=True to run_full_analysis."""
    with patch("mageperf.storage.store.REPORTS_DIR", tmp_path / "reports"), \
         patch("mageperf.cli.get_orchestrator") as mock_orch_factory:
        mock_orch = mock_orch_factory.return_value
        mock_orch.run_full_analysis = AsyncMock(return_value=MOCK_REPORT)
        result = runner.invoke(app, [
            "analyze", "https://hardened-store.com", "--force"
        ])
    call_kwargs = mock_orch.run_full_analysis.call_args
    assert call_kwargs.kwargs["force"] is True
    assert result.exit_code == 0


@pytest.mark.asyncio
async def test_orchestrator_force_bypasses_detection_gate():
    """When force=True, orchestrator must proceed even when is_magento=False."""
    from unittest.mock import AsyncMock, patch
    from mageperf.core.analysis_orchestrator import AnalysisOrchestrator

    orch = AnalysisOrchestrator()

    mock_detection = {"is_magento": False, "confidence": 0}
    mock_scores = {
        "overall_score": 50,
        "grade": "C",
        "category_scores": {},
        "recommendations": [],
    }

    with patch.object(orch._magento_checker, "detect_magento_presence", AsyncMock(return_value=mock_detection)), \
         patch.object(orch._scoring_service, "calculate_comprehensive_score", return_value=mock_scores), \
         patch("mageperf.core.analysis_orchestrator.validate_url_not_ssrf"), \
         patch.object(orch, "_analyzers", []):

        report = await orch.run_full_analysis("https://hardened-store.com", force=True)

    assert report.get("status") == "completed"
