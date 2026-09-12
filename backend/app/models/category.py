from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class Category(BaseModel):
    """Normalized job category representation used by JobBoard."""

    model_config = ConfigDict(
        from_attributes=True,
        extra="ignore",
    )

    id: str | None = None

    name: str
    slug: str | None = None
    description: str | None = None

    icon: str | None = None
    image_url: str | None = None

    parent_id: str | None = None

    job_count: int = Field(default=0, ge=0)
    active_job_count: int = Field(default=0, ge=0)

    is_featured: bool = False
    is_active: bool = True

    metadata: dict[str, Any] = Field(default_factory=dict)

    created_at: datetime | None = None
    updated_at: datetime | None = None
