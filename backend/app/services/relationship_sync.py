from app.database import get_database


def slugify(value: str) -> str:
    return "-".join(
        value.lower().strip().split()
    ).replace("/", "-").replace("&", "and")


def sync_categories(db):
    jobs = (
        db.table("jobs")
        .select("category_name")
        .not_.is_("category_name", "null")
        .execute()
    )

    names = sorted({
        row["category_name"].strip()
        for row in (jobs.data or [])
        if row.get("category_name")
    })

    inserted = 0

    for name in names:
        existing = (
            db.table("categories")
            .select("id")
            .eq("name", name)
            .limit(1)
            .execute()
        )

        if existing.data:
            continue

        db.table("categories").insert({
            "name": name,
            "slug": slugify(name),
        }).execute()

        inserted += 1

    return inserted


def sync_companies(db):
    jobs = (
        db.table("jobs")
        .select("company_name")
        .not_.is_("company_name", "null")
        .execute()
    )

    names = sorted({
        row["company_name"].strip()
        for row in (jobs.data or [])
        if row.get("company_name")
    })

    inserted = 0

    for name in names:
        existing = (
            db.table("companies")
            .select("id")
            .eq("name", name)
            .limit(1)
            .execute()
        )

        if existing.data:
            continue

        db.table("companies").insert({
            "name": name,
            "slug": slugify(name),
        }).execute()

        inserted += 1

    return inserted


def main():
    print("=" * 50)
    print("JOBBOARD DATA RELATIONSHIP SYNC")
    print("=" * 50)

    db = get_database()

    categories = sync_categories(db)
    companies = sync_companies(db)

    print(f"NEW CATEGORIES: {categories}")
    print(f"NEW COMPANIES: {companies}")

    category_count = (
        db.table("categories")
        .select("id", count="exact")
        .execute()
    )

    company_count = (
        db.table("companies")
        .select("id", count="exact")
        .execute()
    )

    print(f"TOTAL CATEGORIES: {category_count.count or 0}")
    print(f"TOTAL COMPANIES: {company_count.count or 0}")
    print("=" * 50)


if __name__ == "__main__":
    main()
