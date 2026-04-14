"""Analysis endpoints: timeline, predictions, risk scoring, threats."""
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import LogEvent, Incident
from app.schemas import TimelineResponse, TimelineEvent, PredictionResponse, RiskScoreResponse, AttackChain, AttackChainsResponse
from app.services.ai_service import generate_attack_story, predict_next_move
from app.services.threat_detector import detect_threats
from app.services.risk_scorer import calculate_risk_score
from collections import defaultdict

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.get("/timeline", response_model=TimelineResponse)
def get_timeline(db: Session = Depends(get_db)):
    """Generate attack timeline from stored events."""
    events = (
        db.query(LogEvent)
        .order_by(LogEvent.timestamp.asc().nullslast())
        .all()
    )

    if not events:
        return TimelineResponse(
            events=[],
            ai_narrative="No log data available. Upload logs to generate a timeline.",
            overall_severity="info",
        )

    # Find suspicious events for the timeline
    event_dicts = [_event_to_dict(e) for e in events]
    threats = detect_threats(event_dicts)

    # Build timeline events from suspicious activity
    timeline_events = []
    seen = set()
    for e in events:
        if e.severity in ("high", "critical") or e.status == "failure":
            ts_str = e.timestamp.strftime("%Y-%m-%d %H:%M:%S") if e.timestamp else "unknown"
            key = f"{ts_str}-{e.action}-{e.source_ip}"
            if key not in seen:
                seen.add(key)
                timeline_events.append(TimelineEvent(
                    timestamp=ts_str,
                    event=f"{e.action or 'event'} by {e.username or 'unknown'} from {e.source_ip or 'unknown'}",
                    severity=e.severity or "medium",
                    details=e.raw_line[:200] if e.raw_line else None,
                ))

    # Generate AI narrative
    events_text = "\n".join(
        f"[{te.timestamp}] {te.event} (severity: {te.severity})"
        for te in timeline_events[:30]  # Limit for context window
    )
    try:
        story = generate_attack_story(events_text) if timeline_events else {}
    except Exception as e:
        story = {"narrative": f"AI analysis unavailable: {str(e)}", "overall_severity": overall if 'overall' in dir() else "high"}

    # Determine overall severity
    severities = [te.severity for te in timeline_events]
    if "critical" in severities:
        overall = "critical"
    elif "high" in severities:
        overall = "high"
    elif "medium" in severities:
        overall = "medium"
    else:
        overall = "low"

    return TimelineResponse(
        events=timeline_events[:50],
        ai_narrative=story.get("narrative", "No significant attack pattern detected."),
        overall_severity=story.get("overall_severity", overall),
    )


@router.get("/predictions", response_model=PredictionResponse)
def get_predictions(db: Session = Depends(get_db)):
    """Predict attacker's next move based on observed patterns."""
    events = db.query(LogEvent).order_by(LogEvent.timestamp.asc().nullslast()).all()

    if not events:
        return PredictionResponse(
            predicted_next_move="No data available for prediction.",
            confidence="low",
            reasoning="Upload security logs to enable threat prediction.",
            recommended_actions=["Upload security logs to get started"],
        )

    # Build timeline summary for prediction
    timeline_text = "\n".join(
        f"[{e.timestamp.strftime('%H:%M:%S') if e.timestamp else '??:??'}] "
        f"{e.action or 'event'} | user={e.username or '-'} | ip={e.source_ip or '-'} | status={e.status or '-'}"
        for e in events
        if e.severity in ("high", "critical") or e.status == "failure"
    )

    if not timeline_text:
        timeline_text = "No significant threats detected in current log data."

    try:
        result = predict_next_move(timeline_text)
    except Exception as e:
        result = {
            "predicted_next_move": f"AI prediction unavailable: {str(e)}",
            "confidence": "low",
            "reasoning": "AI service encountered an error.",
            "recommended_actions": ["Check API key configuration"],
        }

    return PredictionResponse(
        predicted_next_move=result.get("predicted_next_move", "Unable to predict"),
        confidence=result.get("confidence", "medium"),
        reasoning=result.get("reasoning", ""),
        recommended_actions=result.get("recommended_actions", []),
    )


