from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timezone
import json

from app.database import get_db
from app.models.card import Deck, Card
from app.models.review import CardSrsState
from app.schemas.card import DeckOut, CardOut, DeckCreate, CardCreate

router = APIRouter()


@router.get("/decks", response_model=List[DeckOut])
def list_decks(language: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Deck)
    if language:
        query = query.filter(Deck.language == language)
    decks = query.all()
    result = []
    for deck in decks:
        due = (
            db.query(func.count(CardSrsState.id))
            .join(Card, Card.id == CardSrsState.card_id)
            .filter(Card.deck_id == deck.id)
            .filter(CardSrsState.next_review <= datetime.now(timezone.utc))
            .scalar()
        )
        d = DeckOut(
            id=deck.id,
            name=deck.name,
            language=deck.language,
            description=deck.description,
            is_builtin=deck.is_builtin,
            card_count=len(deck.cards),
            due_count=due or 0,
        )
        result.append(d)
    return result


@router.get("/due")
def get_due_cards(language: str, limit: int = 20, db: Session = Depends(get_db)):
    """Return cards due for review today, optionally filtered by language."""
    now = datetime.now(timezone.utc)
    rows = (
        db.query(Card, CardSrsState)
        .join(CardSrsState, CardSrsState.card_id == Card.id)
        .join(Deck, Deck.id == Card.deck_id)
        .filter(Deck.language == language)
        .filter(CardSrsState.next_review <= now)
        .limit(limit)
        .all()
    )
    result = []
    for card, srs in rows:
        result.append({
            "id": card.id,
            "deck_id": card.deck_id,
            "front": card.front,
            "back": card.back,
            "pronunciation": card.pronunciation,
            "example_pt": card.example_pt,
            "example_target": card.example_target,
            "grammar_note": card.grammar_note,
            "tags": json.loads(card.tags or "[]"),
            "srs_state": srs.state,
            "reps": srs.reps,
        })
    return result


@router.get("/{card_id}")
def get_card(card_id: int, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    srs = db.query(CardSrsState).filter(CardSrsState.card_id == card_id).first()
    return {
        "id": card.id,
        "deck_id": card.deck_id,
        "front": card.front,
        "back": card.back,
        "pronunciation": card.pronunciation,
        "example_pt": card.example_pt,
        "example_target": card.example_target,
        "grammar_note": card.grammar_note,
        "tags": json.loads(card.tags or "[]"),
        "srs": {
            "state": srs.state if srs else "new",
            "reps": srs.reps if srs else 0,
            "stability": srs.stability if srs else 0,
        },
    }


@router.post("/")
def create_card(data: CardCreate, db: Session = Depends(get_db)):
    card = Card(
        deck_id=data.deck_id,
        front=data.front,
        back=data.back,
        pronunciation=data.pronunciation,
        example_pt=data.example_pt,
        example_target=data.example_target,
        grammar_note=data.grammar_note,
        tags=json.dumps(data.tags or []),
    )
    db.add(card)
    db.flush()
    srs = CardSrsState(card_id=card.id, state="new", next_review=datetime.now(timezone.utc))
    db.add(srs)
    db.commit()
    return {"id": card.id}
