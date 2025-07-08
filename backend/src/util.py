from datetime import datetime, timedelta
from uuid import UUID

from fastapi import Request
from sqlalchemy.orm import Session

from src.auth.jwt import decode_jwt
from src.db.models import Card, Deck, User


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


def get_user_from_token(request: Request, db_session: Session) -> User | None:
    token = request.cookies.get("access_token")
    if not token:
        return None
    try:
        payload = decode_jwt(token)
        user_id = payload.get("sub")
        if not user_id:
            return None
        user = User.get(db_session, user_id)
        return user
    except Exception:
        return None
