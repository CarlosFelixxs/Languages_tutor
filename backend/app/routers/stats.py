from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from typing import Optional

from app.database import get_db
from app.models.card import Card, Deck
from app.models.review import CardSrsState, DailyProgress
from datetime import datetime, timezone

router = APIRouter()


@router.get("/overview")
def get_overview(language: Optional[str] = None, db: Session = Depends(get_db)):
    today = date.today()
    now = datetime.now(timezone.utc)

    # Total cards
    q_cards = db.query(func.count(Card.id)).join(Deck, Deck.id == Card.deck_id)
    if language:
        q_cards = q_cards.filter(Deck.language == language)
    total_cards = q_cards.scalar() or 0

    # Cards due now
    q_due = (
        db.query(func.count(CardSrsState.id))
        .join(Card, Card.id == CardSrsState.card_id)
        .join(Deck, Deck.id == Card.deck_id)
        .filter(CardSrsState.next_review <= now)
    )
    if language:
        q_due = q_due.filter(Deck.language == language)
    due_today = q_due.scalar() or 0

    # Reviewed today
    q_progress = db.query(func.sum(DailyProgress.cards_reviewed)).filter(
        DailyProgress.date == today.isoformat()
    )
    if language:
        q_progress = q_progress.filter(DailyProgress.language == language)
    reviewed_today = q_progress.scalar() or 0

    # Streak calculation
    streak = _calc_streak(db)

    return {
        "streak": streak,
        "total_cards": total_cards,
        "due_today": due_today,
        "reviewed_today": reviewed_today,
    }


@router.get("/heatmap")
def get_heatmap(db: Session = Depends(get_db)):
    """Return daily review counts for the last 365 days."""
    cutoff = (date.today() - timedelta(days=365)).isoformat()
    rows = (
        db.query(DailyProgress.date, func.sum(DailyProgress.cards_reviewed).label("count"))
        .filter(DailyProgress.date >= cutoff)
        .group_by(DailyProgress.date)
        .all()
    )
    return {r.date: r.count for r in rows}


def _calc_streak(db: Session) -> int:
    today = date.today()
    streak = 0
    for i in range(365):
        check_date = (today - timedelta(days=i)).isoformat()
        total = (
            db.query(func.sum(DailyProgress.cards_reviewed))
            .filter(DailyProgress.date == check_date)
            .scalar()
        ) or 0
        if total > 0:
            streak += 1
        elif i > 0:
            break
    return streak
