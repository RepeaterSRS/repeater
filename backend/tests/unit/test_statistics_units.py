from datetime import datetime, timezone
from uuid import uuid4

import pytest

from src.db.models import Review, ReviewFeedback
from src.statistics import (
    DifficultyRankings,
    calculate_daily_reviews,
    calculate_retention_rate,
    calculate_streak,
    calculate_success_rate,
    classify_deck_difficulty,
)


def create_review(feedback: ReviewFeedback, interval: int):
    return Review(
        card_id=uuid4(),
        user_id=uuid4(),
        reviewed_at=datetime.now(timezone.utc),
        feedback=feedback,
        interval=interval,
        repetitions=0,
        ease_factor=0.0,
    )


@pytest.mark.parametrize(
    "review_dates, expected_daily_reviews",
    [
        (
            [datetime(2025, 7, 6), datetime(2025, 7, 5), datetime(2025, 7, 5)],
            {"2025-07-06": 1, "2025-07-05": 2},
        ),
        (
            [datetime(2025, 7, 6), datetime(2025, 7, 5), datetime(2025, 7, 1)],
            {"2025-07-06": 1, "2025-07-05": 1, "2025-07-01": 1},
        ),
        (
            [datetime(2025, 7, 6), datetime(2025, 7, 6), datetime(2025, 7, 6)],
            {"2025-07-06": 3},
        ),
    ],
)
def test_calculate_daily_reviews(review_dates, expected_daily_reviews):
    assert calculate_daily_reviews(review_dates) == expected_daily_reviews


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


@pytest.mark.parametrize(
    "reviews, expected_retention_rate",
    [
        (
            [
                create_review(feedback=ReviewFeedback.OK, interval=10),
                create_review(feedback=ReviewFeedback.OK, interval=25),
                create_review(feedback=ReviewFeedback.FORGOT, interval=50),
            ],
            0.5,
        ),
        (
            [],
            0.0,
        ),
        (
            [create_review(feedback=ReviewFeedback.OK, interval=10)],
            0.0,
        ),
    ],
)
def test_calculate_retention_rate(reviews, expected_retention_rate):
    assert calculate_retention_rate(reviews) == expected_retention_rate


@pytest.mark.parametrize(
    "reviews, expected_success_rate",
    [
        (
            [
                create_review(feedback=ReviewFeedback.OK, interval=10),
                create_review(feedback=ReviewFeedback.OK, interval=25),
                create_review(feedback=ReviewFeedback.FORGOT, interval=50),
                create_review(feedback=ReviewFeedback.FORGOT, interval=50),
            ],
            0.5,
        ),
        (
            [
                create_review(feedback=ReviewFeedback.SKIPPED, interval=10),
                create_review(feedback=ReviewFeedback.OK, interval=10),
            ],
            1.0,
        ),
        (
            [
                create_review(feedback=ReviewFeedback.SKIPPED, interval=10),
            ],
            0.0,
        ),
        (
            [],
            0.0,
        ),
    ],
)
def test_calculate_success_rate(reviews, expected_success_rate):
    assert calculate_success_rate(reviews) == expected_success_rate


@pytest.mark.parametrize(
    "reviews, expected_difficulty_ranking",
    [
        (
            [],
            DifficultyRankings.NEW,
        ),
        (
            [
                create_review(feedback=ReviewFeedback.OK, interval=10),
                create_review(feedback=ReviewFeedback.OK, interval=25),
                create_review(feedback=ReviewFeedback.FORGOT, interval=50),
                create_review(feedback=ReviewFeedback.FORGOT, interval=50),
            ],
            DifficultyRankings.NEW,
        ),
        (
            [
                create_review(feedback=ReviewFeedback.OK, interval=10),
                create_review(feedback=ReviewFeedback.OK, interval=25),
                create_review(feedback=ReviewFeedback.OK, interval=50),
                create_review(feedback=ReviewFeedback.OK, interval=50),
                create_review(feedback=ReviewFeedback.OK, interval=50),
            ],
            DifficultyRankings.MASTERED,
        ),
        (
            [
                create_review(feedback=ReviewFeedback.OK, interval=10),
                create_review(feedback=ReviewFeedback.OK, interval=25),
                create_review(feedback=ReviewFeedback.FORGOT, interval=50),
                create_review(feedback=ReviewFeedback.FORGOT, interval=50),
                create_review(feedback=ReviewFeedback.FORGOT, interval=50),
            ],
            DifficultyRankings.CHALLENGING,
        ),
        (
            [
                create_review(feedback=ReviewFeedback.OK, interval=25),
                create_review(feedback=ReviewFeedback.OK, interval=25),
                create_review(feedback=ReviewFeedback.OK, interval=50),
                create_review(feedback=ReviewFeedback.OK, interval=50),
                create_review(feedback=ReviewFeedback.FORGOT, interval=50),
            ],
            DifficultyRankings.LEARNING,
        ),
    ],
)
def test_classify_deck_difficulty(reviews, expected_difficulty_ranking):
    assert classify_deck_difficulty(reviews) == expected_difficulty_ranking
