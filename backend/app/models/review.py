from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
import datetime
from app.database import Base


class CardSrsState(Base):
    __tablename__ = "card_srs_state"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"), unique=True, nullable=False)
    stability = Column(Float, default=0.0)
    difficulty = Column(Float, default=0.0)
    elapsed_days = Column(Integer, default=0)
    scheduled_days = Column(Integer, default=0)
    reps = Column(Integer, default=0)
    lapses = Column(Integer, default=0)
    state = Column(Text, default="new")   # new | learning | review | relearning
    last_review = Column(DateTime, nullable=True)
    next_review = Column(DateTime, nullable=True)

    card = relationship("Card", back_populates="srs_state")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False)
    rating = Column(Integer, nullable=False)   # 1=Again 2=Hard 3=Good 4=Easy
    review_time_ms = Column(Integer)
    reviewed_at = Column(DateTime, default=datetime.datetime.utcnow)
    scheduled_days = Column(Integer)
    stability = Column(Float)
    difficulty = Column(Float)

    card = relationship("Card", back_populates="reviews")


class DailyProgress(Base):
    __tablename__ = "daily_progress"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Text, nullable=False)       # YYYY-MM-DD
    language = Column(Text, nullable=False)
    cards_reviewed = Column(Integer, default=0)
    correct = Column(Integer, default=0)
