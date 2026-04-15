"""
Magento Checker Service

Implements Magento-specific checks and analysis for configurations, security,
optimization, and extension detection.
"""

import asyncio
import re
from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from mageperf.utils.http_client import http_client
from mageperf.utils.logger import logger

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


class MagentoChecker:
    """Handles Magento-specific analysis and checks."""
    
    KNOWN_PERFORMANCE_ISSUES = {
        "porto_theme": "Porto theme can be resource-heavy; ensure it's optimized.",
        "amasty_layered_navigation": "Amasty Layered Navigation can add significant database load.",
        "mirasvit_search": "Mirasvit Sphinx Search can be complex; verify its configuration.",
        "mageplaza_onepage_checkout": "Mageplaza One-Page Checkout may have heavy JS; profile its performance.",
        "weltpixel_google_analytics": "Weltpixel GA4 can impact frontend performance if not configured correctly."
    }
    
    def __init__(self):
        # Common Magento paths and indicators
        self.magento_paths = [
            '/pub/static/',
            '/pub/media/',
            '/static/frontend/',
            '/static/adminhtml/',
            '/media/catalog/',
            '/skin/frontend/'  # Magento 1.x
        ]
        
        # Known Magento headers
        self.magento_headers = [
            'x-magento-vary',
            'x-magento-tags',
            'x-magento-cache-control',
            'x-magento-cache-debug'
        ]
        
        # Magento JavaScript indicators
        self.magento_js_indicators = [
            'window.Mage',
            'requirejs-config',
            'mage/cookies',
            'Magento_',
            'mage/translate'
        ]
    
    async def detect_magento_presence(self, url: str) -> Dict[str, Any]:
        """
        Lightweight checks to confirm Magento 2.
        Checks for headers, JavaScript variables, HTML patterns, and common paths.
        """
        try:
            logger.info(f"Detecting Magento presence for {url}")
            
            # Get HTTP response with headers
            response = await http_client.get_with_retry(url)
            
            detection_results = {
                "is_magento": False,
                "confidence": 0,
                "version": None,
                "indicators": []
            }
            
            # Check 1: Magento-specific HTTP headers
            header_indicators = self._check_magento_headers(dict(response.headers))
            if header_indicators["found"]:
                detection_results["confidence"] += 30
                detection_results["indicators"].extend(header_indicators["details"])
            
            # Check 2: HTML content analysis
            if response.status_code == 200:
                html_indicators = await self._check_magento_html_patterns(response.text)
                if html_indicators["found"]:
                    detection_results["confidence"] += 25
                    detection_results["indicators"].extend(html_indicators["details"])
                
                # Check 3: JavaScript indicators
                js_indicators = self._check_magento_javascript(response.text)
                if js_indicators["found"]:
                    detection_results["confidence"] += 20
                    detection_results["indicators"].extend(js_indicators["details"])
                
                # Check 4: Meta tags and version detection
                version_info = self._extract_magento_version(response.text)
                if version_info["found"]:
                    detection_results["confidence"] += 15
                    detection_results["version"] = version_info["version"]
                    detection_results["indicators"].extend(version_info["details"])
            
            # Check 5: Common Magento paths
            path_indicators = await self._check_magento_paths(url)
            if path_indicators["found"]:
                detection_results["confidence"] += 10
                detection_results["indicators"].extend(path_indicators["details"])
            
            # Check 6: Enhanced version detection
            enhanced_version_info = await self._enhanced_version_detection(url)
            if enhanced_version_info["found"]:
                detection_results["confidence"] += 20
                detection_results["version"] = enhanced_version_info["version"]
                detection_results["edition"] = enhanced_version_info["edition"]
                detection_results["mode"] = enhanced_version_info["mode"]
                detection_results["indicators"].extend(enhanced_version_info["details"])
            
            # Determine if it's Magento based on confidence score
            detection_results["is_magento"] = detection_results["confidence"] >= 30
            
            logger.info(f"Magento detection for {url}: {detection_results['is_magento']} (confidence: {detection_results['confidence']}%)")
            
            return detection_results
            
        except Exception as e:
            logger.error(f"Error detecting Magento presence for {url}: {e}")
            return {
                "is_magento": False,
                "confidence": 0,
                "error": str(e)
            }
    
    def _check_magento_headers(self, headers: Dict[str, str]) -> Dict[str, Any]:
        """Check for Magento-specific HTTP headers."""
        found_headers = []
        
        for header_name in self.magento_headers:
            if header_name.lower() in [k.lower() for k in headers.keys()]:
                header_value = headers.get(header_name) or headers.get(header_name.lower())
                found_headers.append(f"Header: {header_name} = {header_value}")
        
        return {
            "found": len(found_headers) > 0,
            "details": found_headers
        }
    
    async def _check_magento_html_patterns(self, html_content: str) -> Dict[str, Any]:
        """Check HTML content for Magento-specific patterns."""
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            found_patterns = []
            
            # Look for Magento-specific CSS classes
            magento_classes = ['page-wrapper', 'header-container', 'nav-container', 'main-container', 'footer-container']
            for class_name in magento_classes:
                if soup.find(class_=class_name):
                    found_patterns.append(f"CSS class: {class_name}")
            
            # Look for Magento-specific HTML comments
            comments = soup.find_all(string=lambda text: isinstance(text, str) and 'magento' in text.lower())
            for comment in comments[:3]:  # Limit to first 3
                if 'magento' in comment.lower():
                    found_patterns.append(f"HTML comment: {comment.strip()[:50]}...")
            
            # Look for form_key (Magento CSRF protection)
            form_key_input = soup.find('input', {'name': 'form_key'})
            if form_key_input:
                found_patterns.append("Form key input found (Magento CSRF protection)")
            
            # Look for Magento-specific meta tags
            generator_meta = soup.find('meta', {'name': 'generator'})
            if generator_meta and hasattr(generator_meta, 'get'):
                content_attr = generator_meta.get('content')
                if content_attr and isinstance(content_attr, str) and 'magento' in content_attr.lower():
                    found_patterns.append(f"Generator meta: {content_attr}")
            
            return {
                "found": len(found_patterns) > 0,
                "details": found_patterns
            }
            
        except Exception as e:
            logger.error(f"Error checking HTML patterns: {e}")
            return {"found": False, "details": []}
    
    def _check_magento_javascript(self, html_content: str) -> Dict[str, Any]:
        """Check for Magento-specific JavaScript indicators."""
        found_js = []
        
        for indicator in self.magento_js_indicators:
            if indicator in html_content:
                found_js.append(f"JS indicator: {indicator}")
        
        # Look for requirejs-config.js
        if 'requirejs-config.js' in html_content:
            found_js.append("RequireJS config found")
        
        # Look for Magento knockout.js bindings
        if 'data-bind=' in html_content and 'ko.applyBindings' in html_content:
            found_js.append("Knockout.js bindings (Magento frontend)")
        
        return {
            "found": len(found_js) > 0,
            "details": found_js
        }
    
    def _extract_magento_version(self, html_content: str) -> Dict[str, Any]:
        """Extract Magento version from HTML content."""
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            version_info = []
            version = None
            
            # Look for version in meta tags
            version_patterns = [
                r'magento.*?(\d+\.\d+\.\d+)',
                r'version.*?(\d+\.\d+\.\d+)',
                r'mage.*?(\d+\.\d+\.\d+)'
            ]
            
            # Check meta generator
            generator = soup.find('meta', {'name': 'generator'})
            if generator and hasattr(generator, 'get'):
                content_attr = generator.get('content')
                if content_attr and isinstance(content_attr, str):
                    content = content_attr.lower()
                    for pattern in version_patterns:
                        match = re.search(pattern, content)
                        if match:
                            version = match.group(1)
                            version_info.append(f"Version from meta generator: {version}")
                            break
            
            # Look for version in static asset URLs
            if not version:
                version_match = re.search(r'/static/version(\d+)/', html_content)
                if version_match:
                    version_info.append(f"Static version hash found: {version_match.group(1)}")
            
            # Look for Magento edition indicators
            if 'enterprise' in html_content.lower() or 'commerce' in html_content.lower():
                version_info.append("Magento Commerce/Enterprise edition indicators")
            elif 'community' in html_content.lower():
                version_info.append("Magento Community edition indicators")
            
            return {
                "found": len(version_info) > 0,
                "version": version,
                "details": version_info
            }
            
        except Exception as e:
            logger.error(f"Error extracting version: {e}")
            return {"found": False, "version": None, "details": []}
    
    async def _check_magento_paths(self, url: str) -> Dict[str, Any]:
        """Check for existence of common Magento paths."""
        found_paths = []
        
        # Limit concurrent requests
        semaphore = asyncio.Semaphore(3)
        
        async def check_path(path: str) -> Optional[str]:
            async with semaphore:
                try:
                    test_url = urljoin(url, path)
                    response = await http_client.head_with_retry(test_url, max_retries=1)
                    
                    # Consider 200, 403, and redirects as indicators the path exists
                    if response.status_code in [200, 403] or 300 <= response.status_code < 400:
                        return f"Path exists: {path} (HTTP {response.status_code})"
                    
                except Exception:
                    pass
                
                return None
        
        # Check paths concurrently
        tasks = [check_path(path) for path in self.magento_paths[:5]]  # Limit to 5 paths
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Collect successful results
        for result in results:
            if isinstance(result, str):
                found_paths.append(result)
        
        return {
            "found": len(found_paths) > 0,
            "details": found_paths
        }
    
    async def _enhanced_version_detection(self, url: str) -> Dict[str, Any]:
        """Enhanced version detection using multiple methods."""
        try:
            version_info = {
                "found": False,
                "version": None,
                "edition": None,
                "mode": None,
                "details": []
            }
            
            # Method 1: Check /magento_version endpoint (Magento 2 built-in)
            try:
                version_url = urljoin(url, '/magento_version')
                response = await http_client.get_with_retry(version_url, max_retries=1)
                if response.status_code == 200:
                    content = response.text.strip()
                    if content and not content.lower().startswith('<!doctype'):
                        # Extract version from response
                        if 'Magento' in content:
                            version_info["found"] = True
                            version_info["details"].append(f"Version endpoint found: {content}")
                            
                            # Parse version (e.g., "Magento/2.4 (Community)" or "Magento/2.4 (Enterprise)")
                            import re
                            version_match = re.search(r'Magento/(\d+\.\d+(?:\.\d+)?)', content)
                            if version_match:
                                version_info["version"] = version_match.group(1)
                            
                            # Parse edition
                            if 'Community' in content or 'Open Source' in content:
                                version_info["edition"] = "Community"
                            elif 'Enterprise' in content or 'Commerce' in content:
                                version_info["edition"] = "Commerce"
                            elif 'Cloud' in content:
                                version_info["edition"] = "Cloud"
            except Exception:
                pass
            
            # Method 2: Check RELEASE_NOTES.txt
            try:
                release_notes_url = urljoin(url, '/RELEASE_NOTES.txt')
                response = await http_client.get_with_retry(release_notes_url, max_retries=1)
                if response.status_code == 200:
                    content = response.text[:1000]  # Read first 1000 chars
                    import re
                    version_match = re.search(r'(\d+\.\d+\.\d+)', content)
                    if version_match and not version_info["version"]:
                        version_info["version"] = version_match.group(1)
                        version_info["found"] = True
                        version_info["details"].append(f"Version from RELEASE_NOTES.txt: {version_match.group(1)}")
            except Exception:
                pass
            
            # Method 3: Analyze static file paths for version hash
            try:
                main_response = await http_client.get_with_retry(url)
                if main_response.status_code == 200:
                    content = main_response.text
                    
                    # Look for static version hash
                    import re
                    version_hash_match = re.search(r'/static/version(\d+)/', content)
                    if version_hash_match:
                        version_info["found"] = True
                        version_info["details"].append(f"Static version hash found: {version_hash_match.group(1)}")
                    
                    # Mode detection
                    if 'static.php' in content:
                        version_info["mode"] = "Developer"
                        version_info["details"].append("Developer mode detected (static.php usage)")
                    elif version_hash_match:
                        version_info["mode"] = "Production"
                        version_info["details"].append("Production mode detected (static file versioning)")
                    
                    # CSS/JS merging detection for mode
                    if re.search(r'/merged/[a-zA-Z0-9]+\.(css|js)', content):
                        version_info["mode"] = "Production"
                        version_info["details"].append("Production mode detected (merged assets)")
            except Exception:
                pass
            
            # Method 4: Check composer.json (if accessible)
            try:
                composer_url = urljoin(url, '/composer.json')
                response = await http_client.get_with_retry(composer_url, max_retries=1)
                if response.status_code == 200:
                    import json
                    try:
                        composer_data = json.loads(response.text)
                        # Look for magento packages
                        if 'require' in composer_data:
                            for package, version in composer_data['require'].items():
                                if 'magento/' in package and not version_info["version"]:
                                    # Extract version constraint
                                    import re
                                    version_match = re.search(r'(\d+\.\d+(?:\.\d+)?)', str(version))
                                    if version_match:
                                        version_info["version"] = version_match.group(1)
                                        version_info["found"] = True
                                        version_info["details"].append(f"Version from composer.json: {package} {version}")
                                        break
                    except json.JSONDecodeError:
                        pass
            except Exception:
                pass
            
            return version_info
            
        except Exception as e:
            logger.error(f"Error in enhanced version detection: {e}")
            return {
                "found": False,
                "version": None,
                "edition": None,
                "mode": None,
                "details": []
            }
    
    async def check_magento_configuration(self, url: str) -> Dict[str, Any]:
        """
        Check Magento configuration indicators:
        - Production mode detection
        - Static file signing
        - Maintenance flags
        """
        try:
            logger.info(f"Checking Magento configuration for {url}")
            
            prod_mode_result = await self._check_production_mode(url)
            static_signing_result = await self._check_static_file_signing(url)
            maintenance_result = await self._check_maintenance_mode(url)
            dev_mode_result = await self._check_developer_mode(url)
            
            config_results = {
                "production_mode": prod_mode_result,
                "static_file_signing": static_signing_result,
                "maintenance_mode": maintenance_result,
                "developer_mode_indicators": dev_mode_result
            }
            
            # Calculate overall configuration score
            score = 0
            if prod_mode_result.get("is_production", False):
                score += 40
            if static_signing_result.get("enabled", False):
                score += 30
            if not maintenance_result.get("in_maintenance", True):
                score += 20
            if not dev_mode_result.get("found", True):
                score += 10
            
            config_results["overall_score"] = score
            config_results["recommendations"] = self._generate_config_recommendations(config_results)
            
            return config_results
            
        except Exception as e:
            logger.error(f"Error checking Magento configuration for {url}: {e}")
            return {"error": str(e)}
    
    async def _check_production_mode(self, url: str) -> Dict[str, Any]:
        """Check if Magento is in production mode."""
        try:
            # Check if var/log directory is accessible (should be blocked in production)
            log_url = urljoin(url, '/var/log/')
            response = await http_client.head_with_retry(log_url, max_retries=1)
            
            # In production, this should return 403/404, not 200
            is_production = response.status_code in [403, 404]
            
            details = [f"var/log/ directory access: HTTP {response.status_code}"]
            
            # Additional checks
            main_response = await http_client.get_with_retry(url)
            if main_response.status_code == 200:
                # Look for debug indicators in HTML
                html_lower = main_response.text.lower()
                
                if 'developer mode' not in html_lower and 'debug' not in html_lower:
                    details.append("No debug indicators in HTML")
                else:
                    is_production = False
                    details.append("Debug indicators found in HTML")
            
            return {
                "is_production": is_production,
                "confidence": 80 if is_production else 60,
                "details": details
            }
            
        except Exception as e:
            logger.error(f"Error checking production mode: {e}")
            return {
                "is_production": None,
                "confidence": 0,
                "error": str(e)
            }
    
    async def _check_static_file_signing(self, url: str) -> Dict[str, Any]:
        """Check if static files include version hash in URLs."""
        try:
            response = await http_client.get_with_retry(url)
            
            if response.status_code != 200:
                return {"enabled": None, "details": ["Could not fetch page"]}
            
            # Look for version hash in static asset URLs
            version_pattern = r'/static/version\d+/'
            static_pattern = r'/pub/static/version\d+/'
            
            version_matches = len(re.findall(version_pattern, response.text))
            static_matches = len(re.findall(static_pattern, response.text))
            
            total_matches = version_matches + static_matches
            enabled = total_matches > 0
            
            details = []
            if enabled:
                details.append(f"Found {total_matches} versioned static assets")
            else:
                details.append("No versioned static assets found")
            
            return {
                "enabled": enabled,
                "version_matches": total_matches,
                "details": details
            }
            
        except Exception as e:
            logger.error(f"Error checking static file signing: {e}")
            return {"enabled": None, "error": str(e)}
    
    async def _check_maintenance_mode(self, url: str) -> Dict[str, Any]:
        """Check if site is in maintenance mode."""
        try:
            response = await http_client.get_with_retry(url)
            
            # Check response for maintenance indicators
            is_maintenance = False
            details = []
            
            if response.status_code == 503:
                is_maintenance = True
                details.append("HTTP 503 Service Unavailable")
            
            if 'maintenance' in response.text.lower():
                is_maintenance = True
                details.append("Maintenance message in content")
            
            # Check for deployed_version.txt
            try:
                version_url = urljoin(url, '/pub/static/deployed_version.txt')
                version_response = await http_client.head_with_retry(version_url, max_retries=1)
                if version_response.status_code == 200:
                    details.append("deployed_version.txt accessible")
            except Exception:
                pass
            
            return {
                "in_maintenance": is_maintenance,
                "status_code": response.status_code,
                "details": details
            }
            
        except Exception as e:
            logger.error(f"Error checking maintenance mode: {e}")
            return {"in_maintenance": None, "error": str(e)}
    
    async def _check_developer_mode(self, url: str) -> Dict[str, Any]:
        """Check for developer mode indicators."""
        try:
            response = await http_client.get_with_retry(url)
            
            if response.status_code != 200:
                return {"found": None, "details": ["Could not fetch page"]}
            
            developer_indicators = []
            html_lower = response.text.lower()
            
            # Common developer mode indicators
            dev_patterns = [
                ('profiler', 'Magento profiler'),
                ('xdebug', 'Xdebug'),
                ('developer mode', 'Developer mode text'),
                ('debug', 'Debug indicators'),
                ('var_dump', 'var_dump output'),
                ('exception.log', 'Exception log references')
            ]
            
            for pattern, description in dev_patterns:
                if pattern in html_lower:
                    developer_indicators.append(description)
            
            return {
                "found": len(developer_indicators) > 0,
                "indicators": developer_indicators,
                "details": developer_indicators
            }
            
        except Exception as e:
            logger.error(f"Error checking developer mode: {e}")
            return {"found": None, "error": str(e)}
    
    def _generate_config_recommendations(self, config_results: Dict) -> List[str]:
        """Generate configuration recommendations."""
        recommendations = []
        
        if not config_results.get("production_mode", {}).get("is_production"):
            recommendations.append("Enable production mode for better performance and security")
        
        if not config_results.get("static_file_signing", {}).get("enabled"):
            recommendations.append("Enable static file signing for better caching")
        
        if config_results.get("developer_mode_indicators", {}).get("found"):
            recommendations.append("Disable developer mode indicators in production")
        
        if config_results.get("maintenance_mode", {}).get("in_maintenance"):
            recommendations.append("Site appears to be in maintenance mode")
        
        return recommendations
    
    async def check_magento_security(self, url: str) -> Dict[str, Any]:
        """
        Check Magento security configuration.
        Focus on HTTP security headers and avoid sensitive file checks.
        """
        try:
            logger.info(f"Checking Magento security for {url}")
            
            response = await http_client.get_with_retry(url)
            headers = dict(response.headers)
            
            security_results = {
                "http_security_headers": self._analyze_security_headers(headers),
                "admin_path_security": await self._check_admin_path_security(url, response.text),
                "overall_score": 0
            }
            
            # Calculate security score
            header_score = security_results["http_security_headers"]["score"]
            admin_score = security_results["admin_path_security"]["score"]
            
            security_results["overall_score"] = (header_score + admin_score) / 2
            security_results["recommendations"] = self._generate_security_recommendations(security_results)
            
            return security_results
            
        except Exception as e:
            logger.error(f"Error checking Magento security for {url}: {e}")
            return {"error": str(e)}
    
    def _analyze_security_headers(self, headers: Dict[str, str]) -> Dict[str, Any]:
        """Analyze HTTP security headers."""
        security_headers = {
            'strict-transport-security': 'HSTS',
            'x-frame-options': 'Clickjacking protection',
            'x-content-type-options': 'MIME sniffing protection',
            'x-xss-protection': 'XSS protection',
            'content-security-policy': 'Content Security Policy',
            'referrer-policy': 'Referrer Policy'
        }
        
        results = {"headers": {}, "score": 0, "missing": []}
        
        for header_name, description in security_headers.items():
            header_value = None
            for key, value in headers.items():
                if key.lower() == header_name:
                    header_value = value
                    break
            
            if header_value:
                results["headers"][header_name] = {
                    "present": True,
                    "value": header_value,
                    "description": description
                }
                results["score"] += 100 / len(security_headers)
            else:
                results["headers"][header_name] = {
                    "present": False,
                    "description": description
                }
                results["missing"].append(description)
        
        return results
    
    async def _check_admin_path_security(self, url: str, html_content: str) -> Dict[str, Any]:
        """
        Check admin path security (non-invasive).
        Only check publicly available information.
        """
        try:
            admin_indicators = []
            score = 100  # Start with perfect score
            
            # Check robots.txt for admin path disclosure
            try:
                robots_url = urljoin(url, '/robots.txt')
                robots_response = await http_client.get_with_retry(robots_url, max_retries=1)
                
                if robots_response.status_code == 200:
                    robots_content = robots_response.text.lower()
                    
                    # Look for admin paths in robots.txt
                    admin_paths = ['/admin', '/backend', '/management', '/administrator']
                    for admin_path in admin_paths:
                        if admin_path in robots_content:
                            admin_indicators.append(f"Admin path disclosed in robots.txt: {admin_path}")
                            score -= 30
            except Exception:
                pass
            
            # Check for admin references in HTML (only what's publicly visible)
            html_lower = html_content.lower()
            if '/admin' in html_lower:
                # Only flag if it appears to be a direct link, not just in text
                if 'href="/admin' in html_lower or "action='/admin" in html_lower:
                    admin_indicators.append("Admin path visible in HTML links")
                    score -= 20
            
            return {
                "score": max(0, score),
                "indicators": admin_indicators,
                "details": admin_indicators if admin_indicators else ["No admin path disclosure found"]
            }
            
        except Exception as e:
            logger.error(f"Error checking admin path security: {e}")
            return {"score": 50, "error": str(e)}
    
    def _generate_security_recommendations(self, security_results: Dict) -> List[str]:
        """Generate security recommendations."""
        recommendations = []
        
        # Header recommendations
        missing_headers = security_results.get("http_security_headers", {}).get("missing", [])
        for header in missing_headers:
            recommendations.append(f"Implement {header} header")
        
        # Admin path recommendations
        admin_indicators = security_results.get("admin_path_security", {}).get("indicators", [])
        if admin_indicators:
            recommendations.append("Hide admin path references from public view")
            recommendations.append("Use custom admin path instead of default /admin")
        
        return recommendations
    
    async def run_all_checks(self, url: str, skip_invasive_checks: bool = True) -> Dict[str, Any]:
        """Run all Magento 2 specific checks."""
        logger.info(f"Starting all checks for {url} (invasive checks: {'disabled' if skip_invasive_checks else 'enabled'})")
        
        try:
            config_check = await self.check_configuration(url)
            security_check = await self.check_security(url, skip_invasive_checks=skip_invasive_checks)
            optimization_check = await self.check_optimization(url)
            extension_check = await self.check_extensions(url)
            seo_check = await self.check_seo(url)

            checks = {
                'configuration': config_check.to_dict(),
                'security': security_check.to_dict(),
                'optimization': optimization_check.to_dict(),
                'extensions': extension_check.to_dict(),
                'seo': seo_check.to_dict()
            }

            results = {
                "overall_score": self.calculate_overall_score(checks),
                "categories": checks,
                "timestamp": datetime.utcnow().isoformat()
            }

            logger.info("All checks completed successfully.")
            return results
            
        except Exception as e:
            logger.error(f"Error running all checks for {url}: {e}")
            return {
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    async def check_configuration(self, url: str) -> CheckResult:
        """Check Magento 2 configuration settings"""
        results = {}
        recommendations = []
        dev_mode_indicators = 0

        logger.info(f"Checking configuration settings for {url}")
        try:
            # 1. Check for exposed developer files
            dev_files = ['pub/errors/local.xml', 'pub/errors/404.php', 'pub/errors/report.php']
            for file in dev_files:
                try:
                    response = await http_client.get_with_retry(f"{url}/{file}")
                    if response.status_code == 200:
                        dev_mode_indicators += 1
                        recommendations.append(f"Sensitive developer file exposed: {file}. This indicates developer mode.")
                        break
                except Exception:
                    continue
            
            # 2. Check headers and HTML source for more subtle clues
            response = await http_client.get_with_retry(url)
            content = response.text
            headers = response.headers

            if 'X-Magento-Debug' in headers:
                dev_mode_indicators += 1
                recommendations.append("X-Magento-Debug header is present, indicating developer mode.")

            if 'static.php' in content:
                dev_mode_indicators += 1
                recommendations.append("Static content is being served through static.php, which is a sign of developer mode.")

            results['production_mode'] = dev_mode_indicators == 0
            if not results['production_mode']:
                logger.warning(f"Developer mode detected with {dev_mode_indicators} indicators.")
            else:
                logger.info("Production mode confirmed.")

            # 3. Check static file signatures (indicates production mode)
            static_version_url = f"{url}/static/version"
            static_response = await http_client.get_with_retry(static_version_url)
            results['static_signing'] = static_response.status_code == 404
            if not results['static_signing']:
                recommendations.append("Static file signing is not enabled. Run 'bin/magento setup:static-content:deploy'.")

            # 4. Check maintenance mode
            maintenance_url = f"{url}/maintenance.flag"
            maintenance_response = await http_client.get_with_retry(maintenance_url)
            results['maintenance_exposed'] = maintenance_response.status_code == 200
            if results['maintenance_exposed']:
                recommendations.append("Protect maintenance.flag file from public access.")

        except Exception as e:
            logger.error(f"Configuration check error: {str(e)}")
            return CheckResult("Configuration", 0, {}, ["Failed to check configuration due to an error."], error=str(e))

        score = self._calculate_configuration_score(results)
        return CheckResult("Configuration", score, results, recommendations)

    async def _find_admin_path(self, url: str) -> str:
        """Attempt to find the admin path, first by checking robots.txt."""
        logger.info(f"Attempting to find admin path from robots.txt for {url}")
        try:
            robots_url = f"{url}/robots.txt"
            response = await http_client.get_with_retry(robots_url)
            if response.status_code == 200:
                # Look for Disallow directives that are likely admin paths
                matches = re.findall(r"Disallow:\s*/(\w+/)", response.text)
                for match in matches:
                    # Filter common non-admin paths
                    if match.strip('/') not in ['lib', 'media', 'static', 'var']:
                        logger.info(f"Potential admin path found in robots.txt: {match}")
                        return match.strip('/')
        except Exception as e:
            logger.error(f"Error checking robots.txt: {e}")

        # Fallback to common paths if robots.txt fails or yields no results
        logger.info("Falling back to common admin path checks.")
        common_admin_paths = ['admin', 'backend', 'admin123', 'manage']
        for path in common_admin_paths:
            try:
                response = await http_client.get_with_retry(f"{url}/{path}")
                # A successful response or redirect to a login page is a strong indicator
                if response.status_code == 200 and 'Magento' in response.text:
                    logger.info(f"Found admin path by guessing: {path}")
                    return path
            except Exception as e:
                logger.error(f"Error checking common admin path {path}: {e}")
                continue
        
        return ""

    async def check_security(self, url: str, skip_invasive_checks: bool = True) -> CheckResult:
        """Check Magento 2 security settings"""
        results = {}
        recommendations = []

        logger.info(f"Checking security settings for {url}")
        try:
            # Only check admin path if explicitly allowed (for legal compliance)
            if not skip_invasive_checks:
                admin_path = await self._find_admin_path(url)
                admin_accessible = bool(admin_path)
                
                if admin_accessible:
                    recommendations.append(f"Change default admin path '{admin_path}'")
                    logger.warning(f"Admin path accessible: {admin_path}")

                results['admin_path_secure'] = not admin_accessible
                logger.info(f"Admin path secure: {results['admin_path_secure']}")
            else:
                results['admin_path_secure'] = True  # Assume secure if not checking
                recommendations.append("Admin path security check skipped for compliance")

            # Check for exposed sensitive files (only non-invasive public files)
            if not skip_invasive_checks:
                sensitive_files = [
                    'app/etc/env.php',
                    'app/etc/config.php',
                    'composer.json',
                    'composer.lock',
                    'auth.json',
                    '.gitignore',
                    '.htaccess',
                    'php.ini'
                ]

                exposed_files = []
                # Limit concurrent file checks to avoid overwhelming the server
                semaphore = asyncio.Semaphore(3)
                
                async def check_file(file: str) -> Optional[str]:
                    async with semaphore:
                        try:
                            response = await http_client.get_with_retry(f"{url}/{file}", max_retries=1)
                            if response.status_code == 200:
                                return file
                        except Exception as e:
                            logger.debug(f"Error checking sensitive file {file}: {e}")
                        return None
                
                # Check files concurrently but limited
                tasks = [check_file(file) for file in sensitive_files]
                file_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                for result in file_results:
                    if isinstance(result, str):
                        exposed_files.append(result)
                        recommendations.append(f"Restrict access to {result}")
                        logger.warning(f"Sensitive file exposed: {result}")

                results['exposed_files'] = exposed_files
                results['sensitive_files_exposed'] = len(exposed_files) > 0
            else:
                results['exposed_files'] = []
                results['sensitive_files_exposed'] = False
                recommendations.append("Sensitive file check skipped for compliance")

            # Check security headers
            response = await http_client.get_with_retry(url)
            headers = response.headers
            security_headers = {
                'X-Frame-Options': 'SAMEORIGIN',
                'X-Content-Type-Options': 'nosniff',
                'X-XSS-Protection': '1; mode=block'
            }
            
            for header, expected_value in security_headers.items():
                has_header = header in headers
                results[f'has_{header}'] = has_header
                if not has_header:
                    recommendations.append(f"Add {header} security header")
                    logger.warning(f"Missing security header: {header}")

        except Exception as e:
            logger.error(f"Security check error: {str(e)}")
            results['security_check_error'] = str(e)
            return CheckResult(
                category="Security",
                score=0,
                details=results,
                recommendations=["Failed to check security due to an error."],
                error=str(e)
            )

        score = self._calculate_security_score(results)
        logger.info(f"Security score: {score}")
        
        return CheckResult(
            category="Security",
            score=score,
            details=results,
            recommendations=recommendations
        )

    async def check_optimization(self, url: str) -> CheckResult:
        """Check Magento 2 optimization settings"""
        results = {}
        recommendations = []

        logger.info(f"Checking optimization settings for {url}")
        try:
            # Check static content merging
            response = await http_client.get_with_retry(url)
            content = response.text
            has_merged_css = bool(re.search(r'/merged/[a-zA-Z0-9]+\.css', content))
            has_merged_js = bool(re.search(r'/merged/[a-zA-Z0-9]+\.js', content))
            
            results['css_merged'] = has_merged_css
            results['js_merged'] = has_merged_js
            
            if not has_merged_css:
                recommendations.append("Enable CSS merging")
                logger.warning("CSS merging is not enabled.")
            if not has_merged_js:
                recommendations.append("Enable JavaScript merging")
                logger.warning("JavaScript merging is not enabled.")

            # Check bundling
            has_bundling = bool(re.search(r'requirejs-bundle', content))
            results['js_bundling'] = has_bundling
            if not has_bundling:
                recommendations.append("Enable JavaScript bundling")
                logger.warning("JavaScript bundling is not enabled.")

            # Enhanced image optimization check
            image_assessment = await self._assess_image_optimization(url, content)
            results.update(image_assessment)

            if image_assessment['total_images'] > 0:
                lazy_load_ratio = image_assessment['lazy_loaded_images'] / image_assessment['total_images']
                responsive_ratio = image_assessment['responsive_images'] / image_assessment['total_images']
                modern_format_ratio = image_assessment['modern_format_images'] / image_assessment['total_images']

                if lazy_load_ratio < 0.8:
                    recommendations.append("Implement lazy loading for more images.")
                if responsive_ratio < 0.8:
                    recommendations.append("Use responsive images (srcset) more extensively.")
                if modern_format_ratio < 0.8:
                    recommendations.append("Serve images in modern formats like WebP.")
                if image_assessment['oversized_images'] > 0:
                    recommendations.append(f"Optimize {image_assessment['oversized_images']} oversized images.")

        except Exception as e:
            logger.error(f"Optimization check error: {str(e)}")
            results['optimization_check_error'] = str(e)
            return CheckResult(
                category="Optimization",
                score=0,
                details=results,
                recommendations=["Failed to check optimization due to an error."],
                error=str(e)
            )

        score = self._calculate_optimization_score(results)
        logger.info(f"Optimization score: {score}")
        
        return CheckResult(
            category="Optimization",
            score=score,
            details=results,
            recommendations=recommendations
        )

    async def check_extensions(self, url: str) -> CheckResult:
        """Check Magento 2 extensions and their impact"""
        results = {}
        recommendations = []
        logger.info(f"Checking installed extensions for {url}")

        try:
            response = await http_client.get_with_retry(url)
            content = response.text
            soup = BeautifulSoup(content, 'html.parser')

            # General extension detection from resource paths
            resource_paths = [tag.get('src') or tag.get('href') for tag in soup.find_all(['script', 'link'])]
            resource_paths = [path for path in resource_paths if path]
            
            # Look for patterns like 'Vendor_Module' in paths
            extension_signatures = set(re.findall(r'/([A-Z][a-zA-Z0-9]+_[A-Z][a-zA-Z0-9]+)/', content))
            results['detected_extensions_signatures'] = list(extension_signatures)
            
            # Check for known performance offenders
            known_offenders_found = []
            for key, warning in self.KNOWN_PERFORMANCE_ISSUES.items():
                if re.search(key, content, re.IGNORECASE):
                    known_offenders_found.append(key)
                    recommendations.append(warning)
            
            results['known_performance_offenders'] = known_offenders_found

            # Refined resource count
            results['extension_resource_count'] = len(extension_signatures)
            if len(extension_signatures) > 15:
                recommendations.append("High number of third-party modules detected. Review and disable unused extensions.")
            
        except Exception as e:
            logger.error(f"Extension check error: {str(e)}")
            return CheckResult(
                category="Extensions",
                score=100,
                details={},
                recommendations=["Could not check extensions due to an error."],
                error=str(e)
            )

        score = self._calculate_extension_score(results)
        return CheckResult(
            category="Extensions",
            score=score,
            details=results,
            recommendations=recommendations
        )

    async def check_seo(self, url: str) -> CheckResult:
        """Check for robots.txt and sitemap.xml."""
        logger.info(f"Checking for robots.txt and sitemap.xml for {url}")
        results = {}
        recommendations = []
        
        try:
            # Check for robots.txt
            robots_url = f"{url}/robots.txt"
            response = await http_client.get_with_retry(robots_url)
            results['robots_txt_found'] = response.status_code == 200
            
            if results['robots_txt_found']:
                content = response.text
                sensitive_paths = ['/app/', '/vendor/', '/downloader/', '/errors/']
                for path in sensitive_paths:
                    if f"Disallow: {path}" not in content:
                        recommendations.append(f"Add 'Disallow: {path}' to robots.txt to protect sensitive areas.")
                
                # Check for sitemap declaration
                sitemap_match = re.search(r"Sitemap:\s*(.*)", content)
                if sitemap_match:
                    sitemap_url = sitemap_match.group(1).strip()
                    results['sitemap_declared_in_robots_txt'] = True
                    sitemap_response = await http_client.head_with_retry(sitemap_url)
                    results['sitemap_accessible'] = sitemap_response.status_code == 200
                    if not results['sitemap_accessible']:
                        recommendations.append("Sitemap declared in robots.txt is not accessible.")
                else:
                    results['sitemap_declared_in_robots_txt'] = False
                    recommendations.append("Declare sitemap location in robots.txt.")
            else:
                recommendations.append("Create a robots.txt file to guide search engine crawlers.")

            # Fallback check for sitemap.xml if not in robots.txt
            if not results.get('sitemap_accessible'):
                sitemap_url = f"{url}/sitemap.xml"
                sitemap_response = await http_client.head_with_retry(sitemap_url)
                results['sitemap_xml_found'] = sitemap_response.status_code == 200
                if not results['sitemap_xml_found']:
                    recommendations.append("sitemap.xml not found at the default location.")

        except Exception as e:
            logger.error(f"SEO check error: {e}")
            return CheckResult("SEO", 0, {}, ["Could not perform SEO checks due to an error."], error=str(e))

        score = self._calculate_seo_score(results)
        return CheckResult("SEO", score, results, recommendations)

    async def _assess_image_optimization(self, url: str, content: str) -> Dict:
        """Assess image optimization from HTML content."""
        logger.info(f"Assessing image optimization for {url}")
        soup = BeautifulSoup(content, 'html.parser')
        images = soup.find_all('img')
        
        total_images = len(images)
        lazy_loaded_images = 0
        responsive_images = 0
        modern_format_images = 0
        oversized_images = 0
        
        for img in images:
            # Check for lazy loading
            if img.get('loading') == 'lazy':
                lazy_loaded_images += 1
            
            # Check for responsive images (srcset)
            if img.has_attr('srcset'):
                responsive_images += 1
            
            # Check for modern formats (WebP)
            src = img.get('src', '')
            if src.endswith('.webp'):
                modern_format_images += 1
            
            # Check image size (sample check)
            if src:
                try:
                    full_url = urljoin(url, src)
                    # Avoid checking data URIs
                    if not full_url.startswith('data:'):
                        response = await http_client.head_with_retry(full_url)
                        size = int(response.headers.get('Content-Length', 0))
                        if size > 200 * 1024:  # 200 KB
                            oversized_images += 1
                except Exception as e:
                    logger.error(f"Could not check image size for {src}: {e}")

        return {
            "total_images": total_images,
            "lazy_loaded_images": lazy_loaded_images,
            "responsive_images": responsive_images,
            "modern_format_images": modern_format_images,
            "oversized_images": oversized_images
        }

    def _calculate_configuration_score(self, results: Dict) -> float:
        score = 100.0
        if not results.get('production_mode', False): score -= 30.0
        if not results.get('static_signing', False): score -= 20.0
        if results.get('maintenance_exposed', False): score -= 20.0
        return max(0.0, score)

    def _calculate_security_score(self, results: Dict) -> float:
        score = 100.0
        if not results.get('admin_path_secure', True): score -= 30.0
        if results.get('sensitive_files_exposed', False): score -= 30.0
        if not results.get('has_X-Frame-Options', False): score -= 10.0
        if not results.get('has_X-Content-Type-Options', False): score -= 10.0
        if not results.get('has_X-XSS-Protection', False): score -= 10.0
        return max(0.0, score)

    def _calculate_optimization_score(self, results: Dict) -> float:
        score = 100.0
        if not results.get('css_merged', False): score -= 15.0
        if not results.get('js_merged', False): score -= 15.0
        if not results.get('js_bundling', False): score -= 15.0
        
        total_images = results.get('total_images', 0)
        if total_images > 0:
            lazy_load_ratio = results.get('lazy_loaded_images', 0) / total_images
            responsive_ratio = results.get('responsive_images', 0) / total_images
            modern_format_ratio = results.get('modern_format_images', 0) / total_images
            
            score -= (1 - lazy_load_ratio) * 15
            score -= (1 - responsive_ratio) * 15
            score -= (1 - modern_format_ratio) * 10
        
        if results.get('oversized_images', 0) > 0:
            score -= 15.0
        
        return max(0.0, score)

    def _calculate_extension_score(self, results: Dict) -> float:
        score = 100.0
        
        # Penalty for known performance offenders
        offenders_count = len(results.get('known_performance_offenders', []))
        score -= offenders_count * 15  # 15 points per major offender

        # Penalty for high number of extension signatures
        resource_count = results.get('extension_resource_count', 0)
        if resource_count > 20:
            score -= 25
        elif resource_count > 10:
            score -= 15
            
        return max(0.0, score)

    def _calculate_seo_score(self, results: Dict) -> float:
        score = 100.0
        if not results.get('robots_txt_found'):
            return 0.0

        if not results.get('sitemap_accessible', False) and not results.get('sitemap_xml_found', False):
            score -= 40
        
        if not results.get('sitemap_declared_in_robots_txt'):
            score -= 20

        disallowed_paths = results.get('disallowed_paths', [])
        sensitive_paths = ['/app/', '/vendor/', '/downloader/', '/errors/']
        disallowed_count = 0
        for s_path in sensitive_paths:
            if any(s_path.strip('/') in d for d in disallowed_paths):
                disallowed_count += 1
        
        score -= (len(sensitive_paths) - disallowed_count) * 10

        return max(0.0, score)

    def calculate_overall_score(self, checks: Dict[str, Dict]) -> float:
        weights = {
            'configuration': 0.20,
            'security': 0.30,
            'optimization': 0.30,
            'extensions': 0.05,
            'seo': 0.15
        }

        overall_score = sum(
            check['score'] * weights[category]
            for category, check in checks.items() if category in weights
        )
        
        # Round to 2 decimal places
        overall_score = round(overall_score, 2)
        
        logger.info(f"Overall score calculated: {overall_score}")
        return overall_score


# Global instance
magento_checker = MagentoChecker()

def get_magento_checker() -> MagentoChecker:
    """Get the global Magento checker instance."""
    return magento_checker