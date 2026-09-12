import asyncio

from app.database import get_database
from app.trends.skill_trends import SkillTrendCalculator


async def main():
    print("=" * 70)
    print("JOBBOARD SKILL TREND ENGINE")
    print("=" * 70)

    db = get_database()

    calculator = SkillTrendCalculator(db)

    trends = await calculator.calculate(
        days=7
    )

    print("SKILLS:", len(trends))
    print()

    for row in trends:
        print(
            f"Rank {row.get('trend_rank')}: "
            f"{row.get('skill_name')} | "
            f"Score={row.get('trend_score')} | "
            f"Jobs={row.get('job_count')}"
        )

    print()
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
