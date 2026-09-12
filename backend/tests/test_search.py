def test_search_request_defaults():
    from app.schemas.search_schema import JobSearchRequest

    request = JobSearchRequest()

    assert request.page == 1
    assert request.limit > 0


def test_search_request_keyword():
    from app.schemas.search_schema import JobSearchRequest

    request = JobSearchRequest(
        keyword="Python"
    )

    assert request.keyword == "Python"
