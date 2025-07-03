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
