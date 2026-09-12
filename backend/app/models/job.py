from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class Job(BaseModel):
    """Normalized job representation used throughout JobBoard."""

    model_config = ConfigDict(
        from_attributes=True,
        extra="ignore",
    )

    id: str | None = None
    external_id: str | None = None
    source: str | None = None
    source_url: str | None = None

    title: str
    company_id: str | None = None
    company_name: str | None = None
    company_logo: str | None = None

    description: str | None = None
    responsibilities: list[str] = Field(default_factory=list)
    requirements: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)

    category_id: str | None = None
    category_slug: str | None = None
    category_name: str | None = None

    location: str | None = None
    country: str | None = None
    city: str | None = None

    job_type: str | None = None
    work_mode: str | None = None

    salary_min: float | None = None
    salary_max: float | None = None
    salary_currency: str | None = None
    salary_period: str | None = None

    published_at: datetime | None = None
    expires_at: datetime | None = None

    apply_url: str | None = None

    views: int = Field(default=0, ge=0)
    is_active: bool = True
    is_featured: bool = False

    metadata: dict[str, Any] = Field(default_factory=dict)

    created_at: datetime | None = None
    updated_at: datetime | None = None
