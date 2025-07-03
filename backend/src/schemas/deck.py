from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class DeckCreate(BaseModel):
    name: str
    description: Optional[str] = None


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
