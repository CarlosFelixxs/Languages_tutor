from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReviewSubmit(BaseModel):
    card_id: int
    rating: int   # 1-4
    review_time_ms: Optional[int] = None


class ReviewResult(BaseModel):
    card_id: int
    next_review: str
    scheduled_days: int
    new_state: str


class StatsOut(BaseModel):
    streak: int
    total_reviewed_today: int
    total_cards: int
    due_today: int
    languages: dict
