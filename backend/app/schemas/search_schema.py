from pydantic import BaseModel, ConfigDict, Field


class JobSearchRequest(BaseModel):
    """Search filters accepted by the JobBoard API."""

    model_config = ConfigDict(extra="ignore")

    keyword: str | None = None
    location: str | None = None
    category: str | None = None
    job_type: str | None = None
    work_mode: str | None = None

    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)


class SearchPagination(BaseModel):
    """Pagination information for search results."""

    page: int
    limit: int
    total: int
    total_pages: int


class JobSearchResponse(BaseModel):
    """Search response returned by the API."""

    success: bool = True
    data: list[dict] = Field(default_factory=list)
    query: JobSearchRequest
    pagination: SearchPagination
