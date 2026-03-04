"""Populate the database with built-in decks and cards."""
import json
import os
from datetime import datetime, timezone
from sqlalchemy.orm import Session


def _load_json(filename: str) -> dict:
    path = os.path.join(os.path.dirname(__file__), filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def seed_decks(db: Session) -> None:
    from app.models.card import Deck, Card
    from app.models.review import CardSrsState

    for filename in ("spanish_deck.json", "russian_deck.json"):
        data = _load_json(filename)
        deck_data = data["deck"]

        # Check if deck already exists
        existing = db.query(Deck).filter_by(
            name=deck_data["name"], language=deck_data["language"]
        ).first()
        if existing:
            continue

        deck = Deck(
            name=deck_data["name"],
            language=deck_data["language"],
            description=deck_data.get("description"),
            is_builtin=deck_data.get("is_builtin", 1),
        )
        db.add(deck)
        db.flush()  # Get deck.id

        for card_data in data["cards"]:
            card = Card(
                deck_id=deck.id,
                front=card_data["front"],
                back=card_data["back"],
                pronunciation=card_data.get("pronunciation"),
                example_pt=card_data.get("example_pt"),
                example_target=card_data.get("example_target"),
                grammar_note=card_data.get("grammar_note"),
                tags=json.dumps(card_data.get("tags", [])),
            )
            db.add(card)
            db.flush()

            # Initialize SRS state for new card (due immediately)
            srs = CardSrsState(
                card_id=card.id,
                state="new",
                next_review=datetime.now(timezone.utc),
            )
            db.add(srs)

    db.commit()
