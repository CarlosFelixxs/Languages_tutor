from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json

from app.database import get_db
from app.models.conversation import ConversationSession, ConversationMessage
from app.schemas.conversation import SessionCreate, SessionOut, MessageSend, ExplainRequest
from app.services import claude

router = APIRouter()


@router.post("/sessions", response_model=SessionOut)
def create_session(data: SessionCreate, db: Session = Depends(get_db)):
    session = ConversationSession(
        language=data.language,
        topic=data.topic,
        started_at=datetime.now(timezone.utc),
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return SessionOut(
        id=session.id,
        language=session.language,
        topic=session.topic,
        started_at=session.started_at.isoformat(),
    )


@router.get("/sessions/{session_id}/messages")
def get_messages(session_id: int, db: Session = Depends(get_db)):
    session = db.query(ConversationSession).filter(ConversationSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    msgs = (
        db.query(ConversationMessage)
        .filter(ConversationMessage.session_id == session_id)
        .order_by(ConversationMessage.created_at)
        .all()
    )
    return [
        {"id": m.id, "role": m.role, "content": m.content, "created_at": m.created_at.isoformat()}
        for m in msgs
    ]


@router.post("/message/stream")
def stream_message(data: MessageSend, db: Session = Depends(get_db)):
    """Send a user message and stream the AI response via SSE."""
    session = db.query(ConversationSession).filter(ConversationSession.id == data.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Save user message
    user_msg = ConversationMessage(
        session_id=data.session_id,
        role="user",
        content=data.content,
        created_at=datetime.now(timezone.utc),
    )
    db.add(user_msg)
    db.commit()

    # Build message history for Claude
    history_rows = (
        db.query(ConversationMessage)
        .filter(ConversationMessage.session_id == data.session_id)
        .order_by(ConversationMessage.created_at)
        .all()
    )
    messages = [{"role": m.role, "content": m.content} for m in history_rows]

    collected = []

    def event_generator():
        for token in claude.stream_chat(data.language, messages, data.topic):
            collected.append(token)
            yield f"data: {json.dumps({'token': token})}\n\n"
        # Save full AI response
        full = "".join(collected)
        ai_msg = ConversationMessage(
            session_id=data.session_id,
            role="assistant",
            content=full,
            created_at=datetime.now(timezone.utc),
        )
        db_local = next(get_db())
        db_local.add(ai_msg)
        db_local.commit()
        db_local.close()
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/explain")
def explain_word(data: ExplainRequest):
    """Get an AI explanation of a word or phrase for the language pair."""
    text = claude.explain(data.language, data.word_or_phrase, data.context)
    return {"explanation": text}
