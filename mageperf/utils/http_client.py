import asyncio
from typing import Optional

import httpx

from mageperf.utils.logger import logger


class HTTPClient:
    _client: Optional[httpx.AsyncClient] = None
    _timeout_seconds: float = 20.0

    def override_timeout(self, seconds: float) -> None:
        """Set a custom timeout. Must be called before the first request."""
        self._timeout_seconds = seconds
        self._client = None  # Force recreation with new timeout

    def get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            t = self._timeout_seconds
            timeout = httpx.Timeout(timeout=t, connect=10.0, read=t, write=10.0)
            limits = httpx.Limits(max_keepalive_connections=20, max_connections=100)
            self._client = httpx.AsyncClient(
                timeout=timeout,
                limits=limits,
                follow_redirects=True,
                headers={"User-Agent": "mageperf/0.1.0 (EaseCloud; +https://easecloud.io)"},
            )
        return self._client

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None

    async def get_with_retry(
        self,
        url: str,
        max_retries: int = 3,
        backoff_factor: float = 1.0,
        **kwargs,
    ) -> httpx.Response:
        """GET with exponential-backoff retry on any httpx network error."""
        if max_retries < 1:
            raise ValueError(f"max_retries must be >= 1, got {max_retries}")
        client = self.get_client()
        last_error: Optional[Exception] = None
        for attempt in range(max_retries):
            try:
                return await client.get(url, **kwargs)
            except httpx.HTTPError as exc:
                last_error = exc
                if attempt < max_retries - 1:
                    await asyncio.sleep(backoff_factor * (2**attempt))
                else:
                    logger.debug("GET %s failed after %d attempts: %s", url, max_retries, exc)
        assert last_error is not None
        raise last_error

    async def head_with_retry(
        self,
        url: str,
        max_retries: int = 3,
        backoff_factor: float = 1.0,
        **kwargs,
    ) -> httpx.Response:
        """HEAD with exponential-backoff retry on any httpx network error."""
        if max_retries < 1:
            raise ValueError(f"max_retries must be >= 1, got {max_retries}")
        client = self.get_client()
        last_error: Optional[Exception] = None
        for attempt in range(max_retries):
            try:
                return await client.head(url, **kwargs)
            except httpx.HTTPError as exc:
                last_error = exc
                if attempt < max_retries - 1:
                    await asyncio.sleep(backoff_factor * (2**attempt))
                else:
                    logger.debug("HEAD %s failed after %d attempts: %s", url, max_retries, exc)
        assert last_error is not None
        raise last_error


http_client = HTTPClient()
