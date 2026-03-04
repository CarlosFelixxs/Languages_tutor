from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SessionCreate(BaseModel):
    language: str
    topic: Optional[str] = None


class SessionOut(BaseModel):
    id: int
    language: str
    topic: Optional[str]
    started_at: str

    model_config = {"from_attributes": True}


class MessageSend(BaseModel):
    session_id: int
    content: str
    language: str
    topic: Optional[str] = None


class MessageOut(BaseModel):
    id: int
    session_id: int
    role: str
    content: str
    created_at: str

    model_config = {"from_attributes": True}


class ExplainRequest(BaseModel):
    language: str
    word_or_phrase: str
    context: Optional[str] = None
