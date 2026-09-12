from app.database import get_database

db = get_database()

result = (
    db.table("job_trends")
    .select("*")
    .order("trend_rank")
    .execute()
)

print("=" * 70)
print("PERSISTED JOB TRENDS")
print("=" * 70)

print("ROWS:", len(result.data or []))
print()

for index, trend in enumerate(result.data or [], start=1):
    print(
        f"{index}. "
        f"Rank={trend.get('trend_rank')} | "
        f"Score={trend.get('trend_score')} | "
        f"Recent Jobs={trend.get('recent_count')} | "
        f"Previous Jobs={trend.get('previous_count')} | "
        f"Views={trend.get('recent_views')} | "
        f"Job ID={trend.get('job_id')}"
    )

print("=" * 70)
