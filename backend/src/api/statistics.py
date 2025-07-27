from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.auth.jwt import get_current_user
from src.db import get_db
from src.db.models import User
from src.schemas.statistics import DeckStatistics, StatisticsOut
from src.statistics import (
    calculate_daily_reviews,
    calculate_retention_rate,
    calculate_streak,
    calculate_success_rate,
    get_deck_statistics,
)
from src.util import get_user_deck

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
    overall_success_rate = calculate_success_rate(user_reviews)

    deck_statistics = []
    for deck in user_decks:
        deck_stats = get_deck_statistics(deck, user_reviews)
        deck_statistics.append(deck_stats)

    deck_statistics.sort(
        key=lambda ds: (ds.last_studied is None, ds.last_studied), reverse=True
    )

    return StatisticsOut(
        total_reviews=len(user_reviews),
        daily_reviews=dict(daily_reviews),
        success_rate="{:.2f}".format(overall_success_rate),
        retention_rate="{:.2f}".format(overall_retention_rate),
        streak=streak,
        deck_statistics=deck_statistics,
    )


@router.get("/{deck_id}", response_model=DeckStatistics)
async def get_user_deck_statistics(
    deck_id: UUID,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    try:
        deck = get_user_deck(deck_id, user.id, db_session)
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))

    user_reviews = user.reviews
    return get_deck_statistics(deck, user_reviews)
