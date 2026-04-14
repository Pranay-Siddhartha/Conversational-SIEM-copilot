"""Log upload and query endpoints."""
import json
from collections import Counter, defaultdict
from fastapi import APIRouter, UploadFile, File, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import LogEvent
from app.schemas import LogEventOut, LogUploadResponse, DashboardStats
from app.services.log_parser import parse_log_file

router = APIRouter(prefix="/api/logs", tags=["logs"])


@router.post("/upload", response_model=LogUploadResponse)
async def upload_log(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload and parse a log file (CSV, JSON, auth log, firewall log)."""
    content = (await file.read()).decode("utf-8", errors="ignore")
    events, source_type = parse_log_file(content, file.filename or "unknown")

    db_events = []
    for e in events:
        db_event = LogEvent(
            timestamp=e.get("timestamp"),
            source_ip=e.get("source_ip"),
            dest_ip=e.get("dest_ip"),
            username=e.get("username"),
            action=e.get("action"),
            status=e.get("status"),
            raw_line=e.get("raw_line"),
            severity=e.get("severity", "info"),
            log_source=e.get("log_source", source_type),
            extra_data=e.get("extra_data"),
        )
        db_events.append(db_event)

    db.add_all(db_events)
    db.commit()

    return LogUploadResponse(
        message=f"Successfully parsed and stored {len(db_events)} events",
        events_count=len(db_events),
        log_source=source_type,
    )


@router.get("/events", response_model=list[LogEventOut])
def get_events(
    source_ip: str | None = None,
    username: str | None = None,
    status: str | None = None,
    severity: str | None = None,
    log_source: str | None = None,
    limit: int = Query(default=200, le=1000),
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """Get log events with optional filters."""
    q = db.query(LogEvent)
    if source_ip:
        q = q.filter(LogEvent.source_ip == source_ip)
    if username:
        q = q.filter(LogEvent.username == username)
    if status:
        q = q.filter(LogEvent.status == status)
    if severity:
        q = q.filter(LogEvent.severity == severity)
    if log_source:
        q = q.filter(LogEvent.log_source == log_source)
    q = q.order_by(LogEvent.timestamp.desc().nullslast())
    return q.offset(offset).limit(limit).all()


@router.get("/stats", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics."""
    events = db.query(LogEvent).all()
    total = len(events)

    # Severity distribution
    severity_dist = Counter(e.severity or "info" for e in events)

    # Top source IPs
    ip_counter = Counter(e.source_ip for e in events if e.source_ip)
    top_ips = [
        {"ip": ip, "count": count, "severity": _ip_severity(ip, events)}
        for ip, count in ip_counter.most_common(10)
    ]

    # Failed login trend (group by hour)
    failed_by_hour = defaultdict(int)
    for e in events:
        if e.status == "failure" and e.timestamp:
            hour_key = e.timestamp.strftime("%Y-%m-%d %H:00")
            failed_by_hour[hour_key] += 1
    failed_trend = [
        {"time": k, "count": v}
        for k, v in sorted(failed_by_hour.items())
    ]

    # Suspicious events
    suspicious = sum(
        1 for e in events
        if e.severity in ("high", "critical") or e.status == "failure"
    )

    # Unique IPs and users
    unique_ips = len(set(e.source_ip for e in events if e.source_ip))
    unique_users = len(set(e.username for e in events if e.username))

    # Recent threats
    recent = [
        {
            "timestamp": e.timestamp.isoformat() if e.timestamp else "",
            "event": f"{e.action} by {e.username or 'unknown'} from {e.source_ip or 'unknown'}",
            "severity": e.severity or "info",
        }
        for e in sorted(events, key=lambda x: x.timestamp or x.created_at, reverse=True)[:5]
        if e.severity in ("high", "critical")
    ]

    return DashboardStats(
        total_events=total,
        suspicious_events=suspicious,
        unique_ips=unique_ips,
        unique_users=unique_users,
        severity_distribution=dict(severity_dist),
        top_source_ips=top_ips,
        failed_login_trend=failed_trend,
        recent_threats=recent,
    )


@router.delete("/clear")
def clear_logs(db: Session = Depends(get_db)):
    """Clear all log events."""
    db.query(LogEvent).delete()
    db.commit()
    return {"message": "All log events cleared"}


def _ip_severity(ip: str, events: list) -> str:
    """Determine severity for an IP based on its activity."""
    ip_events = [e for e in events if e.source_ip == ip]
    failures = sum(1 for e in ip_events if e.status == "failure")
    if failures >= 10:
        return "critical"
    elif failures >= 5:
        return "high"
    elif failures >= 2:
        return "medium"
    return "low"
