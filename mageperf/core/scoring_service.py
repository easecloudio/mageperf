"""
Scoring Service

Calculates comprehensive scores for analysis results and generates
actionable recommendations based on the findings.
"""

from typing import Dict, List, Any
from mageperf.utils.logger import logger


class ScoringService:
    """Handles score calculation and recommendation generation."""
    
    # Scoring weights for different categories
    CATEGORY_WEIGHTS = {
        "performance": 0.35,
        "magento_configuration": 0.25,
        "security": 0.20,
        "optimization": 0.15,
        "seo": 0.05
    }
    
    # Performance score thresholds
    SCORE_THRESHOLDS = {
        "excellent": 90,
        "good": 75,
        "needs_improvement": 50,
        "poor": 0
    }
    
    def calculate_comprehensive_score(self, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate comprehensive scores from all analysis results.
        """
        logger.info("Calculating comprehensive scores")
        
        try:
            scores = {
                "overall_score": 0.0,
                "category_scores": {},
                "performance_metrics": {},
                "recommendations": [],
                "score_breakdown": {},
                "grade": "F"
            }
            
            # Extract individual category scores
            category_scores = self._extract_category_scores(analysis_results)
            scores["category_scores"] = category_scores
            
            # Calculate weighted overall score
            overall_score = self._calculate_weighted_score(category_scores)
            scores["overall_score"] = round(overall_score, 2)
            
            # Determine grade
            scores["grade"] = self._determine_grade(overall_score)
            
            # Extract key performance metrics
            scores["performance_metrics"] = self._extract_key_metrics(analysis_results)
            
            # Generate prioritized recommendations
            scores["recommendations"] = self._generate_recommendations(analysis_results, category_scores)
            
            # Create detailed score breakdown
            scores["score_breakdown"] = self._create_score_breakdown(category_scores)
            
            logger.info(f"Comprehensive scoring completed. Overall score: {overall_score}")
            return scores
            
        except Exception as e:
            logger.error(f"Error calculating comprehensive scores: {e}")
            return {
                "overall_score": 0.0,
                "category_scores": {},
                "performance_metrics": {},
                "recommendations": ["Unable to calculate scores due to analysis errors"],
                "score_breakdown": {},
                "grade": "F",
                "error": str(e)
            }
    
    def _extract_category_scores(self, analysis_results: Dict[str, Any]) -> Dict[str, float]:
        """Extract scores from each analysis category."""
        category_scores = {}
        
        try:
            # Performance scores
            performance_comprehensive = analysis_results.get("performance_comprehensive", {})
            if "overall_score" in performance_comprehensive:
                category_scores["performance"] = float(performance_comprehensive["overall_score"])
            else:
                # Fallback to PageSpeed scores
                desktop_perf = analysis_results.get("performance_results", {}).get("desktop_performance", {})
                mobile_perf = analysis_results.get("performance_results", {}).get("mobile_performance", {})
                
                desktop_score = desktop_perf.get("performance_score", 0)
                mobile_score = mobile_perf.get("performance_score", 0)
                
                if desktop_score or mobile_score:
                    category_scores["performance"] = (desktop_score + mobile_score) / 2
                else:
                    category_scores["performance"] = 0.0
            
            # Magento analysis scores
            magento_analysis = analysis_results.get("magento_analysis", {})
            if "overall_score" in magento_analysis:
                category_scores["magento_overall"] = float(magento_analysis["overall_score"])
                
                # Extract individual Magento category scores
                magento_categories = magento_analysis.get("categories", {})
                for category, data in magento_categories.items():
                    if isinstance(data, dict) and "score" in data:
                        category_scores[f"magento_{category}"] = float(data["score"])
            
            logger.debug(f"Extracted category scores: {category_scores}")
            
        except Exception as e:
            logger.error(f"Error extracting category scores: {e}")
        
        return category_scores
    
    def _calculate_weighted_score(self, category_scores: Dict[str, float]) -> float:
        """Calculate weighted overall score."""
        try:
            weighted_sum = 0.0
            total_weight = 0.0
            
            # Map extracted scores to weighted categories
            score_mapping = {
                "performance": category_scores.get("performance", 0),
                "magento_configuration": category_scores.get("magento_configuration", 0),
                "security": category_scores.get("magento_security", 0),
                "optimization": category_scores.get("magento_optimization", 0),
                "seo": category_scores.get("magento_seo", 0)
            }
            
            # Use fallback if specific categories not available
            if not any(score_mapping.values()):
                # Use overall Magento score if available
                magento_overall = category_scores.get("magento_overall", 0)
                performance = category_scores.get("performance", 0)
                
                return (magento_overall * 0.6 + performance * 0.4)
            
            # Calculate weighted average
            for category, weight in self.CATEGORY_WEIGHTS.items():
                score = score_mapping.get(category, 0)
                weighted_sum += score * weight
                total_weight += weight
            
            return weighted_sum / total_weight if total_weight > 0 else 0.0
            
        except Exception as e:
            logger.error(f"Error calculating weighted score: {e}")
            return 0.0
    
    def _determine_grade(self, score: float) -> str:
        """Determine letter grade based on score."""
        if score >= self.SCORE_THRESHOLDS["excellent"]:
            return "A"
        elif score >= self.SCORE_THRESHOLDS["good"]:
            return "B"
        elif score >= self.SCORE_THRESHOLDS["needs_improvement"]:
            return "C"
        else:
            return "F"
    
    def _extract_key_metrics(self, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """Extract key performance metrics for summary display."""
        metrics = {}
        
        try:
            # Core Web Vitals from PageSpeed
            desktop_perf = analysis_results.get("performance_results", {}).get("desktop_performance", {})
            if "core_web_vitals" in desktop_perf:
                vitals = desktop_perf["core_web_vitals"]
                metrics["core_web_vitals"] = {
                    "lcp": vitals.get("largest_contentful_paint", {}).get("display_value", "N/A"),
                    "fid": vitals.get("first_input_delay", {}).get("display_value", "N/A"),
                    "cls": vitals.get("cumulative_layout_shift", {}).get("display_value", "N/A")
                }
            
            # TTFB from performance analysis
            ttfb_analysis = analysis_results.get("performance_results", {}).get("ttfb_analysis", {})
            if "ttfb_ms" in ttfb_analysis:
                metrics["ttfb_ms"] = ttfb_analysis["ttfb_ms"]
            
            # Magento detection confidence
            magento_detection = analysis_results.get("magento_detection", {})
            metrics["magento_confidence"] = magento_detection.get("confidence", 0)
            metrics["magento_version"] = magento_detection.get("version", "Unknown")
            
        except Exception as e:
            logger.error(f"Error extracting key metrics: {e}")
        
        return metrics
    
    def _generate_recommendations(self, analysis_results: Dict[str, Any], category_scores: Dict[str, float]) -> List[Dict[str, Any]]:
        """Generate prioritized recommendations based on analysis results."""
        recommendations = []
        
        try:
            # Collect recommendations from all analysis components
            all_recommendations = []
            
            # From Magento analysis
            magento_analysis = analysis_results.get("magento_analysis", {})
            magento_categories = magento_analysis.get("categories", {})
            
            for category, data in magento_categories.items():
                if isinstance(data, dict) and "recommendations" in data:
                    for rec in data["recommendations"]:
                        # Use content-based priority and impact calculation
                        priority = self._determine_content_based_priority(category, rec)
                        impact = self._determine_content_based_impact(category, rec)
                        
                        all_recommendations.append({
                            "category": f"magento_{category}",
                            "recommendation": rec,
                            "priority": priority,
                            "impact": impact
                        })
            
            # From performance analysis
            performance_comprehensive = analysis_results.get("performance_comprehensive", {})
            perf_categories = performance_comprehensive.get("categories", {})
            
            for category, data in perf_categories.items():
                if isinstance(data, dict) and "recommendations" in data:
                    for rec in data["recommendations"]:
                        # Use content-based priority and impact calculation
                        priority = self._determine_content_based_priority(category, rec)
                        impact = self._determine_content_based_impact(category, rec)
                        
                        all_recommendations.append({
                            "category": f"performance_{category}",
                            "recommendation": rec,
                            "priority": priority,
                            "impact": impact
                        })
            
            # Sort by priority and impact
            recommendations = sorted(
                all_recommendations,
                key=lambda x: (x["priority"], x["impact"] == "high"),
                reverse=True
            )
            
            # Show all high-priority recommendations, limit others to prevent overwhelm
            high_priority = [r for r in recommendations if r["priority"] >= 4]
            medium_priority = [r for r in recommendations if 2 <= r["priority"] < 4]
            low_priority = [r for r in recommendations if r["priority"] < 2]
            
            # Always show all critical issues, limit medium/low based on count
            if len(high_priority) <= 15:
                # If few critical issues, can show more medium ones
                recommendations = high_priority + medium_priority[:8] + low_priority[:2]
            else:
                # If many critical issues, focus on those
                recommendations = high_priority[:20] + medium_priority[:3]
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
        
        return recommendations
    
    def _determine_content_based_priority(self, category: str, recommendation: str) -> int:
        """Determine priority based on category and recommendation content."""
        rec_lower = recommendation.lower()
        
        # Critical (5) - Only truly critical security and performance issues
        if category == "security" and not ("skipped" in rec_lower or "compliance" in rec_lower):
            return 5
        if any(word in rec_lower for word in ["critical", "vulnerability", "exposed files"]):
            return 5
        if "reduce initial server response time" in rec_lower:
            return 5
            
        # High (4) - Important performance optimizations
        if any(word in rec_lower for word in ["css merging", "javascript merging", "bundling"]):
            return 4
        if "lazy loading" in rec_lower:
            return 4
        if "minify" in rec_lower and ("css" in rec_lower or "javascript" in rec_lower):
            return 4
        if category == "response_time" and "optimize" in rec_lower:
            return 4
            
        # Medium (3) - Good to have optimizations and moderate issues
        if any(word in rec_lower for word in ["responsive images", "webp", "modern formats", "next-gen"]):
            return 3
        if "caching" in rec_lower or "cache" in rec_lower:
            return 3
        if category == "frontend_performance":
            return 3
        if "server header" in rec_lower and "disclosing" in rec_lower:
            return 3
        if category == "asset_optimization":
            return 3
            
        # Low (2) - SEO, minor tweaks, and compliance items
        if category == "seo":
            return 2
        if any(word in rec_lower for word in ["robots.txt", "sitemap", "meta tag"]):
            return 2
        if "skipped for compliance" in rec_lower:
            return 2
        if category == "server_configuration" and "header" in rec_lower:
            return 2
            
        # Default based on category fallback
        category_priority = {
            "configuration": 3,
            "optimization": 3,
            "extensions": 2
        }
        
        return category_priority.get(category, 3)
    
    def _determine_content_based_impact(self, category: str, recommendation: str) -> str:
        """Determine impact based on category and recommendation content."""
        rec_lower = recommendation.lower()
        
        # High impact items - Major performance and security improvements
        if category == "security" and not ("skipped" in rec_lower or "compliance" in rec_lower):
            return "high"
        if "reduce initial server response time" in rec_lower:
            return "high"
        if any(word in rec_lower for word in ["css merging", "javascript merging", "bundling"]):
            return "high"
        if "lazy loading" in rec_lower:
            return "high"
        if category == "response_time" and "optimize" in rec_lower:
            return "high"
            
        # Medium impact items - Useful optimizations
        if any(word in rec_lower for word in ["responsive images", "webp", "modern formats", "next-gen"]):
            return "medium"
        if "caching" in rec_lower or "cache" in rec_lower:
            return "medium"
        if "minify" in rec_lower:
            return "medium"
        if category == "asset_optimization":
            return "medium"
        if category == "frontend_performance":
            return "medium"
            
        # Low impact items - SEO, compliance, and minor tweaks
        if category == "seo":
            return "low"
        if any(word in rec_lower for word in ["robots.txt", "sitemap", "meta tag"]):
            return "low"
        if "server header" in rec_lower and "disclosing" in rec_lower:
            return "low"
        if "skipped for compliance" in rec_lower:
            return "low"
            
        # Default to medium
        return "medium"
    
    def _determine_priority(self, category: str, score: float) -> int:
        """Legacy method - Determine priority based on category and score."""
        # Higher priority for lower scores
        if score < 30:
            return 5  # Critical
        elif score < 50:
            return 4  # High
        elif score < 70:
            return 3  # Medium
        elif score < 85:
            return 2  # Low
        else:
            return 1  # Info
    
    def _create_score_breakdown(self, category_scores: Dict[str, float]) -> Dict[str, Any]:
        """Create detailed score breakdown for transparency."""
        breakdown = {
            "weights_used": self.CATEGORY_WEIGHTS,
            "individual_scores": category_scores,
            "score_ranges": {
                "excellent": "90-100",
                "good": "75-89", 
                "needs_improvement": "50-74",
                "poor": "0-49"
            }
        }
        
        return breakdown


# Global instance
scoring_service = ScoringService()

def get_scoring_service() -> ScoringService:
    """Get the global scoring service instance."""
    return scoring_service