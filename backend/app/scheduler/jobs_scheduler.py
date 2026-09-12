import asyncio
import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.aggregators.sync_service import JobSyncService
from app.database import get_database
from app.trends.category_trends import CategoryTrendCalculator
from app.trends.job_trends import JobTrendCalculator
from app.trends.location_trends import LocationTrendCalculator
from app.trends.skill_trends import SkillTrendCalculator


logger = logging.getLogger(__name__)


class JobBoardScheduler:
    """Run automatic job synchronization and trend refresh."""

    def __init__(
        self,
        sync_interval_minutes: int = 30,
        trend_interval_minutes: int = 60,
    ) -> None:
        self.scheduler = AsyncIOScheduler()

        self.sync_interval_minutes = sync_interval_minutes
        self.trend_interval_minutes = trend_interval_minutes

    async def sync_jobs(self) -> None:
        try:
            logger.info("Starting automatic job sync.")

            result = await JobSyncService().sync(
                page=1,
                limit=100,
            )

            logger.info(
                "Automatic job sync completed: %s",
                result,
            )

        except Exception:
            logger.exception(
                "Automatic job sync failed."
            )

    async def refresh_trends(self) -> None:
        try:
            logger.info(
                "Starting automatic trend refresh."
            )

            db = get_database()

            job_trends = JobTrendCalculator(db)
            category_trends = CategoryTrendCalculator(db)
            skill_trends = SkillTrendCalculator(db)
            location_trends = LocationTrendCalculator(db)

            await job_trends.calculate(days=7)
            await category_trends.calculate(days=7)
            await skill_trends.calculate(days=7)
            await location_trends.calculate(days=7)

            logger.info(
                "Automatic trend refresh completed."
            )

        except Exception:
            logger.exception(
                "Automatic trend refresh failed."
            )

    async def sync_and_refresh(self) -> None:
        await self.sync_jobs()
        await self.refresh_trends()

    def start(self) -> None:
        if self.scheduler.running:
            return

        self.scheduler.add_job(
            self.sync_jobs,
            "interval",
            minutes=self.sync_interval_minutes,
            id="job_sync",
            replace_existing=True,
            max_instances=1,
            coalesce=True,
        )

        self.scheduler.add_job(
            self.refresh_trends,
            "interval",
            minutes=self.trend_interval_minutes,
            id="trend_refresh",
            replace_existing=True,
            max_instances=1,
            coalesce=True,
        )

        self.scheduler.start()

        logger.info(
            "JobBoard scheduler started. "
            "Job sync=%s min, trends=%s min.",
            self.sync_interval_minutes,
            self.trend_interval_minutes,
        )

    def stop(self) -> None:
        if self.scheduler.running:
            self.scheduler.shutdown(
                wait=False
            )

            logger.info(
                "JobBoard scheduler stopped."
            )


async def run_initial_sync() -> None:
    scheduler = JobBoardScheduler()

    await scheduler.sync_and_refresh()
