from io import BytesIO
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from src.auth.jwt import get_current_user
from src.db import get_db
from src.db.models import Deck, User
from src.import_export import (
    BaseImporter,
    deck_to_deck_data,
    export,
    store_imported_deck,
)
from src.import_export.custom import CustomImporter
from src.schemas.deck import DeckCreate, DeckOut, DeckUpdate
from src.util import get_user_category, get_user_deck

router = APIRouter(prefix="/decks", tags=["decks"])


@router.post("", response_model=DeckOut, status_code=201)
def create_deck(
    deck_req: DeckCreate,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    if deck_req.category_id:
        try:
            get_user_category(deck_req.category_id, user.id, db_session)
        except ValueError as err:
            raise HTTPException(status_code=404, detail=str(err))

    deck = Deck(
        user_id=user.id,
        category_id=deck_req.category_id,
        name=deck_req.name,
        description=deck_req.description,
    )
    deck.save(db_session)
    return deck


@router.get("", response_model=List[DeckOut])
def get_decks(
    category_id: UUID = None,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    query = db_session.query(Deck).filter(Deck.user_id == user.id).order_by(Deck.name)

    if category_id:
        query = query.filter(Deck.category_id == category_id)

    return query.all()


@router.patch("/{deck_id}", response_model=DeckOut)
def update_deck(
    deck_id: UUID,
    deck_req: DeckUpdate,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    try:
        deck = get_user_deck(deck_id, user.id, db_session)
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))

    if deck_req.category_id:
        try:
            get_user_category(deck_req.category_id, user.id, db_session)
        except ValueError as err:
            raise HTTPException(status_code=404, detail=str(err))

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
    try:
        deck = get_user_deck(deck_id, user.id, db_session)
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))

    deck.delete(db_session)
    return {"id": deck.id}


@router.post("/import", status_code=201)
async def import_deck(
    format: str = "repeater",
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    if user.is_guest:
        raise HTTPException(status_code=403)

    if format == "repeater":
        importer: BaseImporter = CustomImporter()
        try:
            content = await file.read()
            deck_data = importer.parse(content)
        except Exception as err:
            raise HTTPException(status_code=400, detail=err)
        store_imported_deck(deck_data, user.id, db_session)
    else:
        raise HTTPException(status_code=400, detail="Unknown format")


@router.get("/{deck_id}/export")
def export_deck(
    deck_id: UUID,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    if user.is_guest:
        raise HTTPException(status_code=403)

    try:
        deck = get_user_deck(deck_id, user.id, db_session)
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))

    deck_data = deck_to_deck_data(deck)
    deck_bytes = export(deck_data)
    return StreamingResponse(
        BytesIO(deck_bytes),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="deck_{deck.name}.json"'
        },
    )