@router.get("/risk-score", response_model=RiskScoreResponse)
def get_risk_score(db: Session = Depends(get_db)):
    """Calculate overall risk score."""
    events = db.query(LogEvent).all()
    event_dicts = [_event_to_dict(e) for e in events]
    threats = detect_threats(event_dicts)
    result = calculate_risk_score(event_dicts, threats)

    return RiskScoreResponse(
        overall_score=result["overall_score"],
        severity=result["severity"],
        factors=result["factors"],
    )


@router.get("/threats")
def get_threats(db: Session = Depends(get_db)):
    """Get detected threats from stored logs."""
    events = db.query(LogEvent).all()
    event_dicts = [_event_to_dict(e) for e in events]
    threats = detect_threats(event_dicts)
    return {"threats": threats, "count": len(threats)}


@router.get("/chains", response_model=AttackChainsResponse)
def get_attack_chains(db: Session = Depends(get_db)):
    """Group suspicious events by source IP to create distinct attack chains."""
    events = db.query(LogEvent).order_by(LogEvent.timestamp.asc().nullslast()).all()
    if not events:
        return AttackChainsResponse(chains=[])

    # 1. Gather suspicious events by IP
    chains_dict = defaultdict(list)
    for e in events:
        if e.severity in ("high", "critical") or e.status == "failure" or (e.action and "escalat" in e.action.lower()):
            ip = e.source_ip or "unknown_ip"
            chains_dict[ip].append(e)
            
    # 2. Build chains
    attack_chains = []
    chain_letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    idx = 0

    for ip, ip_events in chains_dict.items():
        if len(ip_events) == 0:
            continue
            
        # Determine primary attack type
        actions = [e.action for e in ip_events if e.action]
        primary_action = max(set(actions), key=actions.count) if actions else "Suspicious Activity"
        
        # Determine chain severity
        severities = [e.severity for e in ip_events]
        if "critical" in severities: severity = "critical"
        elif "high" in severities: severity = "high"
        elif "medium" in severities: severity = "medium"
        else: severity = "low"

        # Build timeline
        timeline_events = []
        seen = set()
        for e in ip_events:
            ts_str = e.timestamp.strftime("%Y-%m-%d %H:%M:%S") if e.timestamp else "unknown"
            key = f"{ts_str}-{e.action}"
            if key not in seen:
                seen.add(key)
                timeline_events.append(TimelineEvent(
                    timestamp=ts_str,
                    event=f"{e.action or 'event'} by {e.username or 'unknown'}",
                    severity=e.severity or "medium",
                    details=e.raw_line[:200] if e.raw_line else None,
                ))

        # Build textual context for AI
        events_text = "\n".join(
            f"[{te.timestamp}] {te.event} from {ip} (severity: {te.severity})"
            for te in timeline_events[:30]
        )

        try:
            story = generate_attack_story(events_text) if timeline_events else {}
        except Exception as e:
            story = {"narrative": f"AI narrative error: {str(e)}"}

        try:
            pred_res = predict_next_move(events_text) if timeline_events else {}
        except Exception as e:
            pred_res = {
                "predicted_next_move": f"Prediction error: {str(e)}",
                "confidence": "low",
                "reasoning": "AI error.",
                "recommended_actions": []
            }

        prediction = PredictionResponse(
            predicted_next_move=pred_res.get("predicted_next_move", "Unknown"),
            confidence=pred_res.get("confidence", "low"),
            reasoning=pred_res.get("reasoning", ""),
            recommended_actions=pred_res.get("recommended_actions", [])
        )

        attack_chains.append(AttackChain(
            incident_name=f"Attack Chain {chain_letters[idx % len(chain_letters)]}",
            source_ip=ip,
            severity=severity,
            primary_attack_type=primary_action.replace("_", " ").title(),
            timeline=timeline_events[:50],
            ai_narrative=story.get("narrative", "Attack sequence detected."),
            prediction=prediction
        ))
        idx += 1

    # Sort chains by severity (critical first) and then by event count
    severity_rank = {"critical": 4, "high": 3, "medium": 2, "low": 1}
    attack_chains.sort(key=lambda c: (severity_rank.get(c.severity.lower(), 0), len(c.timeline)), reverse=True)

    return AttackChainsResponse(chains=attack_chains)


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
