from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CompanyBase(BaseModel):
    """Shared company fields."""

    model_config = ConfigDict(extra="ignore")

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


class CompanyResponse(CompanyBase):
    """API response for a company."""

    id: str

    job_count: int = Field(default=0, ge=0)
    active_job_count: int = Field(default=0, ge=0)

    is_verified: bool = False
    is_featured: bool = False

    created_at: datetime | None = None
    updated_at: datetime | None = None


class CompanyListResponse(BaseModel):
    """Paginated companies response."""

    success: bool = True
    data: list[CompanyResponse] = Field(default_factory=list)
    pagination: dict = Field(default_factory=dict)
