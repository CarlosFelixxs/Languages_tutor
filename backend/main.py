import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import create_tables
from app.routers import cards, reviews, conversation, lessons, stats

app = FastAPI(title="Language Tutor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    create_tables()
    # Seed built-in decks
    from app.database import SessionLocal
    from app.data.seed import seed_decks
    db = SessionLocal()
    try:
        seed_decks(db)
    finally:
        db.close()


app.include_router(cards.router, prefix="/api/cards", tags=["cards"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(conversation.router, prefix="/api/conversation", tags=["conversation"])
app.include_router(lessons.router, prefix="/api/lessons", tags=["lessons"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
