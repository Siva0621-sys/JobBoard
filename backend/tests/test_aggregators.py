def test_provider_manager_exists():
    from app.aggregators.provider_manager import ProviderManager

    manager = ProviderManager()

    assert manager is not None


def test_deduplicator_removes_duplicates():
    from app.aggregators.deduplicator import JobDeduplicator

    deduplicator = JobDeduplicator()

    jobs = [
        {
            "title": "Python Developer",
            "company_name": "Example",
            "location": "India",
            "apply_url": "https://example.com/job/1",
        },
        {
            "title": "Python Developer",
            "company_name": "Example",
            "location": "India",
            "apply_url": "https://example.com/job/1",
        },
    ]

    result = deduplicator.deduplicate(jobs)

    assert len(result) == 1
