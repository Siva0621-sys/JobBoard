import logging

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.categories import router as categories_router
from app.api.companies import router as companies_router
from app.api.jobs import router as jobs_router
from app.api.search import router as search_router
from app.api.stats import router as stats_router
from app.api.trending import router as trending_router
from app.config import settings
from app.scheduler.jobs_scheduler import JobBoardScheduler


logging.basicConfig(
    level=getattr(
        logging,
        settings.log_level.upper(),
        logging.INFO,
    ),
)

scheduler = JobBoardScheduler(
    sync_interval_minutes=(
        settings.job_sync_interval_minutes
    ),
    trend_interval_minutes=(
        settings.trend_refresh_interval_minutes
    ),
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.job_sync_enabled:
        scheduler.start()

    yield

    scheduler.stop()


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "name": settings.app_name,
        "status": "running",
        "automation": {
            "job_sync": settings.job_sync_enabled,
            "trend_refresh": settings.trend_engine_enabled,
        },
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "automation": {
            "job_sync": settings.job_sync_enabled,
            "trend_engine": settings.trend_engine_enabled,
        },
    }


app.include_router(
    jobs_router,
    prefix=f"{settings.api_prefix}/jobs",
    tags=["Jobs"],
)

app.include_router(
    companies_router,
    prefix=f"{settings.api_prefix}/companies",
    tags=["Companies"],
)

app.include_router(
    categories_router,
    prefix=f"{settings.api_prefix}/categories",
    tags=["Categories"],
)

app.include_router(
    search_router,
    prefix=f"{settings.api_prefix}/search",
    tags=["Search"],
)

app.include_router(
    trending_router,
    prefix=f"{settings.api_prefix}/trending",
    tags=["Trending"],
)

app.include_router(
    stats_router,
    prefix=f"{settings.api_prefix}/stats",
    tags=["Statistics"],
)
