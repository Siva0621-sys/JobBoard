import re
from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any


SKILL_ALIASES = {
    "Python": ["python"],
    "JavaScript": ["javascript", "js"],
    "TypeScript": ["typescript"],
    "React": ["react", "react.js", "reactjs"],
    "Node.js": ["node.js", "nodejs"],
    "Java": ["java"],
    "C++": ["c++"],
    "C#": ["c#", "csharp"],
    "Go": ["golang", "go language"],
    "Ruby": ["ruby", "rails"],
    "PHP": ["php"],
    "SQL": ["sql"],
    "PostgreSQL": ["postgresql", "postgres"],
    "MySQL": ["mysql"],
    "AWS": ["aws", "amazon web services"],
    "Azure": ["azure"],
    "Google Cloud": ["google cloud", "gcp"],
    "Docker": ["docker"],
    "Kubernetes": ["kubernetes", "k8s"],
    "DevOps": ["devops"],
    "Git": ["git", "github"],
    "Linux": ["linux"],
    "Machine Learning": [
        "machine learning",
        "machine-learning",
    ],
    "Artificial Intelligence": [
        "artificial intelligence",
        "ai models",
        "ai systems",
    ],
    "Deep Learning": ["deep learning"],
    "NLP": [
        "natural language processing",
        "nlp",
    ],
    "LLM": [
        "large language model",
        "large language models",
        "llm",
        "llms",
    ],
    "Data Engineering": [
        "data engineering",
        "data engineer",
    ],
    "Data Analysis": [
        "data analysis",
        "data analyst",
        "data analytics",
    ],
    "TensorFlow": ["tensorflow"],
    "PyTorch": ["pytorch"],
    "Selenium": ["selenium"],
    "QA Testing": [
        "quality assurance",
        "qa testing",
        "automation testing",
    ],
    "Cybersecurity": [
        "cybersecurity",
        "cyber security",
        "information security",
    ],
    "SEO": [
        "seo",
        "search engine optimization",
    ],
    "Content Writing": [
        "content writing",
        "content writer",
        "copywriting",
        "copywriter",
    ],
    "Communication": [
        "communication skills",
        "communication",
    ],
    "Project Management": [
        "project management",
        "project manager",
    ],
    "Bookkeeping": ["bookkeeping"],
    "Sales": [
        "sales",
        "sales representative",
    ],
}


def contains_skill(
    text: str,
    alias: str,
) -> bool:
    text_lower = text.lower()
    alias_lower = alias.lower()

    if len(alias_lower) <= 3:
        return bool(
            re.search(
                rf"\b{re.escape(alias_lower)}\b",
                text_lower,
            )
        )

    return alias_lower in text_lower


def extract_skills(
    text: str,
) -> list[str]:
    found: list[str] = []

    for skill_name, aliases in SKILL_ALIASES.items():
        if any(
            contains_skill(text, alias)
            for alias in aliases
        ):
            found.append(skill_name)

    return found


class SkillTrendCalculator:
    """
    Calculate skill demand from real job text.

    A skill's trend score is based on its recent job count.

    If historical data exists, percentage change is calculated.
    New skills are marked with a positive count-based score.
    Skills with no recent jobs are excluded from the
    current trending list.
    """

    def __init__(self, db: Any) -> None:
        self.db = db

    async def calculate(
        self,
        days: int = 7,
    ) -> list[dict[str, Any]]:
        now = datetime.now(timezone.utc)

        recent_start = now - timedelta(days=days)
        previous_start = recent_start - timedelta(days=days)

        result = (
            self.db.table("jobs")
            .select(
                "id,title,description,published_at"
            )
            .gte(
                "published_at",
                previous_start.isoformat(),
            )
            .lte(
                "published_at",
                now.isoformat(),
            )
            .eq(
                "active",
                True,
            )
            .execute()
        )

        jobs = result.data or []

        recent_counts: Counter[str] = Counter()
        previous_counts: Counter[str] = Counter()

        for job in jobs:
            published = job.get("published_at")

            if not published:
                continue

            try:
                published_dt = datetime.fromisoformat(
                    str(published).replace(
                        "Z",
                        "+00:00",
                    )
                )

                if published_dt.tzinfo is None:
                    published_dt = published_dt.replace(
                        tzinfo=timezone.utc,
                    )

            except (ValueError, TypeError):
                continue

            title = job.get("title") or ""
            description = job.get("description") or ""

            text = f"{title} {description}"

            detected_skills = extract_skills(text)

            target = (
                recent_counts
                if published_dt >= recent_start
                else previous_counts
            )

            for skill in detected_skills:
                target[skill] += 1

        rows: list[dict[str, Any]] = []

        for skill_name, recent_count in recent_counts.items():
            previous_count = previous_counts.get(
                skill_name,
                0,
            )

            if previous_count > 0:
                change_percent = round(
                    (
                        (
                            recent_count
                            - previous_count
                        )
                        / previous_count
                    )
                    * 100,
                    2,
                )
                trend_score = change_percent
                trend_status = (
                    "up"
                    if change_percent > 0
                    else "down"
                    if change_percent < 0
                    else "stable"
                )
            else:
                change_percent = None
                trend_score = float(
                    recent_count
                )
                trend_status = "new"

            rows.append(
                {
                    "skill_name": skill_name,
                    "trend_score": trend_score,
                    "job_count": recent_count,
                    "period_days": days,
                    "trend_status": trend_status,
                }
            )

        rows.sort(
            key=lambda row: (
                row["job_count"],
                row["trend_score"],
            ),
            reverse=True,
        )

        for rank, row in enumerate(
            rows,
            start=1,
        ):
            row["trend_rank"] = rank

        (
            self.db.table("skill_trends")
            .delete()
            .eq(
                "period_days",
                days,
            )
            .execute()
        )

        # Only database columns defined by the current
        # skill_trends schema are persisted.
        database_rows = []

        for row in rows:
            database_rows.append(
                {
                    "skill_name": row["skill_name"],
                    "trend_score": row["trend_score"],
                    "trend_rank": row["trend_rank"],
                    "job_count": row["job_count"],
                    "period_days": row["period_days"],
                }
            )

        if database_rows:
            (
                self.db.table("skill_trends")
                .insert(database_rows)
                .execute()
            )

        return rows
