import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from mageperf.core.performance_checker import PerformanceChecker


@pytest.fixture
def checker():
    return PerformanceChecker()


def test_response_score_penalizes_slow_ttfb(checker):
    results = {"homepage_ttfb": 900, "catalog_ttfb": 200}
    score = checker._calculate_response_score(results)
    assert score == 80.0  # 100 - 20 for homepage > 800ms


def test_response_score_no_penalty_for_fast_ttfb(checker):
    results = {"homepage_ttfb": 150}
    score = checker._calculate_response_score(results)
    assert score == 100.0


def test_response_score_medium_ttfb_deducts_10(checker):
    results = {"homepage_ttfb": 600}
    score = checker._calculate_response_score(results)
    assert score == 90.0  # 100 - 10 for 500 < ttfb <= 800


def test_cache_score_penalizes_no_fpc_and_no_varnish(checker):
    results = {"magento_fpc_enabled": False, "varnish_detected": False}
    score = checker._calculate_cache_score(results)
    assert score == 50.0  # 100 - 30 - 20


def test_cache_score_perfect_when_both_enabled(checker):
    results = {"magento_fpc_enabled": True, "varnish_detected": True}
    score = checker._calculate_cache_score(results)
    assert score == 100.0


def test_circuit_breaker_opens_after_threshold(checker):
    for _ in range(checker.pagespeed_failure_threshold):
        checker._record_pagespeed_failure()
    assert checker._is_pagespeed_circuit_open() is True


def test_circuit_breaker_resets_on_success(checker):
    for _ in range(checker.pagespeed_failure_threshold):
        checker._record_pagespeed_failure()
    checker._reset_pagespeed_circuit()
    assert checker._is_pagespeed_circuit_open() is False
    assert checker.pagespeed_failures == 0


def test_circuit_breaker_closed_by_default(checker):
    assert checker._is_pagespeed_circuit_open() is False


@pytest.mark.asyncio
async def test_measure_ttfb_returns_float_milliseconds(checker):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.content = b"hello"
    mock_response.history = []
    mock_response.url = "https://demo.magento.com"
    with patch("mageperf.core.performance_checker.http_client") as mock_client:
        mock_client.get_with_retry = AsyncMock(return_value=mock_response)
        result = await checker.measure_ttfb("https://demo.magento.com")
    assert "ttfb_ms" in result
    assert isinstance(result["ttfb_ms"], float)
    assert result["ttfb_ms"] >= 0


def test_overall_score_weighted_correctly(checker):
    checks = {
        "response_time": {"score": 100},
        "frontend_performance": {"score": 100},
        "asset_optimization": {"score": 100},
        "caching": {"score": 100},
        "server_configuration": {"score": 100},
    }
    score = checker.calculate_overall_score(checks)
    assert score == 100.0
