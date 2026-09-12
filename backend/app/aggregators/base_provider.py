from abc import ABC, abstractmethod
from typing import Any


class BaseJobProvider(ABC):
    """Base interface that every external job provider must implement."""

    name: str = "unknown"

    @abstractmethod
    async def fetch_jobs(
        self,
        *,
        keyword: str | None = None,
        location: str | None = None,
        page: int = 1,
        limit: int = 100,
    ) -> list[dict[str, Any]]:
        """Fetch raw jobs from the provider."""
        raise NotImplementedError

    async def health_check(self) -> bool:
        """Return whether the provider is currently available."""
        return True
