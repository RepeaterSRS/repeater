from collections import defaultdict
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.auth.jwt import get_current_user
from src.db import get_db
from src.db.models import User
from src.schemas.statistics import StatisticsOut
from src.util import calculate_streak

router = APIRouter(prefix="/stats", tags=["statistics"])


@router.get("", response_model=StatisticsOut)
async def get_user_statistics(
    user: User = Depends(get_current_user), db_session: Session = Depends(get_db)
):
    user_reviews = user.reviews
    today = datetime.now(timezone.utc)

    review_dates = [review.reviewed_at for review in user_reviews]
    streak = calculate_streak(today, review_dates)

    nr_fail = 0
    nr_success = 0
    daily_reviews = defaultdict(int)
    for review in user_reviews:
        date_str = review.reviewed_at.date().isoformat()
        daily_reviews[date_str] += 1

        if review.review_succeeded():
            nr_success += 1
        elif review.review_failed():
            nr_fail += 1

    return {
        "total_reviews": len(user_reviews),
        "daily_reviews": dict(daily_reviews),
        "streak": streak,
        "success_rate": 0
        if nr_success == 0
        else "{:.2f}".format(nr_success / (nr_success + nr_fail)),
    }
