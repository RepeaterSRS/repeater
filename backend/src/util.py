from datetime import datetime, timedelta
from uuid import UUID

from sqlalchemy.orm import Session

from src.db.models import Card, Deck


def get_user_deck(deck_id: UUID, user_id: UUID, db_session: Session):
    deck = Deck.filter_by(db_session, id=deck_id, user_id=user_id).first()
    if not deck:
        raise ValueError("Deck not found or access denied")
    return deck


def get_user_card(card_id: UUID, user_id: UUID, db_session: Session):
    card = Card.get(db_session, id=card_id)
    if not card or card.deck.user_id != user_id:
        raise ValueError("Card not found or access denied")
    return card


def calculate_streak(start: datetime, dates: list[datetime]) -> int:
    seen = set(d.date() for d in dates)
    streak = 0
    current = start.date()

    # The start day may or may not be in dates, but don't penalize the streak if it isn't
    if current not in seen:
        current -= timedelta(days=1)
    else:
        streak += 1
        current -= timedelta(days=1)

    while current in seen:
        streak += 1
        current -= timedelta(days=1)

    return streak
