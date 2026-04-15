import pytest
from mageperf.utils.logger import logger
from mageperf.utils.http_client import http_client

def test_logger_is_configured():
    assert logger.name == "mageperf"

def test_http_client_singleton():
    client_a = http_client.get_client()
    client_b = http_client.get_client()
    assert client_a is client_b

@pytest.mark.asyncio
async def test_http_client_close():
    http_client.get_client()  # ensure initialized
    await http_client.close()
    assert http_client._client is None
