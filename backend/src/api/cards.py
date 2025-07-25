from datetime import datetime, timezone
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, contains_eager

from src.auth.jwt import get_current_user
from src.db import get_db
from src.db.models import Card, Deck, User
from src.schemas.card import CardCreate, CardOut, CardUpdate
from src.util import get_user_card, get_user_deck

router = APIRouter(prefix="/cards", tags=["cards"])


@router.post("", response_model=CardOut, status_code=201)
def create_card(
    card_req: CardCreate,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    try:
        deck = get_user_deck(card_req.deck_id, user.id, db_session)
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))

    card = Card(deck_id=deck.id, content=card_req.content)
    card.deck = deck
    card.save(db_session)
    return CardOut.from_card(card)


@router.get("", response_model=List[CardOut])
def get_cards(
    deck_id: UUID = None,
    only_due: bool = False,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    query = (
        db_session.query(Card)
        .join(Deck)
        .filter(Deck.user_id == user.id)
        .options(contains_eager(Card.deck))
    )

    if deck_id:
        query = query.filter(Card.deck_id == deck_id)

    if only_due:
        query = query.filter(
            Card.next_review_date <= datetime.now(timezone.utc)
        ).order_by(Card.next_review_date)
    else:
        query = query.order_by(Card.created_at.desc())

    cards = query.all()
    return [CardOut.from_card(card) for card in cards]


@router.patch("/{card_id}", response_model=CardOut)
def update_card(
    card_id: UUID,
    card_req: CardUpdate,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    try:
        card = get_user_card(card_id, user.id, db_session)
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))

    updates = card_req.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(card, field, value)
    card.save(db_session)
    return CardOut.from_card(card)


@router.delete("/{card_id}")
def delete_card(
    card_id: UUID,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    try:
        card = get_user_card(card_id, user.id, db_session)
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))

    card.delete(db_session)
    return {"id": card.id}
