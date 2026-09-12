import asyncio

from app.database import get_database
from app.trends.category_trends import CategoryTrendCalculator


async def main():
    print("=" * 70)
    print("JOBBOARD CATEGORY TREND ENGINE")
    print("=" * 70)

    db = get_database()

    calculator = CategoryTrendCalculator(db)

    trends = await calculator.calculate(
        days=7
    )

    print("CATEGORIES:", len(trends))
    print()

    for row in trends:
        print(
            f"Rank {row.get('trend_rank')}: "
            f"{row.get('category_name')} | "
            f"Score={row.get('trend_score')} | "
            f"Jobs={row.get('job_count')}"
        )

    print()
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
