import pytest
from mageperf.core.scoring_service import ScoringService


@pytest.fixture
def service():
    return ScoringService()


def test_grade_A_for_score_above_90(service):
    assert service._determine_grade(92) == "A"


def test_grade_B_for_score_75_to_89(service):
    assert service._determine_grade(80) == "B"


def test_grade_C_for_score_50_to_74(service):
    assert service._determine_grade(60) == "C"


def test_grade_D_for_score_25_to_49(service):
    assert service._determine_grade(35) == "D"


def test_grade_F_for_score_below_25(service):
    assert service._determine_grade(10) == "F"


def test_weighted_score_all_zeroes_returns_zero(service):
    scores = {
        "performance": 0,
        "magento_configuration": 0,
        "magento_security": 0,
        "magento_optimization": 0,
        "magento_seo": 0,
    }
    result = service._calculate_weighted_score(scores)
    assert result == 0.0


def test_weighted_score_all_hundreds(service):
    scores = {
        "performance": 100,
        "magento_configuration": 100,
        "magento_security": 100,
        "magento_optimization": 100,
        "magento_seo": 100,
    }
    result = service._calculate_weighted_score(scores)
    assert result == 100.0


def test_recommendations_sorted_by_priority(service):
    analysis = {
        "magento_analysis": {
            "categories": {
                "security": {"recommendations": ["Exposed admin path"], "score": 40},
                "seo": {"recommendations": ["Add robots.txt"], "score": 60},
            }
        },
        "performance_comprehensive": {"categories": {}},
    }
    recs = service._generate_recommendations(analysis, {})
    priorities = [r["priority"] for r in recs]
    assert priorities == sorted(priorities, reverse=True)


def test_extract_category_scores_from_magento_analysis(service):
    analysis = {
        "magento_analysis": {
            "overall_score": 75,
            "categories": {
                "configuration": {"score": 80},
                "security": {"score": 60},
            }
        },
        "performance_comprehensive": {"overall_score": 85}
    }
    scores = service._extract_category_scores(analysis)
    assert scores.get("performance") == 85.0
    assert scores.get("magento_overall") == 75.0
    assert scores.get("magento_configuration") == 80.0


def test_score_breakdown_contains_weights(service):
    breakdown = service._create_score_breakdown({"performance": 80})
    assert "weights_used" in breakdown
    assert "individual_scores" in breakdown
    assert "score_ranges" in breakdown
