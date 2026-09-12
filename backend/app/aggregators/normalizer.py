import re
from datetime import datetime, timezone
from typing import Any


class JobNormalizer:
    """Convert provider-specific jobs into JobBoard's common format."""

    @staticmethod
    def clean_text(value: Any) -> str | None:
        if value is None:
            return None

        text = re.sub(r"<[^>]+>", " ", str(value))
        text = re.sub(r"\s+", " ", text).strip()

        return text or None

    @staticmethod
    def extract_location(
        raw_job: dict[str, Any],
    ) -> dict[str, str | None]:
        """
        Extract location from supported provider formats.

        No location is invented when the source does not provide one.
        """

        location = raw_job.get("location")

        city = raw_job.get("city")
        state = raw_job.get("state")
        country = raw_job.get("country")

        if isinstance(location, dict):
            city = (
                city
                or location.get("city")
            )

            state = (
                state
                or location.get("state")
            )

            country = (
                country
                or location.get("country")
            )

            location_name = (
                location.get("display_name")
                or location.get("name")
            )

            if not location_name:
                parts = [
                    city,
                    state,
                    country,
                ]

                location_name = ", ".join(
                    str(part).strip()
                    for part in parts
                    if part
                )

        elif location:
            location_name = str(location)

        else:
            location_name = None

        # Remotive and similar remote-job providers.
        candidate_location = (
            raw_job.get(
                "candidate_required_location"
            )
            or raw_job.get(
                "candidate_required_locations"
            )
            or raw_job.get(
                "location_name"
            )
        )

        if isinstance(
            candidate_location,
            list,
        ):
            candidate_location = ", ".join(
                str(item).strip()
                for item in candidate_location
                if item
            )

        if not location_name and candidate_location:
            location_name = str(
                candidate_location
            )

        location_name = (
            JobNormalizer.clean_text(
                location_name
            )
        )

        city = JobNormalizer.clean_text(city)
        state = JobNormalizer.clean_text(state)
        country = JobNormalizer.clean_text(country)

        return {
            "location": location_name,
            "city": city,
            "state": state,
            "country": country,
        }

    @staticmethod
    def normalize(
        raw_job: dict[str, Any],
        provider: str | None = None,
    ) -> dict[str, Any]:

        provider_name = (
            provider
            or raw_job.get("_provider")
            or "unknown"
        )

        title = (
            raw_job.get("title")
            or raw_job.get("position")
            or raw_job.get("job_title")
            or "Untitled Job"
        )

        company = raw_job.get("company") or {}

        if isinstance(company, dict):
            company_name = (
                company.get("display_name")
                or company.get("name")
            )

            company_logo = (
                company.get("logo_url")
                or company.get("logo")
            )

        else:
            company_name = (
                str(company)
                if company
                else None
            )

            company_logo = None

        description = (
            raw_job.get("description")
            or raw_job.get("job_description")
        )

        location_data = (
            JobNormalizer.extract_location(
                raw_job
            )
        )

        apply_url = (
            raw_job.get("redirect_url")
            or raw_job.get("url")
            or raw_job.get("apply_url")
            or raw_job.get("application_url")
        )

        source_url = (
            raw_job.get("url")
            or raw_job.get("redirect_url")
            or apply_url
        )

        external_id = (
            raw_job.get("id")
            or raw_job.get("job_id")
            or raw_job.get("external_id")
        )

        published_at = (
            raw_job.get("created")
            or raw_job.get("publication_date")
            or raw_job.get("published_at")
        )

        if isinstance(published_at, str):
            try:
                published_at = datetime.fromisoformat(
                    published_at.replace(
                        "Z",
                        "+00:00",
                    )
                )
            except ValueError:
                published_at = None

        if published_at is None:
            published_at = datetime.now(
                timezone.utc
            )

        salary_min = raw_job.get("salary_min")
        salary_max = raw_job.get("salary_max")

        category = (
            raw_job.get("category")
            or raw_job.get("category_name")
        )

        if isinstance(category, dict):
            category = (
                category.get("label")
                or category.get("name")
            )

        job_type = (
            raw_job.get("job_type")
            or raw_job.get("employment_type")
        )

        work_mode = (
            raw_job.get("work_mode")
            or raw_job.get("remote_type")
        )

        if not work_mode:
            candidate_location = str(
                raw_job.get(
                    "candidate_required_location",
                    "",
                )
            ).lower()

            work_mode = (
                "remote"
                if "remote" in candidate_location
                else None
            )

        return {
            "external_id": (
                str(external_id)
                if external_id is not None
                else None
            ),
            "source": provider_name,
            "source_url": source_url,
            "title": JobNormalizer.clean_text(
                title
            ),
            "company_name": (
                JobNormalizer.clean_text(
                    company_name
                )
            ),
            "company_logo": company_logo,
            "description": (
                JobNormalizer.clean_text(
                    description
                )
            ),
            "location": location_data["location"],
            "city": location_data["city"],
            "state": location_data["state"],
            "country": location_data["country"],
            "job_type": (
                JobNormalizer.clean_text(
                    job_type
                )
            ),
            "work_mode": (
                JobNormalizer.clean_text(
                    work_mode
                )
            ),
            "category_name": (
                JobNormalizer.clean_text(
                    category
                )
            ),
            "salary_min": salary_min,
            "salary_max": salary_max,
            "published_at": published_at.isoformat(),
            "apply_url": apply_url,
            "metadata": {
                "provider": provider_name,
                "original_id": external_id,
            },
        }
