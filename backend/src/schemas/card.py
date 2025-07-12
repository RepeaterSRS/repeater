from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class CardCreate(BaseModel):
    deck_id: UUID
    content: str


class CardOut(BaseModel):
    id: UUID
    deck_id: UUID
    deck_name: str
    content: str
    next_review_date: datetime
    overdue: bool
    created_at: datetime
    updated_at: datetime


class CardUpdate(BaseModel):
    content: Optional[str] = None
