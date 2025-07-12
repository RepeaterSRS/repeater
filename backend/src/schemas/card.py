from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from pydantic import BaseModel
from src.db.models import Card


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

    @classmethod
    def from_card(cls, card: Card) -> "CardOut":
        now = datetime.now(timezone.utc)
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        next_review_day = card.next_review_date.replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        return cls(
            id=card.id,
            deck_id=card.deck_id,
            deck_name=card.deck.name,
            content=card.content,
            next_review_date=card.next_review_date,
            overdue=next_review_day < today,
            created_at=card.created_at,
            updated_at=card.updated_at,
        )


class CardUpdate(BaseModel):
    content: Optional[str] = None
