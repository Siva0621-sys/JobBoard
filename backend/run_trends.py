import asyncio

from app.database import get_database
from app.trends.trend_engine import TrendEngine


async def main():
    print("=" * 60)
    print("JOBBOARD TREND ENGINE")
    print("=" * 60)

    db = get_database()
    engine = TrendEngine(db)

    trends = await engine.calculate_job_trends(days=7)

    print("TRENDS CALCULATED:", len(trends))
    print()

    for index, trend in enumerate(trends, start=1):
        print(f"{index}. {trend}")

    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
