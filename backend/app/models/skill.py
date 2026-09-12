from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class Skill(BaseModel):
    """Normalized job skill representation used by JobBoard."""

    model_config = ConfigDict(
        from_attributes=True,
        extra="ignore",
    )

    id: str | None = None

    name: str
    slug: str | None = None
    category: str | None = None
    description: str | None = None

    job_count: int = Field(default=0, ge=0)
    active_job_count: int = Field(default=0, ge=0)

    trend_score: float = Field(default=0.0, ge=0.0)
    trend_rank: int | None = Field(default=None, ge=1)

    is_featured: bool = False
    is_active: bool = True

    metadata: dict[str, Any] = Field(default_factory=dict)

    created_at: datetime | None = None
    updated_at: datetime | None = None
