from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.auth.jwt import get_current_user
from src.db import get_db
from src.db.models import User
from src.schemas.statistics import StatisticsOut
from src.statistics import (
    calculate_daily_reviews,
    calculate_overall_success_rate,
    calculate_retention_rate,
    calculate_streak,
    get_deck_statistics,
)

router = APIRouter(prefix="/stats", tags=["statistics"])


@router.get("", response_model=StatisticsOut)
async def get_user_statistics(
    user: User = Depends(get_current_user), db_session: Session = Depends(get_db)
):
    user_reviews = user.reviews
    user_decks = user.decks

    today = datetime.now(timezone.utc)
    review_dates = [review.reviewed_at for review in user_reviews]

    streak = calculate_streak(today, review_dates)
    daily_reviews = calculate_daily_reviews(review_dates)
    overall_retention_rate = calculate_retention_rate(user_reviews)
    overall_success_rate = calculate_overall_success_rate(user_reviews)

    deck_statistics = []
    for deck in user_decks:
        deck_stats = get_deck_statistics(deck, user_reviews)
        deck_statistics.append(deck_stats)

    deck_statistics.sort(key=lambda ds: ds.last_studied, reverse=True)

    return StatisticsOut(
        total_reviews=len(user_reviews),
        daily_reviews=dict(daily_reviews),
        success_rate="{:.2f}".format(overall_success_rate),
        retention_rate="{:.2f}".format(overall_retention_rate),
        streak=streak,
        deck_statistics=deck_statistics,
    )
