import datetime
from pydantic import BaseModel
from typing import Optional


# ── Log Events ──────────────────────────────────────────────
class LogEventOut(BaseModel):
    id: int
    timestamp: Optional[datetime.datetime] = None
    source_ip: Optional[str] = None
    dest_ip: Optional[str] = None
    username: Optional[str] = None
    action: Optional[str] = None
    status: Optional[str] = None
    raw_line: Optional[str] = None
    severity: Optional[str] = None
    log_source: Optional[str] = None

    class Config:
        from_attributes = True


class LogUploadResponse(BaseModel):
    message: str
    events_count: int
    log_source: str


class LogFilterParams(BaseModel):
    source_ip: Optional[str] = None
    username: Optional[str] = None
    status: Optional[str] = None
    severity: Optional[str] = None
    log_source: Optional[str] = None
    start_time: Optional[datetime.datetime] = None
    end_time: Optional[datetime.datetime] = None
    limit: int = 100
    offset: int = 0


# ── Chat ────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    context_limit: int = 200


class ChatResponse(BaseModel):
    reply: str
    sources_used: int = 0


# ── Analysis ────────────────────────────────────────────────
class TimelineEvent(BaseModel):
    timestamp: Optional[str] = None
    event: str
    severity: str = "info"
    details: Optional[str] = None


class TimelineResponse(BaseModel):
    events: list[TimelineEvent]
    ai_narrative: str
    overall_severity: str


class PredictionResponse(BaseModel):
    predicted_next_move: str
    confidence: str  # high, medium, low
    reasoning: str
    recommended_actions: list[str]


class RiskScoreResponse(BaseModel):
    overall_score: float  # 0-100
    severity: str  # low, medium, high, critical
    factors: list[dict]


# ── Attack Chains (Multi-Incident) ──────────────────────────
class AttackChain(BaseModel):
    incident_name: str
    source_ip: str
    severity: str
    primary_attack_type: str
    timeline: list[TimelineEvent]
    ai_narrative: str
    prediction: PredictionResponse


class AttackChainsResponse(BaseModel):
    chains: list[AttackChain]


# ── Incidents & Reports ────────────────────────────────────
class IncidentOut(BaseModel):
    id: int
    title: str
    summary: Optional[str] = None
    severity: str
    status: str
    prediction: Optional[str] = None
    risk_score: Optional[float] = None
    created_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True


class ReportOut(BaseModel):
    id: int
    incident_id: Optional[int] = None
    title: str
    content: str
    report_type: str
    created_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True


class GenerateReportRequest(BaseModel):
    title: Optional[str] = "Incident Report"


# ── Dashboard Stats ─────────────────────────────────────────
class DashboardStats(BaseModel):
    total_events: int
    suspicious_events: int
    unique_ips: int
    unique_users: int
    severity_distribution: dict
    top_source_ips: list[dict]
    failed_login_trend: list[dict]
    recent_threats: list[dict]
