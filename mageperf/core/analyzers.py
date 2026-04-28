"""
Built-in analyzer adapters.

Importing this module registers both adapters with the orchestrator registry.
To add a new analyzer: subclass BaseAnalyzer, implement `name` and `run()`,
then decorate with @register_analyzer. No other files need changing.
"""

from typing import Any, Dict, Optional

from mageperf.core.models import BaseAnalyzer, register_analyzer


@register_analyzer
class MagentoAnalyzer(BaseAnalyzer):
    """Runs all Magento-specific checks (config, security, optimization)."""

    @property
    def name(self) -> str:
        return "magento_analysis"

    async def run(self, url: str, **kwargs: Any) -> Dict[str, Any]:
        from mageperf.core.magento_checker import get_magento_checker

        checker = get_magento_checker()
        return await checker.run_all_checks(url, skip_invasive_checks=True)


@register_analyzer
class PerformanceAnalyzer(BaseAnalyzer):
    """Runs HTTP performance checks and optionally integrates PageSpeed results."""

    @property
    def name(self) -> str:
        return "performance_comprehensive"

    async def run(self, url: str, **kwargs: Any) -> Dict[str, Any]:
        from mageperf.core.performance_checker import get_performance_checker

        checker = get_performance_checker()
        pagespeed_results: Optional[Dict[str, Any]] = kwargs.get("pagespeed_results")
        return await checker.run_all_checks(url, pagespeed_results=pagespeed_results)
