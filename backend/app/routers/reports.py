"""Incident report generation endpoints."""
import json
import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import LogEvent, Incident, Report
from app.schemas import ReportOut, IncidentOut, GenerateReportRequest
from app.services.ai_service import generate_report, predict_next_move, generate_attack_story
from app.services.threat_detector import detect_threats
from app.services.risk_scorer import calculate_risk_score

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.post("/generate", response_model=ReportOut)
def generate_incident_report(req: GenerateReportRequest, db: Session = Depends(get_db)):
    """Generate a one-click incident report from all stored log data."""
    events = db.query(LogEvent).order_by(LogEvent.timestamp.asc().nullslast()).all()

    if not events:
        return ReportOut(
            id=0,
            title="No Data",
            content="No log data available. Please upload logs first.",
            report_type="incident",
            created_at=datetime.datetime.utcnow(),
        )

    # Build analysis data
    event_dicts = [_event_to_dict(e) for e in events]
    threats = detect_threats(event_dicts)
    risk = calculate_risk_score(event_dicts, threats)

    # Collect key stats
    unique_ips = list(set(e.source_ip for e in events if e.source_ip))
    unique_users = list(set(e.username for e in events if e.username))
    failures = sum(1 for e in events if e.status == "failure")

    # Build timeline text
    timeline_text = "\n".join(
        f"[{e.timestamp.strftime('%H:%M:%S') if e.timestamp else '??:??'}] "
        f"{e.action or 'event'} | user={e.username or '-'} | ip={e.source_ip or '-'} | status={e.status or '-'}"
        for e in events
        if e.severity in ("high", "critical") or e.status == "failure"
    )

    incident_data = json.dumps({
        "total_events": len(events),
        "total_threats": len(threats),
        "risk_score": risk["overall_score"],
        "risk_severity": risk["severity"],
        "risk_factors": risk["factors"],
        "threats": threats[:10],
        "suspicious_ips": unique_ips[:20],
        "affected_users": unique_users[:20],
        "failed_events": failures,
        "timeline": timeline_text[:3000],
    }, indent=2, default=str)

    # Generate report via AI
    try:
        content = generate_report(incident_data)
    except Exception as e:
        content = f"⚠️ AI report generation failed: {str(e)}\n\nRaw incident data was collected but AI analysis is unavailable."

    # Create incident record
    incident = Incident(
        title=req.title or "Security Incident Report",
        summary=f"Risk: {risk['severity'].upper()} ({risk['overall_score']}/100). "
                f"{len(threats)} threats detected across {len(events)} events.",
        severity=risk["severity"],
        status="investigating",
        timeline_json=threats[:20],
        prediction=None,
        risk_score=risk["overall_score"],
        affected_users=unique_users[:20],
        suspicious_ips=unique_ips[:20],
        mitigations=[],
    )
    db.add(incident)
    db.flush()

    # Store report
    report = Report(
        incident_id=incident.id,
        title=req.title or "Security Incident Report",
        content=content,
        report_type="incident",
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return ReportOut(
        id=report.id,
        incident_id=report.incident_id,
        title=report.title,
        content=report.content,
        report_type=report.report_type,
        created_at=report.created_at,
    )


@router.get("/", response_model=list[ReportOut])
def list_reports(db: Session = Depends(get_db)):
    """List all generated reports."""
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    return reports


@router.get("/{report_id}", response_model=ReportOut)
def get_report(report_id: int, db: Session = Depends(get_db)):
    """Get a specific report."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        return ReportOut(
            id=0, title="Not Found", content="Report not found.",
            report_type="error", created_at=datetime.datetime.utcnow(),
        )
    return report


@router.get("/incidents/list", response_model=list[IncidentOut])
def list_incidents(db: Session = Depends(get_db)):
    """List all incidents."""
    return db.query(Incident).order_by(Incident.created_at.desc()).all()


def _event_to_dict(e: LogEvent) -> dict:
    return {
        "timestamp": e.timestamp,
        "source_ip": e.source_ip,
        "dest_ip": e.dest_ip,
        "username": e.username,
        "action": e.action,
        "status": e.status,
        "raw_line": e.raw_line,
        "severity": e.severity,
        "log_source": e.log_source,
    }
