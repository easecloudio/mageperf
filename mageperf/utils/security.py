import asyncio
import ipaddress
import socket
import typing
from urllib.parse import urlparse

import httpcore


class SSRFBlockedError(ValueError):
    """Raised when a request would connect to a non-public address."""


def _is_private_ip(ip_str: str) -> bool:
    """Return True if the IP is not a publicly routable unicast address."""
    try:
        ip = ipaddress.ip_address(ip_str)
    except ValueError:
        return True  # Treat unparseable IPs as private to be safe
    # ::ffff:127.0.0.1 and similar must be judged as the IPv4 address they map to
    if isinstance(ip, ipaddress.IPv6Address) and ip.ipv4_mapped is not None:
        ip = ip.ipv4_mapped
    return (
        not ip.is_global
        or ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_multicast
        or ip.is_reserved
        or ip.is_unspecified
    )


def _check_addresses(hostname: str, addresses: typing.Iterable[str]) -> None:
    for addr in addresses:
        if _is_private_ip(addr):
            raise SSRFBlockedError(
                f"{hostname!r} resolves to a private/internal address ({addr}). "
                "Only public URLs are supported."
            )


def validate_url_not_ssrf(url: str) -> None:
    """Raise ValueError if the URL resolves to a private/internal IP address.

    This is an early, user-friendly check on the URL given on the command
    line. It is not sufficient on its own: redirects, asset URLs and DNS
    rebinding are handled by SSRFGuardBackend, which re-validates on every
    connection the shared HTTP client opens.
    """
    parsed = urlparse(url)
    hostname = parsed.hostname
    if not hostname:
        raise ValueError(f"URL has no hostname: {url!r}")

    try:
        results = socket.getaddrinfo(hostname, None)
    except socket.gaierror as exc:
        raise ValueError(f"Cannot resolve hostname {hostname!r}: {exc}") from exc

    _check_addresses(hostname, (r[4][0] for r in results))


async def _resolve(host: str, port: int) -> typing.List[str]:
    loop = asyncio.get_running_loop()
    infos = await loop.getaddrinfo(host, port, type=socket.SOCK_STREAM)
    addresses: typing.List[str] = []
    for info in infos:
        addr = info[4][0]
        if addr not in addresses:
            addresses.append(addr)
    return addresses


class SSRFGuardBackend(httpcore.AsyncNetworkBackend):
    """Network backend that only opens TCP connections to public addresses.

    The hostname is resolved once, every resulting address is checked, and
    the socket is opened to one of those already-validated addresses. That
    closes the gap between "check" and "connect" that DNS rebinding relies
    on. TLS is negotiated later by httpcore using the original hostname, so
    SNI and certificate verification are unaffected.
    """

    def __init__(self, backend: typing.Optional[httpcore.AsyncNetworkBackend] = None) -> None:
        self._backend = backend or httpcore.AnyIOBackend()

    async def connect_tcp(
        self,
        host: str,
        port: int,
        timeout: typing.Optional[float] = None,
        local_address: typing.Optional[str] = None,
        socket_options: typing.Optional[typing.Iterable[typing.Any]] = None,
    ) -> httpcore.AsyncNetworkStream:
        try:
            addresses = await asyncio.wait_for(_resolve(host, port), timeout)
        except asyncio.TimeoutError as exc:
            raise httpcore.ConnectTimeout(f"Timed out resolving {host!r}") from exc
        except OSError as exc:
            raise httpcore.ConnectError(f"Cannot resolve hostname {host!r}: {exc}") from exc
        if not addresses:
            raise httpcore.ConnectError(f"Cannot resolve hostname {host!r}")

        _check_addresses(host, addresses)

        last_exc: typing.Optional[Exception] = None
        for addr in addresses:
            try:
                return await self._backend.connect_tcp(
                    addr,
                    port,
                    timeout=timeout,
                    local_address=local_address,
                    socket_options=socket_options,
                )
            except (httpcore.ConnectError, httpcore.ConnectTimeout) as exc:
                last_exc = exc
        assert last_exc is not None
        raise last_exc

    async def connect_unix_socket(self, path, timeout=None, socket_options=None):
        raise SSRFBlockedError("Unix socket connections are not allowed")

    async def sleep(self, seconds: float) -> None:
        await self._backend.sleep(seconds)
