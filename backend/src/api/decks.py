from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.auth.jwt import get_current_user
from src.db import get_db
from src.db.models import Deck, User
from src.schemas.deck import DeckCreate, DeckOut

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
