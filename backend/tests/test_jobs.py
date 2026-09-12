def test_job_title_is_required():
    from app.models.job import Job

    job = Job(
        title="Python Developer",
        company_name="Example Company",
    )

    assert job.title == "Python Developer"


def test_job_defaults():
    from app.models.job import Job

    job = Job(
        title="Frontend Developer",
    )

    assert job.skills == []
    assert job.active is True
    assert job.featured is False
