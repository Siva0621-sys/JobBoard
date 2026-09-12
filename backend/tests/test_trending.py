import pytest


@pytest.mark.asyncio
async def test_job_trend_calculator_empty_database():
    from app.trends.job_trends import JobTrendCalculator

    class EmptyQuery:
        def select(self, *_args):
            return self

        def gte(self, *_args):
            return self

        def execute(self):
            return type(
                "Response",
                (),
                {"data": []},
            )()

    class EmptyDatabase:
        def table(self, *_args):
            return EmptyQuery()

    calculator = JobTrendCalculator(
        EmptyDatabase()
    )

    result = await calculator.calculate()

    assert result == []
