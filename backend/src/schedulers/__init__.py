from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime

from src.db.models import ReviewFeedback


@dataclass
class ScheduleResult:
    interval: int
    ease_factor: float
    repetitions: int
    next_review_date: datetime


class Scheduler(ABC):
    @abstractmethod
    def schedule(
        self,
        feedback: ReviewFeedback,
        repetitions: int,
        ease_factor: float,
        interval: int,
    ) -> ScheduleResult:
        pass
