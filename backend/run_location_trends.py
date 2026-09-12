import asyncio

from app.database import get_database
from app.trends.location_trends import LocationTrendCalculator


async def main():
    print("=" * 70)
    print("JOBBOARD LOCATION TREND ENGINE")
    print("=" * 70)

    db = get_database()

    calculator = LocationTrendCalculator(db)

    trends = await calculator.calculate(
        days=7
    )

    print("LOCATIONS:", len(trends))
    print()

    if not trends:
        print("No location data available in the current job dataset.")
        print("The engine will not invent locations.")

    for row in trends:
        print(
            f"Rank {row.get('trend_rank')}: "
            f"{row.get('location_name')} | "
            f"Score={row.get('trend_score')} | "
            f"Jobs={row.get('job_count')} | "
            f"Status={row.get('trend_status')}"
        )

    print()
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
