from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone, date

from app.database import get_db
from app.models.card import Card
from app.models.review import CardSrsState, Review, DailyProgress
from app.schemas.review import ReviewSubmit, ReviewResult
from app.services.fsrs import schedule, FSRSState

router = APIRouter()


@router.post("/submit", response_model=ReviewResult)
def submit_review(data: ReviewSubmit, db: Session = Depends(get_db)):
    if data.rating not in (1, 2, 3, 4):
        raise HTTPException(status_code=422, detail="Rating must be 1-4")

    card = db.query(Card).filter(Card.id == data.card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    srs = db.query(CardSrsState).filter(CardSrsState.card_id == data.card_id).first()
    if not srs:
        srs = CardSrsState(card_id=data.card_id, state="new")
        db.add(srs)
        db.flush()

    current = FSRSState(
        stability=srs.stability or 0.0,
        difficulty=srs.difficulty or 5.0,
        elapsed_days=srs.elapsed_days or 0,
        scheduled_days=srs.scheduled_days or 0,
        reps=srs.reps or 0,
        lapses=srs.lapses or 0,
        state=srs.state or "new",
    )

    now = datetime.now(timezone.utc)
    result = schedule(current, data.rating, srs.last_review, now)  # type: ignore[arg-type]

    # Persist new SRS state
    ns = result.next_state
    srs.stability = ns.stability
    srs.difficulty = ns.difficulty
    srs.elapsed_days = ns.elapsed_days
    srs.scheduled_days = ns.scheduled_days
    srs.reps = ns.reps
    srs.lapses = ns.lapses
    srs.state = ns.state
    srs.last_review = now
    srs.next_review = result.next_review

    # Log review
    rev = Review(
        card_id=data.card_id,
        rating=data.rating,
        review_time_ms=data.review_time_ms,
        reviewed_at=now,
        scheduled_days=result.scheduled_days,
        stability=ns.stability,
        difficulty=ns.difficulty,
    )
    db.add(rev)

    # Update daily progress
    today = date.today().isoformat()
    deck = card.deck
    lang = deck.language if deck else "unknown"
    progress = (
        db.query(DailyProgress)
        .filter(DailyProgress.date == today, DailyProgress.language == lang)
        .first()
    )
    if progress:
        progress.cards_reviewed += 1
        if data.rating >= 3:
            progress.correct += 1
    else:
        db.add(DailyProgress(
            date=today,
            language=lang,
            cards_reviewed=1,
            correct=1 if data.rating >= 3 else 0,
        ))

    db.commit()

    return ReviewResult(
        card_id=data.card_id,
        next_review=result.next_review.isoformat(),
        scheduled_days=result.scheduled_days,
        new_state=ns.state,
    )
