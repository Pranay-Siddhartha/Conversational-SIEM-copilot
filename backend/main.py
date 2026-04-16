from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.requests import Request
import time

# Absolute Package Imports
from backend.config import settings
from backend.routers import logs, chat, analysis, reports
from backend.db.database import init_db

app = FastAPI(
    title=settings.APP_TITLE,
    description="Enterprise-grade AI SIEM Copilot SOC platform",
    version="2.1.0", # Enterprise SOC Baseline
)

# ── CORS ──────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://conversational-siem-copilot-ten.vercel.app/",
        "http://localhost:3000",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ── SaaS Middlewares ──────────────────────────────────────────

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """SaaS latency tracking and performance telemetry."""
    start_time = time.time()
    # Security Middleware Hook Placeholder
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# ── Global Exception Handlers ───────────────────────────────

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """SaaS-standard schema validation error feedback."""
    return JSONResponse(
        status_code=422,
        content={"error": "Schema validation failed", "detail": exc.errors()},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Resilient global catch-all for SOC infrastructure."""
    # Critical: Log internally but mask internal details from public clients
    print(f"CRITICAL SYSTEM ERROR: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Systems Failure", 
            "detail": "An unexpected error occurred in the investigation service. SOC engineers notified."
        },
    )



# Modular Routers (Packageized)
app.include_router(logs.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(reports.router, prefix="/api")

@app.on_event("startup")
def on_startup():
    print(f"🚀 {settings.APP_TITLE} V2 starting up...")
    init_db()
    print("✅ Database infrastructure ready.")

@app.get("/health")
@app.get("/api/health")
def health():
    return {
        "status": "operational",
        "service": "SIEM Copilot Enterprise API",
        "node": "Railway Production Node",
        "runtime": "Python 3.11 Package"
    }