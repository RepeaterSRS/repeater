from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.auth.jwt import get_current_user
from src.db import get_db
from src.db.models import Deck, User
from src.schemas.deck import DeckCreate, DeckOut, DeckUpdate

router = APIRouter(prefix="/decks", tags=["decks"])


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
    deck = Deck.get(db_session, deck_id)
    if not deck:
        raise HTTPException(status_code=404)

    if deck.user_id != user.id:
        raise HTTPException(status_code=403)

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
    deck = Deck.get(db_session, deck_id)

    if not deck:
        raise HTTPException(status_code=404)

    deck.delete(db_session)
    return {"id": deck.id}
