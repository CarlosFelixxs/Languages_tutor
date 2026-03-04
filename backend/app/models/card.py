from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from app.database import Base


class Deck(Base):
    __tablename__ = "decks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    language = Column(Text, nullable=False)  # 'spanish' | 'russian'
    description = Column(Text)
    is_builtin = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    cards = relationship("Card", back_populates="deck", cascade="all, delete-orphan")


class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    deck_id = Column(Integer, ForeignKey("decks.id"), nullable=False)
    front = Column(Text, nullable=False)       # Portuguese word/phrase
    back = Column(Text, nullable=False)        # Target language word/phrase
    pronunciation = Column(Text)               # Phonetic guide
    example_pt = Column(Text)                  # Example in Portuguese
    example_target = Column(Text)              # Example in target language
    grammar_note = Column(Text)                # Tips, false cognate warnings
    tags = Column(Text, default="[]")          # JSON array string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    deck = relationship("Deck", back_populates="cards")
    srs_state = relationship("CardSrsState", back_populates="card", uselist=False,
                             cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="card", cascade="all, delete-orphan")
