from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from src.db.models import ReviewFeedback


class ReviewCreate(BaseModel):
    card_id: UUID
    feedback: ReviewFeedback


class ReviewOut(BaseModel):
    id: UUID
    card_id: UUID
    deck_id: UUID
    user_id: UUID
    reviewed_at: datetime
    card_content: str
    deck_name: str
    feedback: ReviewFeedback
    interval: int
    repetitions: int
    ease_factor: float
    created_at: datetime
