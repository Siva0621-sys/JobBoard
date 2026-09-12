from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class JobBase(BaseModel):
    """Shared job fields."""

    model_config = ConfigDict(extra="ignore")

    title: str
    description: str | None = None
    company_id: str | None = None
    company_name: str | None = None
    company_logo: str | None = None

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

    skills: list[str] = Field(default_factory=list)
    responsibilities: list[str] = Field(default_factory=list)
    requirements: list[str] = Field(default_factory=list)


class JobResponse(JobBase):
    """API response for a job."""

    id: str
    external_id: str | None = None
    source: str | None = None
    source_url: str | None = None
    apply_url: str | None = None

    published_at: datetime | None = None
    expires_at: datetime | None = None

    views: int = 0
    is_active: bool = True
    is_featured: bool = False

    created_at: datetime | None = None
    updated_at: datetime | None = None


class JobListResponse(BaseModel):
    """Paginated jobs response."""

    success: bool = True
    data: list[JobResponse] = Field(default_factory=list)
    pagination: dict = Field(default_factory=dict)
