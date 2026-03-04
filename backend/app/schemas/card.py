from pydantic import BaseModel
from typing import Optional


class DeckBase(BaseModel):
    name: str
    language: str
    description: Optional[str] = None


class DeckCreate(DeckBase):
    pass


class DeckOut(DeckBase):
    id: int
    is_builtin: int
    card_count: int = 0
    due_count: int = 0

    model_config = {"from_attributes": True}


class CardBase(BaseModel):
    front: str
    back: str
    pronunciation: Optional[str] = None
    example_pt: Optional[str] = None
    example_target: Optional[str] = None
    grammar_note: Optional[str] = None
    tags: Optional[str] = "[]"


class CardCreate(CardBase):
    deck_id: int


class CardOut(CardBase):
    id: int
    deck_id: int

    model_config = {"from_attributes": True}


class CardWithSrs(CardOut):
    srs_state: Optional[str] = None   # JSON string of state
