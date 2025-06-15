from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.auth.jwt import get_current_user
from src.db import get_db
from src.db.models import User

router = APIRouter(prefix="/decks", tags=["decks"])


@router.get("")
def get_decks(
    user: User = Depends(get_current_user), session: Session = Depends(get_db)
):
    return []
