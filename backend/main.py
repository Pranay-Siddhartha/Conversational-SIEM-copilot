from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.requests import Request
import time

from app.core.config import settings
from app.routes import logs, chat, analysis, reports
from app.db.database import init_db

app = FastAPI(
    title=settings.APP_TITLE,
    description="Enterprise-grade AI SIEM Copilot SOC platform",
    version="2.0.0",
)

# ── SaaS Middlewares ──────────────────────────────────────────

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """SaaS latency tracking and rate-limit placeholder."""
    start_time = time.time()
    # Placeholder for Rate Limiting / API Key validation
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# ── Global Exception Handlers ───────────────────────────────

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Standardized Pydantic validation error response."""
    return JSONResponse(
        status_code=422,
        content={"error": "Schema validation failed", "detail": exc.errors()},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global catch-all for SaaS resilience."""
    # In production, we log the trace internally but return a clean message
    print(f"CRITICAL ERROR: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Systems Failure", "detail": "An unexpected error occurred in the investigation service."},
    )

# ── CORS ──────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(logs.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(reports.router, prefix="/api")

@app.on_event("startup")
def on_startup():
    print(f"🚀 {settings.APP_TITLE} V2 starting up...")
    init_db()
    print("✅ Database connection pool established.")

@app.get("/health")
@app.get("/api/health")
def health():
    return {
        "status": "operational",
        "service": "SIEM Copilot Enterprise API",
        "uptime_milestone": "99.9% ready",
        "runtime": "Railway / Python 3.11"
    }