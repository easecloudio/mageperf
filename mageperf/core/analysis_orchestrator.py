"""
Analysis Orchestrator — CLI version
Stripped of MongoDB, RQ, WebSocket, and auth dependencies.
Progress is reported via an optional callback(message, percent).
"""

import asyncio
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Callable

from mageperf.core.magento_checker import get_magento_checker
from mageperf.core.performance_checker import get_performance_checker
from mageperf.core.scoring_service import get_scoring_service
from mageperf.utils.logger import logger


ProgressCallback = Optional[Callable[[str, int], None]]


class AnalysisOrchestrator:
    def __init__(self, progress_callback: ProgressCallback = None):
        self.magento_checker = get_magento_checker()
        self.performance_checker = get_performance_checker()
        self.scoring_service = get_scoring_service()
        self._progress = progress_callback or (lambda msg, pct: None)

    async def run_full_analysis(
        self, url: str, pagespeed_api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        task_id = str(uuid.uuid4())
        started_at = datetime.now(timezone.utc)

        self._progress("Starting analysis", 5)

        # Layer 1: Magento detection
        self._progress("Detecting Magento", 15)
        try:
            magento_detection = await self.magento_checker.detect_magento_presence(url)
        except Exception as e:
            logger.error(f"Magento detection failed: {e}")
            magento_detection = {"is_magento": False, "error": str(e)}

        if not magento_detection.get("is_magento"):
            return {
                "id": task_id,
                "url": url,
                "created_at": started_at.isoformat(),
                "status": "failed",
                "error": "Magento not detected at this URL",
            }

        # Layer 2: Magento-specific checks
        self._progress("Running Magento checks", 30)
        try:
            magento_analysis = await self.magento_checker.run_all_checks(
                url, skip_invasive_checks=True
            )
        except Exception as e:
            logger.error(f"Magento checks failed: {e}")
            magento_analysis = {"error": str(e), "overall_score": 0, "categories": {}}

        # Layer 3: Performance checks (parallel PageSpeed + HTTP checks)
        self._progress("Running performance checks", 55)
        try:
            # Fetch PageSpeed data if an API key is configured
            pagespeed_results: Optional[Dict[str, Any]] = None
            if pagespeed_api_key:
                desktop, mobile = await asyncio.gather(
                    self.performance_checker.fetch_pagespeed_insights(
                        url, strategy="desktop"
                    ),
                    self.performance_checker.fetch_pagespeed_insights(
                        url, strategy="mobile"
                    ),
                )
                pagespeed_results = {
                    "desktop_performance": desktop,
                    "mobile_performance": mobile,
                }

            performance_comprehensive = await self.performance_checker.run_all_checks(
                url, pagespeed_results=pagespeed_results
            )
        except Exception as e:
            logger.error(f"Performance checks failed: {e}")
            performance_comprehensive = {"error": str(e), "overall_score": 0}

        # Layer 4: Scoring
        self._progress("Calculating scores", 80)
        analysis_results = {
            "magento_detection": magento_detection,
            "magento_analysis": magento_analysis,
            "performance_comprehensive": performance_comprehensive,
        }
        try:
            scores = self.scoring_service.calculate_comprehensive_score(
                analysis_results
            )
        except Exception as e:
            logger.error(f"Scoring failed: {e}")
            scores = {
                "overall_score": 0,
                "category_scores": {},
                "recommendations": [],
                "grade": "F",
            }

        self._progress("Generating report", 95)

        # Flatten findings (recommendations) from both layers
        findings: list = []
        for category_data in magento_analysis.get("categories", {}).values():
            if isinstance(category_data, dict):
                findings.extend(category_data.get("recommendations", []))
        for category_data in performance_comprehensive.get("categories", {}).values():
            if isinstance(category_data, dict):
                findings.extend(category_data.get("recommendations", []))

        report = {
            "id": task_id,
            "url": url,
            "created_at": started_at.isoformat(),
            "status": "completed",
            "magento_version": magento_detection.get("version", "unknown"),
            "overall_score": scores.get("overall_score", 0),
            "grade": scores.get("grade", "F"),
            "scores": {
                "performance": scores.get("category_scores", {}).get("performance", 0),
                "security": scores.get("category_scores", {}).get("magento_security", 0),
                "config": scores.get("category_scores", {}).get(
                    "magento_configuration",
                    scores.get("category_scores", {}).get("magento_overall", 0),
                ),
            },
            "findings": findings,
            "recommendations": scores.get("recommendations", []),
            "raw": {
                "magento_detection": magento_detection,
                "magento_analysis": magento_analysis,
                "performance": performance_comprehensive,
                "scores": scores,
            },
        }

        self._progress("Done", 100)
        return report


def get_orchestrator(
    progress_callback: ProgressCallback = None,
) -> AnalysisOrchestrator:
    return AnalysisOrchestrator(progress_callback=progress_callback)
