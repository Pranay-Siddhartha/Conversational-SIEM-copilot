"""Conversational AI chat endpoint."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import LogEvent
from app.schemas import ChatRequest, ChatResponse
from app.services.ai_service import chat_with_logs

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    """Chat with your security logs using natural language."""
    # Fetch recent events as context
    events = (
        db.query(LogEvent)
        .order_by(LogEvent.timestamp.desc().nullslast())
        .limit(req.context_limit)
        .all()
    )

    if not events:
        return ChatResponse(
            reply="No log data found. Please upload security logs first using the upload feature.",
            sources_used=0,
        )

    # Build text context from events
    context_lines = []
    for e in events:
        ts = e.timestamp.strftime("%Y-%m-%d %H:%M:%S") if e.timestamp else "unknown"
        line = (
            f"[{ts}] src={e.source_ip or '-'} user={e.username or '-'} "
            f"action={e.action or '-'} status={e.status or '-'} "
            f"severity={e.severity or '-'}"
        )
        if e.raw_line and len(e.raw_line) < 200:
            line += f" raw=\"{e.raw_line}\""
        context_lines.append(line)

    log_context = "\n".join(context_lines)

    try:
        reply = chat_with_logs(req.message, log_context, count=len(events))
    except Exception as e:
        reply = f"⚠️ AI service error: {str(e)}"

    return ChatResponse(reply=reply, sources_used=len(events))
