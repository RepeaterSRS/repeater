from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class CardCreate(BaseModel):
    content: str


class CardOut(BaseModel):
    id: UUID
    deck_id: UUID
    content: str
    next_review_date: datetime
    created_at: datetime
    updated_at: datetime


class CardUpdate(BaseModel):
    content: Optional[str] = None
