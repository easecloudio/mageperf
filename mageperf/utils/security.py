import ipaddress
import socket
from urllib.parse import urlparse


def _is_private_ip(ip_str: str) -> bool:
    """Return True if the IP is in a private/reserved/loopback range."""
    try:
        ip = ipaddress.ip_address(ip_str)
        return (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip.is_unspecified
        )
    except ValueError:
        return True  # Treat unparseable IPs as private to be safe


def validate_url_not_ssrf(url: str) -> None:
    """Raise ValueError if the URL resolves to a private/internal IP address.

    This prevents SSRF attacks where a user-supplied URL points to an
    internal host (RFC1918, loopback, link-local, AWS IMDS, etc.).
    """
    parsed = urlparse(url)
    hostname = parsed.hostname
    if not hostname:
        raise ValueError(f"URL has no hostname: {url!r}")

    try:
        results = socket.getaddrinfo(hostname, None)
    except socket.gaierror as exc:
        raise ValueError(f"Cannot resolve hostname {hostname!r}: {exc}") from exc

    for result in results:
        addr = result[4][0]
        if _is_private_ip(addr):
            raise ValueError(
                f"URL resolves to a private/internal address ({addr}). "
                "Only public URLs are supported."
            )
