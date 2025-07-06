from datetime import datetime

import pytest

from src.util import calculate_streak


@pytest.mark.parametrize(
    "today, dates, expected_streak",
    [
        (
            datetime(2025, 7, 6),
            [datetime(2025, 7, 6), datetime(2025, 7, 5), datetime(2025, 7, 4)],
            3,
        ),
        (
            datetime(2025, 7, 6),
            [datetime(2025, 7, 6), datetime(2025, 7, 6), datetime(2025, 7, 4)],
            1,
        ),
        (
            datetime(2025, 7, 6),
            [datetime(2025, 7, 5), datetime(2025, 7, 4)],
            2,
        ),
        (
            datetime(2025, 7, 6),
            [],
            0,
        ),
        (
            datetime(2025, 7, 6),
            [datetime(2025, 7, 6)],
            1,
        ),
    ],
)
def test_calculate_streak(today, dates, expected_streak):
    assert calculate_streak(today, dates) == expected_streak
