import asyncio
import httpx
from typing import Optional
from mageperf.utils.logger import logger


class HTTPClient:
    _client: Optional[httpx.AsyncClient] = None

    def get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            timeout = httpx.Timeout(timeout=20.0, connect=10.0, read=20.0, write=10.0)
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
        """Perform GET request with exponential backoff retry logic."""
        client = self.get_client()
        last_error = None
        for attempt in range(max_retries):
            try:
                response = await client.get(url, **kwargs)
                return response
            except (httpx.ConnectError, httpx.TimeoutException) as e:
                last_error = e
                if attempt < max_retries - 1:
                    await asyncio.sleep(backoff_factor * (2 ** attempt))
        raise last_error

    async def head_with_retry(
        self,
        url: str,
        max_retries: int = 3,
        backoff_factor: float = 1.0,
        **kwargs,
    ) -> httpx.Response:
        """Perform HEAD request with exponential backoff retry logic."""
        client = self.get_client()
        last_error = None
        for attempt in range(max_retries):
            try:
                response = await client.head(url, **kwargs)
                return response
            except (httpx.ConnectError, httpx.TimeoutException) as e:
                last_error = e
                if attempt < max_retries - 1:
                    await asyncio.sleep(backoff_factor * (2 ** attempt))
        raise last_error


http_client = HTTPClient()
