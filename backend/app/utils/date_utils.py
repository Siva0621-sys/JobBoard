from datetime import datetime, timezone
from typing import Any


def utc_now() -> datetime:
    """Return the current UTC datetime."""

    return datetime.now(timezone.utc)


def parse_datetime(value: Any) -> datetime | None:
    """Parse common ISO datetime representations."""

    if value is None:
        return None

    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(
                tzinfo=timezone.utc
            )
        return value

    text = str(value).strip()

    if not text:
        return None

    text = text.replace(
        "Z",
        "+00:00",
    )

    try:
        parsed = datetime.fromisoformat(text)

        if parsed.tzinfo is None:
            parsed = parsed.replace(
                tzinfo=timezone.utc
            )

        return parsed
    except ValueError:
        return None


def to_iso(value: Any) -> str | None:
    """Convert a datetime-like value to ISO format."""

    parsed = parse_datetime(value)

    if parsed is None:
        return None

    return parsed.astimezone(
        timezone.utc
    ).isoformat()
