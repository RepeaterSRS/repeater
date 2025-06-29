from datetime import datetime
from uuid import UUID
from typing import Optional

from pydantic import BaseModel


class DeckCreate(BaseModel):
    name: str
    description: str


class DeckOut(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: str
    created_at: datetime
    updated_at: datetime


class DeckUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
