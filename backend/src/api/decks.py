from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.auth.jwt import get_current_user
from src.db import get_db
from src.db.models import Card, Deck, User
from src.schemas.card import CardCreate, CardOut, CardUpdate
from src.schemas.deck import DeckCreate, DeckOut, DeckUpdate

router = APIRouter(prefix="/decks", tags=["decks"])


def get_user_deck(deck_id, user_id, db_session):
    deck = Deck.filter_by(db_session, id=deck_id, user_id=user_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found or access denied")
    return deck


def get_user_card(card_id, deck_id, user_id, db_session):
    deck = get_user_deck(deck_id, user_id, db_session)
    card = db_session.query(Card).filter_by(id=card_id, deck_id=deck.id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found or access denied")
    return card


@router.post("", response_model=DeckOut, status_code=201)
def create_deck(
    deck_req: DeckCreate,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    deck = Deck(user_id=user.id, name=deck_req.name, description=deck_req.description)
    deck.save(db_session)
    return deck


@router.get("", response_model=List[DeckOut])
def get_decks(
    user: User = Depends(get_current_user), db_session: Session = Depends(get_db)
):
    return user.decks


@router.patch("/{deck_id}", response_model=DeckOut)
def update_deck(
    deck_id: UUID,
    deck_req: DeckUpdate,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    deck = get_user_deck(deck_id, user.id, db_session)
    updates = deck_req.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(deck, field, value)
    deck.save(db_session)
    return deck


@router.delete("/{deck_id}")
def delete_deck(
    deck_id: UUID,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    deck = get_user_deck(deck_id, user.id, db_session)
    deck.delete(db_session)
    return {"id": deck.id}


@router.post("/{deck_id}/cards", response_model=CardOut, status_code=201)
def create_card(
    deck_id: UUID,
    card_req: CardCreate,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    deck = get_user_deck(deck_id, user.id, db_session)
    card = Card(deck_id=deck.id, content=card_req.content)
    card.save(db_session)
    return card


@router.get("/{deck_id}/cards", response_model=List[CardOut])
def get_cards(
    deck_id: UUID,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    deck = get_user_deck(deck_id, user.id, db_session)
    return deck.cards


@router.patch("/{deck_id}/cards/{card_id}", response_model=CardOut)
def update_card(
    deck_id: UUID,
    card_id: UUID,
    card_req: CardUpdate,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    card = get_user_card(card_id, deck_id, user.id, db_session)
    updates = card_req.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(card, field, value)
    card.save(db_session)
    return card


@router.delete("/{deck_id}/cards/{card_id}")
def delete_card(
    deck_id: UUID,
    card_id: UUID,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    card = get_user_card(card_id, deck_id, user.id, db_session)
    card.delete(db_session)
    return {"id": card.id}
