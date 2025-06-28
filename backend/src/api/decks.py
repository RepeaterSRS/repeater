from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.auth.jwt import get_current_user
from src.db import get_db
from src.db.models import Deck, User

router = APIRouter(prefix="/decks", tags=["decks"])


@router.post("")
def create_deck(
    user: User = Depends(get_current_user), session: Session = Depends(get_db)
):
    return []
