from uuid import UUID

from fastapi import Request
from sqlalchemy.orm import Session, contains_eager

from src.auth.jwt import decode_jwt
from src.db.models import Card, Deck, User


def get_user_deck(deck_id: UUID, user_id: UUID, db_session: Session):
    deck = Deck.filter_by(db_session, id=deck_id, user_id=user_id).first()
    if not deck:
        raise ValueError("Deck not found or access denied")
    return deck


def get_user_card(card_id: UUID, user_id: UUID, db_session: Session):
    card = (
        db_session.query(Card)
        .join(Deck)
        .filter(Card.id == card_id, Deck.user_id == user_id)
        .options(contains_eager(Card.deck))
        .first()
    )
    if not card or card.deck.user_id != user_id:
        raise ValueError("Card not found or access denied")
    return card


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
