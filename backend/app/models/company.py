from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class Company(BaseModel):
    """Normalized company representation used by JobBoard."""

    model_config = ConfigDict(
        from_attributes=True,
        extra="ignore",
    )

    id: str | None = None
    name: str
    slug: str | None = None

    logo_url: str | None = None
    website_url: str | None = None

    description: str | None = None
    industry: str | None = None

    location: str | None = None
    country: str | None = None
    city: str | None = None

    company_size: str | None = None
    founded_year: int | None = None

    job_count: int = Field(default=0, ge=0)
    active_job_count: int = Field(default=0, ge=0)

    is_verified: bool = False
    is_featured: bool = False

    metadata: dict[str, Any] = Field(default_factory=dict)

    created_at: datetime | None = None
    updated_at: datetime | None = None
