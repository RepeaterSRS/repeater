from typing import Dict

from pydantic import BaseModel


class StatisticsOut(BaseModel):
    total_reviews: int
    daily_reviews: Dict[str, int]
    streak: int
    success_rate: float
