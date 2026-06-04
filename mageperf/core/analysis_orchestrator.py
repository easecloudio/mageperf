"""
Analysis Orchestrator — CLI version
Stripped of MongoDB, RQ, WebSocket, and auth dependencies.
Progress is reported via an optional callback(message, percent).
"""

import asyncio
import uuid
from datetime import datetime, timezone
from typing import Any, Callable, Dict, Optional

# Import analyzers module to trigger @register_analyzer decorators
import mageperf.core.analyzers  # noqa: F401

from mageperf.core.magento_checker import get_magento_checker
from mageperf.core.models import get_registered_analyzers
from mageperf.core.scoring_service import get_scoring_service
from mageperf.utils.logger import logger
from mageperf.utils.security import validate_url_not_ssrf


ProgressCallback = Optional[Callable[[str, int], None]]

_PRIORITY_TO_SEVERITY = {5: "critical", 4: "high", 3: "medium", 2: "low", 1: "info"}


class AnalysisOrchestrator:
    def __init__(self, progress_callback: ProgressCallback = None):
        self._magento_checker = get_magento_checker()
        self._scoring_service = get_scoring_service()
        self._analyzers = [cls() for cls in get_registered_analyzers()]
        self._progress = progress_callback or (lambda msg, pct: None)

    async def run_full_analysis(
        self,
        url: str,
        pagespeed_api_key: Optional[str] = None,
        force: bool = False,
        checks: Optional[list] = None,
    ) -> Dict[str, Any]:
        task_id = str(uuid.uuid4())
        started_at = datetime.now(timezone.utc)

        self._progress("Starting analysis", 5)

        # SSRF guard
        try:
            validate_url_not_ssrf(url)
        except ValueError as exc:
            return {
                "id": task_id,
                "url": url,
                "created_at": started_at.isoformat(),
                "status": "failed",
                "error": str(exc),
            }

        # Gate: Magento detection (must pass before running analyzers)
        self._progress("Detecting Magento", 15)
        try:
            magento_detection = await self._magento_checker.detect_magento_presence(url)
        except Exception as e:
            logger.error(f"Magento detection failed: {e}")
            magento_detection = {"is_magento": False, "error": str(e)}

        if not force and not magento_detection.get("is_magento"):
            return {
                "id": task_id,
                "url": url,
                "created_at": started_at.isoformat(),
                "status": "failed",
                "error": "Magento not detected at this URL. Use --force to override.",
            }
        if force and not magento_detection.get("is_magento"):
            self._progress("Detection skipped (--force)", 25)

        # Filter analyzers by requested checks
        run_all = not checks or checks == ["all"]
        active_analyzers = [
            a for a in self._analyzers
            if run_all or any(c in a.name for c in checks)
        ]

        # Optional PageSpeed pre-fetch (runs before registry analyzers so results
        # can be forwarded as kwargs to whichever analyzer needs them)
        self._progress("Fetching PageSpeed data", 30)
        pagespeed_results: Optional[Dict[str, Any]] = None
        if pagespeed_api_key and (run_all or "performance" in (checks or [])):
            try:
                from mageperf.core.performance_checker import get_performance_checker

                pc = get_performance_checker()
                desktop, mobile = await asyncio.gather(
                    pc.fetch_pagespeed_insights(url, strategy="desktop", api_key=pagespeed_api_key),
                    pc.fetch_pagespeed_insights(url, strategy="mobile", api_key=pagespeed_api_key),
                )
                pagespeed_results = {
                    "desktop_performance": desktop,
                    "mobile_performance": mobile,
                }
            except Exception as e:
                logger.error(f"PageSpeed fetch failed: {e}")

        # Run all registered analyzers in parallel
        self._progress("Running Magento checks", 55)
        analyzer_kwargs: Dict[str, Any] = {"pagespeed_results": pagespeed_results}

        async def _run_one(analyzer) -> tuple[str, Dict[str, Any]]:
            try:
                result = await analyzer.run(url, **analyzer_kwargs)
            except Exception as e:
                logger.error(f"Analyzer {analyzer.name!r} failed: {e}")
                result = {"error": str(e), "overall_score": 0}
            return analyzer.name, result

        pairs = await asyncio.gather(*[_run_one(a) for a in active_analyzers])
        analysis_results: Dict[str, Any] = {
            "magento_detection": magento_detection,
            **{name: result for name, result in pairs},
        }

        # Scoring
        self._progress("Calculating scores", 80)
        try:
            scores = self._scoring_service.calculate_comprehensive_score(analysis_results)
        except Exception as e:
            logger.error(f"Scoring failed: {e}")
            scores = {
                "overall_score": 0,
                "category_scores": {},
                "recommendations": [],
                "grade": "F",
            }

        self._progress("Generating report", 95)

        findings: list = []
        for rec in scores.get("recommendations", []):
            if isinstance(rec, dict):
                priority = rec.get("priority", 3)
                rec["severity"] = _PRIORITY_TO_SEVERITY.get(priority, "medium")
                findings.append(rec)
            elif isinstance(rec, str):
                findings.append({"recommendation": rec, "severity": "medium"})

        magento_analysis = analysis_results.get("magento_analysis", {})
        performance_comprehensive = analysis_results.get("performance_comprehensive", {})

        report = {
            "schema_version": "1.0",
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
