from urllib.parse import urlparse


def is_valid_url(value: str | None) -> bool:
    """Check whether a value is an absolute HTTP(S) URL."""

    if not value:
        return False

    try:
        parsed = urlparse(
            value.strip()
        )

        return parsed.scheme in {
            "http",
            "https",
        } and bool(parsed.netloc)

    except ValueError:
        return False


def normalize_url(value: str | None) -> str | None:
    """Normalize an HTTP(S) URL."""

    if not value:
        return None

    url = value.strip()

    if not is_valid_url(url):
        return None

    return url


def get_domain(value: str | None) -> str | None:
    """Extract a hostname from a valid URL."""

    if not is_valid_url(value):
        return None

    parsed = urlparse(
        value.strip()
    )

    return parsed.netloc.lower()
