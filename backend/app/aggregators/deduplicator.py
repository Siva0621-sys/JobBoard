import hashlib
import re
from typing import Any


class JobDeduplicator:
    """Detect duplicate jobs from multiple external providers."""

    @staticmethod
    def normalize_key(value: Any) -> str:
        if value is None:
            return ""

        value = str(value).lower().strip()
        value = re.sub(r"[^a-z0-9]+", " ", value)

        return re.sub(r"\s+", " ", value).strip()

    @classmethod
    def fingerprint(cls, job: dict[str, Any]) -> str:
        """Create a stable fingerprint for a job."""

        external_id = job.get("external_id")
        source = job.get("source")

        if external_id:
            raw = (
                f"{source or 'unknown'}:"
                f"{external_id}"
            )
        else:
            title = cls.normalize_key(
                job.get("title")
            )
            company = cls.normalize_key(
                job.get("company_name")
            )
            location = cls.normalize_key(
                job.get("location")
            )

            raw = f"{title}|{company}|{location}"

        return hashlib.sha256(
            raw.encode("utf-8")
        ).hexdigest()

    @classmethod
    def deduplicate(
        cls,
        jobs: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """Remove duplicate jobs while preserving order."""

        unique_jobs: list[dict[str, Any]] = []
        seen: set[str] = set()

        for job in jobs:
            fingerprint = cls.fingerprint(job)

            if fingerprint in seen:
                continue

            seen.add(fingerprint)

            normalized_job = {
                **job,
                "fingerprint": fingerprint,
            }

            unique_jobs.append(normalized_job)

        return unique_jobs
