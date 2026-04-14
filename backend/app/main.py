"""SIEM Copilot FastAPI Application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.routers import logs, chat, analysis, reports

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

# Routers
app.include_router(logs.router)
app.include_router(chat.router)
app.include_router(analysis.router)
app.include_router(reports.router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "SIEM Copilot API"}
