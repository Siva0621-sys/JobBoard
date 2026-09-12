import re
from typing import Any


def clean_text(value: Any) -> str:
    """Normalize text while preserving readable content."""

    if value is None:
        return ""

    text = str(value)

    text = re.sub(
        r"<[^>]+>",
        " ",
        text,
    )

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


def slugify(value: Any) -> str:
    """Create a URL-safe slug."""

    text = clean_text(value).lower()

    text = re.sub(
        r"[^a-z0-9]+",
        "-",
        text,
    )

    return text.strip("-")


def normalize_list(value: Any) -> list[str]:
    """Convert common provider list formats into strings."""

    if value is None:
        return []

    if isinstance(value, list):
        return [
            clean_text(item)
            for item in value
            if clean_text(item)
        ]

    if isinstance(value, str):
        parts = re.split(
            r"[,;|]",
            value,
        )

        return [
            clean_text(item)
            for item in parts
            if clean_text(item)
        ]

    return [clean_text(value)]
