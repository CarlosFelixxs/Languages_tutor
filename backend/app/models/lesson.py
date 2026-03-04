from sqlalchemy import Column, Integer, Text, DateTime
import datetime
from app.database import Base


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    language = Column(Text, nullable=False)    # 'spanish' | 'russian'
    title = Column(Text, nullable=False)
    slug = Column(Text, nullable=False, unique=True)
    order_idx = Column(Integer, default=0)
    content = Column(Text, nullable=False)     # JSON string with structured content
    lesson_type = Column(Text, default="vocabulary")  # vocabulary|grammar|alphabet|pronunciation
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
