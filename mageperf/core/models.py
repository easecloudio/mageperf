"""Shared data models and base classes for mageperf analysis results."""

from abc import ABC, abstractmethod
from dataclasses import asdict, dataclass
from typing import Any, Dict, List, Optional, Type

_ANALYZER_REGISTRY: List[Type["BaseAnalyzer"]] = []


def register_analyzer(cls: Type["BaseAnalyzer"]) -> Type["BaseAnalyzer"]:
    """Class decorator — registers an analyzer for automatic discovery by the orchestrator."""
    _ANALYZER_REGISTRY.append(cls)
    return cls


def get_registered_analyzers() -> List[Type["BaseAnalyzer"]]:
    """Return a copy of all registered analyzer classes."""
    return list(_ANALYZER_REGISTRY)


@dataclass
class CheckResult:
    """Result from a single analysis category."""

    category: str
    score: float
    details: Dict[str, Any]
    recommendations: List[str]
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class BaseAnalyzer(ABC):
    """Contract for all mageperf analysis modules.

    Implement this when creating a new analyzer:
      1. Subclass BaseAnalyzer and define `name` and `run()`.
      2. Decorate the class with @register_analyzer.
    The orchestrator discovers analyzers through the registry — no orchestrator
    changes are needed when adding a new one.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Unique key used to store this analyzer's result in the results dict."""

    @abstractmethod
    async def run(self, url: str, **kwargs: Any) -> Dict[str, Any]:
        """Run the analysis and return a structured result dict."""
