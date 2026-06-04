import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from mageperf.core.magento_checker import MagentoChecker


@pytest.fixture
def checker():
    return MagentoChecker()


@pytest.mark.asyncio
async def test_search_engine_check_returns_check_result(checker):
    """check_search_engine must return a CheckResult."""
    from mageperf.core.models import CheckResult
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.headers = {}
    mock_response.text = "<html><body>results</body></html>"
    with patch("mageperf.core.magento_checker.http_client") as mock_client:
        mock_client.get_with_retry = AsyncMock(return_value=mock_response)
        result = await checker.check_search_engine("https://demo.magento.com")
    assert isinstance(result, CheckResult)


@pytest.mark.asyncio
async def test_search_engine_detects_elasticsearch_header(checker):
    """x-search-engine header should be captured in details."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.headers = {"x-search-engine": "elasticsearch"}
    mock_response.text = "<html><body>results</body></html>"
    with patch("mageperf.core.magento_checker.http_client") as mock_client:
        mock_client.get_with_retry = AsyncMock(return_value=mock_response)
        result = await checker.check_search_engine("https://demo.magento.com")
    assert result.details.get("search_engine_detected") == "elasticsearch"
    assert result.score > 60


@pytest.mark.asyncio
async def test_search_engine_slow_ttfb_adds_recommendation(checker):
    """Very slow search TTFB (simulated) should add a recommendation about MySQL search."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.headers = {}
    mock_response.text = "<html><body>results</body></html>"

    import time as time_module
    call_times = [0.0, 2.0]  # start=0, end=2 -> 2000ms
    call_count = {"n": 0}

    def fake_time():
        val = call_times[min(call_count["n"], len(call_times) - 1)]
        call_count["n"] += 1
        return val

    with patch("mageperf.core.magento_checker.http_client") as mock_client, \
         patch("mageperf.core.magento_checker.time") as mock_time:
        mock_time.time = fake_time
        mock_client.get_with_retry = AsyncMock(return_value=mock_response)
        result = await checker.check_search_engine("https://demo.magento.com")

    assert any("search" in r.lower() or "mysql" in r.lower() for r in result.recommendations)


def test_configuration_score_deducts_for_dev_mode(checker):
    results = {"production_mode": False, "static_signing": True, "maintenance_exposed": False}
    score = checker._calculate_configuration_score(results)
    assert score == 70.0

def test_security_score_deducts_for_missing_headers(checker):
    results = {
        "admin_path_secure": True,
        "sensitive_files_exposed": False,
        "has_X-Frame-Options": False,
        "has_X-Content-Type-Options": False,
        "has_X-XSS-Protection": False,
    }
    score = checker._calculate_security_score(results)
    assert score == 70.0

def test_optimization_score_deducts_for_missing_merging(checker):
    results = {"css_merged": False, "js_merged": False, "js_bundling": False, "total_images": 0}
    score = checker._calculate_optimization_score(results)
    assert score == 55.0

def test_extension_score_penalizes_known_offenders(checker):
    results = {"known_performance_offenders": ["porto_theme", "amasty_layered_navigation"], "extension_resource_count": 5}
    score = checker._calculate_extension_score(results)
    assert score == 70.0

def test_seo_score_zero_without_robots_txt(checker):
    results = {"robots_txt_found": False}
    score = checker._calculate_seo_score(results)
    assert score == 0.0
