from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CategoryBase(BaseModel):
    """Shared category fields."""

    model_config = ConfigDict(extra="ignore")

    name: str
    slug: str | None = None
    description: str | None = None

    icon: str | None = None
    image_url: str | None = None

    parent_id: str | None = None


class CategoryResponse(CategoryBase):
    """API response for a category."""

    id: str

    job_count: int = Field(default=0, ge=0)
    active_job_count: int = Field(default=0, ge=0)

    is_featured: bool = False
    is_active: bool = True

    created_at: datetime | None = None
    updated_at: datetime | None = None


class CategoryListResponse(BaseModel):
    """Category collection response."""

    success: bool = True
    data: list[CategoryResponse] = Field(default_factory=list)
    pagination: dict = Field(default_factory=dict)
