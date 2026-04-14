"""SIEM Copilot FastAPI Application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.db.database import init_db
from backend.routers import logs, chat, analysis, reports

app = FastAPI(
    title=settings.APP_TITLE,
    description="AI-powered Conversational SIEM Copilot for cybersecurity analysts",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers (standardized with /api prefix at mounting)
app.include_router(logs.router)
app.include_router(chat.router)
app.include_router(analysis.router)
app.include_router(reports.router)


@app.on_event("startup")
def on_startup():
    print("DEBUG: Application starting up...")
    init_db()
    print("DEBUG: Database initialized.")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "SIEM Copilot API",
        "runtime": "Vercel Python"
    }