"""
Performance Checker Service

Implements general web performance analysis, integrating with tools like 
Google PageSpeed Insights and handling asset-level checks.
"""

import asyncio
import time
from typing import Dict, List, Optional, Any, Tuple
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
import re

from dataclasses import asdict, dataclass
from datetime import datetime

from mageperf.utils.http_client import http_client
from mageperf.utils.logger import logger
from mageperf.config import Config as _Config

settings = _Config()

@dataclass
class CheckResult:
    """Dataclass for storing the result of a single check category."""
    category: str
    score: float
    details: Dict[str, Any]
    recommendations: List[str]
    error: Optional[str] = None

    def to_dict(self):
        return asdict(self)


class PerformanceChecker:
    """Handles web performance analysis and data collection."""
    
    # Configuration constants
    MAX_CONCURRENT_REQUESTS = 5
    MAX_ASSETS_TO_CHECK = 20
    MAX_IMAGE_SIZE_THRESHOLD = 200 * 1024  # 200KB
    LARGE_ASSET_THRESHOLD = 1024 * 1024    # 1MB
    DEFAULT_REQUEST_TIMEOUT = 30.0
    
    def __init__(self):
        self.pagespeed_api_url = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
        self.rate_limiter = None  # Rate limiting not used in CLI mode
        # Simple circuit breaker state
        self.pagespeed_failures = 0
        self.pagespeed_last_failure = None
        self.pagespeed_failure_threshold = 3
        self.pagespeed_reset_timeout = 300  # 5 minutes
    
    async def fetch_pagespeed_insights(
        self, 
        url: str, 
        strategy: str = "desktop",
        user_id: str = None
    ) -> Dict[str, Any]:
        """
        Makes asynchronous calls to the Google PageSpeed Insights API.
        Parses the JSON response to extract Core Web Vitals, overall Performance Score,
        and detailed Lighthouse audit results.
        """
        try:
            # Check circuit breaker first
            if self._is_pagespeed_circuit_open():
                logger.warning("PageSpeed API circuit breaker is open, using fallback")
                return await self._fallback_performance_analysis(url, strategy)
            
            # Prepare API parameters
            params = {
                "url": url,
                "key": settings.get("pagespeed_api_key"),
                "strategy": strategy,
                "category": ["PERFORMANCE", "ACCESSIBILITY", "BEST_PRACTICES", "SEO"],
                "locale": "en"
            }
            
            logger.info(f"Fetching PageSpeed Insights for {url} (strategy: {strategy})")
            
            client = http_client.get_client()
            response = await client.get(
                self.pagespeed_api_url,
                params=params,
                timeout=60.0  # Reduce timeout from 60s to 15s
            )
            
            if response.status_code == 429:
                # Rate limited - use exponential backoff
                logger.warning(f"PageSpeed API rate limited, implementing backoff")
                self._record_pagespeed_failure()
                await asyncio.sleep(2.0)
                return await self._fallback_performance_analysis(url, strategy)
            
            if response.status_code != 200:
                logger.error(f"PageSpeed API error: {response.status_code} - {response.text}")
                self._record_pagespeed_failure()
                return await self._fallback_performance_analysis(url, strategy)
            
            data = response.json()
            
            # Reset circuit breaker on success
            self._reset_pagespeed_circuit()
            
            # Parse PageSpeed response
            return self._parse_pagespeed_response(data, strategy)
            
        except Exception as e:
            logger.error(f"Error fetching PageSpeed Insights for {url}: {type(e).__name__}: {str(e)}")
            self._record_pagespeed_failure()
            return await self._fallback_performance_analysis(url, strategy)
    
    def _parse_pagespeed_response(self, data: Dict, strategy: str) -> Dict[str, Any]:
        """Parse PageSpeed Insights API response into structured format."""
        try:
            lighthouse_result = data.get("lighthouseResult", {})
            audits = lighthouse_result.get("audits", {})
            categories = lighthouse_result.get("categories", {})
            
            # Extract Core Web Vitals
            core_web_vitals = {
                "largest_contentful_paint": self._extract_metric(audits, "largest-contentful-paint"),
                "first_input_delay": self._extract_metric(audits, "max-potential-fid"),
                "cumulative_layout_shift": self._extract_metric(audits, "cumulative-layout-shift"),
                "first_contentful_paint": self._extract_metric(audits, "first-contentful-paint"),
                "time_to_interactive": self._extract_metric(audits, "interactive"),
                "speed_index": self._extract_metric(audits, "speed-index"),
                "total_blocking_time": self._extract_metric(audits, "total-blocking-time")
            }
            
            # Extract category scores
            performance_score = categories.get("performance", {}).get("score")
            accessibility_score = categories.get("accessibility", {}).get("score")
            best_practices_score = categories.get("best-practices", {}).get("score")
            seo_score = categories.get("seo", {}).get("score")
            
            # Extract optimization opportunities
            opportunities = []
            for audit_id, audit_data in audits.items():
                if audit_data.get("scoreDisplayMode") == "metricSavings" and audit_data.get("details"):
                    opportunities.append({
                        "id": audit_id,
                        "title": audit_data.get("title"),
                        "description": audit_data.get("description"),
                        "score": audit_data.get("score"),
                        "potential_savings": audit_data.get("details", {}).get("overallSavingsMs", 0)
                    })
            
            # Extract diagnostics
            diagnostics = []
            diagnostic_audits = [
                "render-blocking-resources", "unused-css-rules", "unused-javascript",
                "uses-webp-images", "efficient-animated-content", "uses-optimized-images",
                "uses-text-compression", "uses-responsive-images", "server-response-time",
                "redirects", "uses-rel-preconnect", "font-display"
            ]
            
            for audit_id in diagnostic_audits:
                if audit_id in audits:
                    audit_data = audits[audit_id]
                    diagnostics.append({
                        "id": audit_id,
                        "title": audit_data.get("title"),
                        "description": audit_data.get("description"),
                        "score": audit_data.get("score"),
                        "display_value": audit_data.get("displayValue")
                    })
            
            return {
                "strategy": strategy,
                "performance_score": performance_score * 100 if performance_score else 0,
                "accessibility_score": accessibility_score * 100 if accessibility_score else 0,
                "best_practices_score": best_practices_score * 100 if best_practices_score else 0,
                "seo_score": seo_score * 100 if seo_score else 0,
                "core_web_vitals": core_web_vitals,
                "opportunities": opportunities,
                "diagnostics": diagnostics,
                "fetch_time": data.get("analysisUTCTimestamp"),
                "page_stats": {
                    "total_byte_weight": self._extract_metric_value(audits, "total-byte-weight"),
                    "dom_size": self._extract_metric_value(audits, "dom-size"),
                    "network_requests": self._extract_metric_value(audits, "network-requests")
                }
            }
            
        except Exception as e:
            logger.error(f"Error parsing PageSpeed response: {e}")
            return {"strategy": strategy, "error": "Failed to parse PageSpeed response"}
    
    def _extract_metric(self, audits: Dict, metric_id: str) -> Dict[str, Any]:
        """Extract metric data from PageSpeed audits."""
        metric = audits.get(metric_id, {})
        return {
            "value": metric.get("numericValue"),
            "score": metric.get("score"),
            "display_value": metric.get("displayValue"),
            "unit": metric.get("numericUnit", "ms")
        }
    
    def _extract_metric_value(self, audits: Dict, metric_id: str) -> Optional[float]:
        """Extract numeric value from PageSpeed audit."""
        return audits.get(metric_id, {}).get("numericValue")
    
    async def _fallback_performance_analysis(self, url: str, strategy: str = "fallback") -> Dict[str, Any]:
        """
        Fallback performance analysis when PageSpeed API is unavailable.
        Performs basic HTTP analysis.
        """
        try:
            logger.info(f"Performing fallback performance analysis for {url}")
            
            # Measure TTFB and basic metrics
            ttfb_result = await self.measure_ttfb(url)
            headers_result = await self.fetch_http_headers(url)
            
            return {
                "strategy": "fallback",
                "performance_score": 50,  # Default moderate score
                "ttfb": ttfb_result,
                "headers": headers_result,
                "fallback": True,
                "message": "PageSpeed API unavailable, using basic analysis"
            }
            
        except Exception as e:
            logger.error(f"Fallback analysis failed for {url}: {e}")
            return {
                "strategy": "fallback",
                "error": "Both PageSpeed API and fallback analysis failed",
                "fallback": True
            }
    
    async def measure_ttfb(self, url: str) -> Dict[str, Any]:
        """
        Measures the Time To First Byte (TTFB) by sending an HTTP GET request
        and calculating the time elapsed until the first byte is received.
        """
        try:
            start_time = time.time()
            
            response = await http_client.get_with_retry(url)
            
            # Calculate TTFB (time until first byte received)
            ttfb = (time.time() - start_time) * 1000  # Convert to milliseconds
            
            return {
                "ttfb_ms": round(ttfb, 2),
                "status_code": response.status_code,
                "response_size": len(response.content),
                "redirect_count": len(response.history),
                "final_url": str(response.url)
            }
            
        except Exception as e:
            logger.error(f"Error measuring TTFB for {url}: {e}")
            return {
                "ttfb_ms": None,
                "error": str(e)
            }
    
    async def fetch_http_headers(self, url: str) -> Dict[str, Any]:
        """
        Performs HTTP GET request to collect HTTP response headers.
        Extracts relevant headers for security, caching, and server information.
        """
        try:
            response = await http_client.get_with_retry(url)
            headers = dict(response.headers)
            
            # Categorize headers
            security_headers = {
                "x_frame_options": headers.get("x-frame-options"),
                "x_content_type_options": headers.get("x-content-type-options"),
                "strict_transport_security": headers.get("strict-transport-security"),
                "x_xss_protection": headers.get("x-xss-protection"),
                "content_security_policy": headers.get("content-security-policy"),
                "referrer_policy": headers.get("referrer-policy")
            }
            
            caching_headers = {
                "cache_control": headers.get("cache-control"),
                "expires": headers.get("expires"),
                "etag": headers.get("etag"),
                "last_modified": headers.get("last-modified"),
                "vary": headers.get("vary")
            }
            
            server_headers = {
                "server": headers.get("server"),
                "x_powered_by": headers.get("x-powered-by"),
                "x_generator": headers.get("x-generator")
            }
            
            # Check for Magento-specific headers
            magento_headers = {
                "x_magento_vary": headers.get("x-magento-vary"),
                "x_magento_tags": headers.get("x-magento-tags"),
                "x_magento_cache_control": headers.get("x-magento-cache-control")
            }
            
            return {
                "status_code": response.status_code,
                "security_headers": security_headers,
                "caching_headers": caching_headers,
                "server_headers": server_headers,
                "magento_headers": magento_headers,
                "all_headers": headers
            }
            
        except Exception as e:
            logger.error(f"Error fetching HTTP headers for {url}: {e}")
            return {
                "error": str(e)
            }
    
    async def analyze_html_assets(self, url: str) -> Dict[str, Any]:
        """
        Fetches HTML content and analyzes linked CSS, JavaScript, and image resources.
        For each asset, checks size, encoding, and caching headers.
        """
        try:
            response = await http_client.get_with_retry(url)
            
            if response.status_code != 200:
                return {"error": f"HTTP {response.status_code}"}
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract assets
            css_assets = self._extract_css_assets(soup, url)
            js_assets = self._extract_js_assets(soup, url)
            image_assets = self._extract_image_assets(soup, url)
            
            # Analyze assets in parallel
            css_analysis, js_analysis, image_analysis = await asyncio.gather(
                self._analyze_assets(css_assets, "css"),
                self._analyze_assets(js_assets, "js"),
                self._analyze_assets(image_assets[:10], "image")  # Limit images to avoid too many requests
            )
            
            # Count inline assets
            inline_css = len(soup.find_all('style'))
            inline_js = len(soup.find_all('script', src=False))
            
            return {
                "css_assets": css_analysis,
                "js_assets": js_analysis,
                "image_assets": image_analysis,
                "inline_css_count": inline_css,
                "inline_js_count": inline_js,
                "total_assets": len(css_assets) + len(js_assets) + len(image_assets)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing HTML assets for {url}: {e}")
            return {"error": str(e)}
    
    def _extract_css_assets(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Extract CSS asset URLs from HTML."""
        css_links = soup.find_all('link', rel='stylesheet')
        return [urljoin(base_url, link.get('href')) for link in css_links if link.get('href')]
    
    def _extract_js_assets(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Extract JavaScript asset URLs from HTML."""
        js_scripts = soup.find_all('script', src=True)
        return [urljoin(base_url, script.get('src')) for script in js_scripts if script.get('src')]
    
    def _extract_image_assets(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Extract image asset URLs from HTML."""
        images = soup.find_all('img', src=True)
        return [urljoin(base_url, img.get('src')) for img in images if img.get('src')]
    
    async def _analyze_assets(self, asset_urls: List[str], asset_type: str) -> List[Dict[str, Any]]:
        """Analyze individual assets for size, encoding, and caching."""
        if not asset_urls:
            return []
        
        # Limit concurrent requests using class constant
        semaphore = asyncio.Semaphore(self.MAX_CONCURRENT_REQUESTS)
        
        async def analyze_single_asset(url: str) -> Dict[str, Any]:
            async with semaphore:
                try:
                    response = await http_client.head_with_retry(url, max_retries=1)
                    size_bytes = int(response.headers.get("content-length", 0))
                    
                    return {
                        "url": url,
                        "status_code": response.status_code,
                        "size_bytes": size_bytes,
                        "content_type": response.headers.get("content-type"),
                        "content_encoding": response.headers.get("content-encoding"),
                        "cache_control": response.headers.get("cache-control"),
                        "etag": response.headers.get("etag"),
                        "is_large": size_bytes > self.LARGE_ASSET_THRESHOLD
                    }
                except asyncio.TimeoutError:
                    return {"url": url, "error": "Timeout"}
                except Exception as e:
                    return {"url": url, "error": str(e)}
        
        # Analyze assets concurrently with limit from class constant
        tasks = [analyze_single_asset(url) for url in asset_urls[:self.MAX_ASSETS_TO_CHECK]]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions
        valid_results = [r for r in results if isinstance(r, dict)]
        
        # Calculate summary statistics
        total_size = sum(r.get("size_bytes", 0) for r in valid_results)
        avg_size = total_size / len(valid_results) if valid_results else 0
        
        return {
            "assets": valid_results,
            "summary": {
                "total_count": len(asset_urls),
                "analyzed_count": len(valid_results),
                "total_size_bytes": total_size,
                "average_size_bytes": round(avg_size, 2),
                "asset_type": asset_type
            }
        }
    
    async def check_cdn_usage(self, url: str, asset_urls: List[str]) -> Dict[str, Any]:
        """
        Analyzes asset domains to determine if a CDN is being used.
        Checks for common CDN hostnames or different domains.
        """
        try:
            base_domain = urlparse(url).netloc.lower()
            
            # Common CDN patterns
            cdn_patterns = [
                r'.*\.cloudfront\.net',
                r'.*\.fastly\.com',
                r'.*\.maxcdn\.com',
                r'.*\.jsdelivr\.net',
                r'.*\.unpkg\.com',
                r'.*\.cdnjs\.cloudflare\.com',
                r'.*\.googleapis\.com',
                r'.*\.gstatic\.com',
                r'.*-cdn\.',
                r'cdn-.*',
                r'static\..*'
            ]
            
            external_domains = set()
            cdn_domains = set()
            
            for asset_url in asset_urls:
                try:
                    asset_domain = urlparse(asset_url).netloc.lower()
                    
                    if asset_domain != base_domain:
                        external_domains.add(asset_domain)
                        
                        # Check if it matches CDN patterns
                        for pattern in cdn_patterns:
                            if re.match(pattern, asset_domain):
                                cdn_domains.add(asset_domain)
                                break
                                
                except Exception:
                    continue
            
            cdn_usage = len(cdn_domains) > 0
            external_usage = len(external_domains) > 0
            
            return {
                "uses_cdn": cdn_usage,
                "uses_external_domains": external_usage,
                "cdn_domains": list(cdn_domains),
                "external_domains": list(external_domains),
                "base_domain": base_domain,
                "cdn_ratio": len(cdn_domains) / len(external_domains) if external_domains else 0
            }
            
        except Exception as e:
            logger.error(f"Error checking CDN usage for {url}: {e}")
            return {
                "uses_cdn": False,
                "error": str(e)
            }
    
    async def run_all_checks(self, url: str, pagespeed_results: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Run all performance checks."""
        logger.info(f"Starting all performance checks for {url}")
        try:
            response_time_result = (await self.check_response_times(url)).to_dict()
            frontend_performance_result = (await self.check_frontend_performance(url, pagespeed_results)).to_dict()
            
            # Pass frontend performance details to asset optimization check
            frontend_details = frontend_performance_result.get('details')
            asset_optimization_result = (await self.check_asset_optimization(
                url, frontend_performance_details=frontend_details
            )).to_dict()
            
            caching_result = (await self.check_cache_implementation(url)).to_dict()
            server_config_result = (await self.check_server_configuration(url)).to_dict()

            checks = {
                'response_time': response_time_result,
                'frontend_performance': frontend_performance_result,
                'asset_optimization': asset_optimization_result,
                'caching': caching_result,
                'server_configuration': server_config_result
            }

            return {
                "overall_score": self.calculate_overall_score(checks),
                "categories": checks,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error in run_all_checks: {str(e)}")
            return {
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    async def check_response_times(self, url: str) -> CheckResult:
        """Check response times for key pages"""
        logger.info(f"Checking response times for key pages for {url}")
        paths = {
            'homepage': '',
            'catalog': 'catalog/category/view/id/2',
            'search': 'catalogsearch/result?q=test',
            'cart': 'checkout/cart'
        }

        results = {}
        recommendations = []

        for name, path in paths.items():
            try:
                test_url = f"{url}/{path}"
                start_time = time.time()
                response = await http_client.get_with_retry(test_url)
                ttfb = (time.time() - start_time) * 1000
                results[f"{name}_ttfb"] = ttfb
                logger.info(f"{name} page TTFB: {ttfb:.2f} ms")

                if ttfb > 800:
                    recommendations.append(f"Optimize {name} page response time ({ttfb:.0f}ms)")

            except Exception as e:
                logger.error(f"Error checking {name}: {str(e)}")
                results[f"{name}_error"] = str(e)

        score = self._calculate_response_score(results)
        logger.info(f"Response times check completed with score: {score}")

        return CheckResult(
            category="Response Time",
            score=score,
            details=results,
            recommendations=recommendations
        )
    
    async def check_frontend_performance(self, url: str, pagespeed_results: Optional[Dict[str, Any]] = None) -> CheckResult:
        """Check frontend performance metrics using Google PageSpeed API or cached results"""
        logger.info(f"Checking frontend performance metrics with PageSpeed API for {url}")
        
        # If cached results are provided, use them instead of making new API calls
        if pagespeed_results:
            logger.info("Using cached PageSpeed results from previous analysis layer")
            desktop_result = pagespeed_results.get("desktop_performance", {})
            mobile_result = pagespeed_results.get("mobile_performance", {})
        else:
            if not settings.get("pagespeed_api_key"):
                logger.error("pagespeed_api_key is not set. Cannot run PageSpeed API check.")
                return CheckResult(
                    category="Frontend Performance",
                    score=0,
                    details={},
                    recommendations=["Configure pagespeed_api_key via 'mageperf config set pagespeed_api_key <key>'."],
                    error="PageSpeed API key not configured."
                )
            
            try:
                # Use the existing fetch_pagespeed_insights method
                desktop_result = await self.fetch_pagespeed_insights(url, "desktop")
                mobile_result = await self.fetch_pagespeed_insights(url, "mobile")
            except Exception as e:
                logger.error(f"PageSpeed API check failed: {str(e)}")
                return CheckResult(
                    category="Frontend Performance",
                    score=0,
                    details={},
                    recommendations=["PageSpeed API check failed. Ensure API key is valid and URL is accessible."],
                    error=str(e)
                )
        
        all_strategy_details = {
            "DESKTOP": desktop_result,
            "MOBILE": mobile_result
        }
        
        # Calculate average performance score
        desktop_score = desktop_result.get("performance_score", 0)
        mobile_score = mobile_result.get("performance_score", 0)
        average_performance_score = (desktop_score + mobile_score) / 2
        
        # Collect recommendations from both strategies
        all_recommendations = set()
        for strategy, result in all_strategy_details.items():
            if "opportunities" in result:
                for opportunity in result["opportunities"]:
                    if opportunity.get("score", 1) < 0.9:
                        all_recommendations.add(opportunity.get("title", "Unknown optimization"))
        
        logger.info(f"Average PageSpeed performance score: {average_performance_score}")
        
        return CheckResult(
            category="Frontend Performance",
            score=average_performance_score,
            details=all_strategy_details,
            recommendations=list(all_recommendations)
        )
    
    async def check_asset_optimization(self, url: str, frontend_performance_details: Optional[Dict] = None) -> CheckResult:
        """Check asset optimization"""
        logger.info(f"Checking asset optimization for {url}")
        
        # Use the existing analyze_html_assets method
        assets_result = await self.analyze_html_assets(url)
        
        if "error" in assets_result:
            return CheckResult(
                category="Asset Optimization",
                score=0,
                details=assets_result,
                recommendations=["Failed to analyze assets"],
                error=assets_result["error"]
            )
        
        results = assets_result
        recommendations = []
        
        # Check for compression and optimization
        for asset_type in ["css_assets", "js_assets", "image_assets"]:
            if asset_type in results and "assets" in results[asset_type]:
                for asset in results[asset_type]["assets"]:
                    if not asset.get("content_encoding"):
                        recommendations.append(f"Enable compression for {asset.get('url', 'unknown asset')}")
                    
                    size_bytes = asset.get("size_bytes", 0)
                    if size_bytes > 1024 * 1024:  # 1MB
                        recommendations.append(f"Asset {asset.get('url', 'unknown')} is very large ({size_bytes / 1024 / 1024:.2f} MB). Consider optimizing or splitting it.")
        
        # Leverage PageSpeed Insights audit results for unused CSS/JS
        if frontend_performance_details:
            for strategy in ['DESKTOP', 'MOBILE']:
                if strategy in frontend_performance_details and "diagnostics" in frontend_performance_details[strategy]:
                    diagnostics = frontend_performance_details[strategy]["diagnostics"]
                    
                    for diagnostic in diagnostics:
                        if diagnostic.get("id") == "unused-css-rules" and diagnostic.get("score", 1) < 0.9:
                            recommendations.append(f"[{strategy}] Reduce unused CSS.")
                        elif diagnostic.get("id") == "unused-javascript" and diagnostic.get("score", 1) < 0.9:
                            recommendations.append(f"[{strategy}] Reduce unused JavaScript.")
        
        score = self._calculate_asset_score(results)
        logger.info(f"Asset optimization check completed with score: {score}")
        
        return CheckResult(
            category="Asset Optimization",
            score=score,
            details=results,
            recommendations=list(set(recommendations))
        )
    
    async def check_cache_implementation(self, url: str) -> CheckResult:
        """Check caching implementation"""
        logger.info(f"Checking caching implementation for {url}")
        results = {}
        recommendations = []

        try:
            # Check homepage for FPC and Varnish headers
            response = await http_client.get_with_retry(url)
            headers = response.headers
            
            # Magento FPC check
            fpc_header = headers.get('X-Magento-Cache-Debug')
            results['magento_fpc_enabled'] = fpc_header == 'HIT'
            if fpc_header == 'MISS':
                recommendations.append("Magento Full Page Cache is not being hit. Investigate cache configuration.")
            
            # Varnish check
            varnish_hit = 'X-Varnish-Cache' in headers or 'X-Varnish' in headers
            results['varnish_detected'] = varnish_hit
            if not varnish_hit:
                recommendations.append("Varnish is not detected. Consider using Varnish for full-page caching.")

            # Static asset caching checks using the existing analyze_html_assets method
            assets_result = await self.analyze_html_assets(url)
            
            if "error" not in assets_result:
                for asset_type in ["css_assets", "js_assets", "image_assets"]:
                    if asset_type in assets_result and "assets" in assets_result[asset_type]:
                        assets = assets_result[asset_type]["assets"]
                        if assets:
                            # Check first asset of each type
                            first_asset = assets[0]
                            cache_control = first_asset.get("cache_control", "")
                            etag = bool(first_asset.get("etag"))
                            
                            results[f"{asset_type}_cache_control"] = cache_control
                            results[f"{asset_type}_etag"] = etag
                            
                            if not cache_control:
                                recommendations.append(f"Add Cache-Control header for {asset_type}")
                            elif 'max-age' not in cache_control:
                                recommendations.append(f"Add max-age directive for {asset_type}")
        
        except Exception as e:
            logger.error(f"Error checking cache implementation: {str(e)}")
            return CheckResult(
                category="Caching",
                score=0,
                details={},
                recommendations=["Failed to check caching implementation due to an error."],
                error=str(e)
            )

        score = self._calculate_cache_score(results)
        logger.info(f"Caching implementation check completed with score: {score}")

        return CheckResult(
            category="Caching",
            score=score,
            details=results,
            recommendations=recommendations
        )
    
    async def check_server_configuration(self, url: str) -> CheckResult:
        """Check for performance-related server headers."""
        logger.info(f"Checking server configuration headers for {url}")
        results = {}
        recommendations = []

        try:
            response = await http_client.get_with_retry(url)
            headers = response.headers

            # Check for Server header disclosure
            server_header = headers.get('Server')
            if server_header:
                results['server_header'] = server_header
                recommendations.append(f"Server header is disclosing software version ('{server_header}'). Consider removing or obscuring this header for security.")
            else:
                results['server_header'] = 'Not disclosed'

            # Check for Content-Type header
            content_type = headers.get('Content-Type')
            if content_type:
                results['content_type'] = content_type
                if 'text/html' not in content_type.lower():
                    recommendations.append(f"Homepage Content-Type is '{content_type}', which may not be optimal. Expected 'text/html'.")
            else:
                results['content_type'] = 'Not specified'
                recommendations.append("Content-Type header is missing for the homepage.")

        except Exception as e:
            logger.error(f"Error checking server configuration: {str(e)}")
            return CheckResult(
                category="Server Configuration",
                score=0,
                details={},
                recommendations=["Failed to check server headers due to an error."],
                error=str(e)
            )

        score = self._calculate_server_config_score(results)
        return CheckResult(
            category="Server Configuration",
            score=score,
            details=results,
            recommendations=recommendations
        )
    
    def _calculate_response_score(self, results: Dict) -> float:
        score = 100.0
        for key, value in results.items():
            if key.endswith('_ttfb') and isinstance(value, (int, float)):
                if value > 800: score -= 20
                elif value > 500: score -= 10
                elif value > 200: score -= 5
        logger.debug(f"Response score calculation: {results}, final score: {score}")
        return max(0.0, score)
    
    def _calculate_asset_score(self, results: Dict) -> float:
        score = 100.0
        
        # Check total assets and sizes
        total_assets = results.get("total_assets", 0)
        if total_assets > 50:
            score -= 20
        elif total_assets > 30:
            score -= 10
        
        # Check asset type summaries
        for asset_type in ["css_assets", "js_assets", "image_assets"]:
            if asset_type in results and "summary" in results[asset_type]:
                summary = results[asset_type]["summary"]
                total_size = summary.get("total_size_bytes", 0)
                
                # Penalize large total sizes per asset type
                if asset_type == "image_assets" and total_size > 5 * 1024 * 1024:  # 5MB
                    score -= 15
                elif asset_type in ["css_assets", "js_assets"] and total_size > 1024 * 1024:  # 1MB
                    score -= 10
        
        logger.debug(f"Asset score calculation: {results}, final score: {score}")
        return max(0.0, score)
    
    def _calculate_cache_score(self, results: Dict) -> float:
        score = 100.0
        
        if not results.get('magento_fpc_enabled', False):
            score -= 30
        if not results.get('varnish_detected', False):
            score -= 20

        for key, value in results.items():
            if key.endswith('_cache_control') and not value:
                score -= 10
            elif key.endswith('_etag') and not value:
                score -= 5

        logger.debug(f"Cache score calculation: {results}, final score: {score}")
        return max(0.0, score)
    
    def _calculate_server_config_score(self, results: Dict) -> float:
        score = 100.0
        if results.get('server_header') != 'Not disclosed':
            score -= 10  # Minor penalty for disclosure
        if 'text/html' not in results.get('content_type', '').lower():
            score -= 20  # More significant penalty for wrong content type
        if results.get('content_type') == 'Not specified':
            score -= 30  # High penalty for missing content type
        return max(0.0, score)
    
    def calculate_overall_score(self, checks: Dict[str, Dict]) -> float:
        weights = {
            'response_time': 0.25,
            'frontend_performance': 0.35,
            'asset_optimization': 0.15,
            'caching': 0.15,
            'server_configuration': 0.1
        }
        
        overall_score = sum(
            float(check['score']) * weights[category]
            for category, check in checks.items() if category in weights
        )
        
        logger.info(f"Overall score calculated: {overall_score}")
        return round(overall_score, 2)
    
    def _is_pagespeed_circuit_open(self) -> bool:
        """Check if PageSpeed API circuit breaker is open."""
        if self.pagespeed_failures < self.pagespeed_failure_threshold:
            return False
        
        if self.pagespeed_last_failure is None:
            return False
            
        # Check if enough time has passed to try again
        time_since_failure = time.time() - self.pagespeed_last_failure
        return time_since_failure < self.pagespeed_reset_timeout
    
    def _record_pagespeed_failure(self):
        """Record a PageSpeed API failure."""
        self.pagespeed_failures += 1
        self.pagespeed_last_failure = time.time()
        logger.warning(f"PageSpeed API failure #{self.pagespeed_failures}")
    
    def _reset_pagespeed_circuit(self):
        """Reset the PageSpeed API circuit breaker on success."""
        if self.pagespeed_failures > 0:
            logger.info("PageSpeed API circuit breaker reset - service recovered")
            self.pagespeed_failures = 0
            self.pagespeed_last_failure = None


# Global instance
performance_checker = PerformanceChecker()

def get_performance_checker() -> PerformanceChecker:
    """Get the global performance checker instance."""
    return performance_checker