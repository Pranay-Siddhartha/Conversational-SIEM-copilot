import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Float, JSON
from app.database import Base


class LogEvent(Base):
    __tablename__ = "log_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=True, index=True)
    source_ip = Column(String(45), nullable=True, index=True)
    dest_ip = Column(String(45), nullable=True)
    username = Column(String(255), nullable=True, index=True)
    action = Column(String(255), nullable=True)
    status = Column(String(50), nullable=True, index=True)  # success, failure, etc.
    raw_line = Column(Text, nullable=True)
    severity = Column(String(20), nullable=True, default="info")  # info, low, medium, high, critical
    log_source = Column(String(100), nullable=True)  # auth, firewall, syslog, etc.
    extra_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(500), nullable=False)
    summary = Column(Text, nullable=True)
    severity = Column(String(20), nullable=False, default="medium")
    status = Column(String(50), nullable=False, default="open")  # open, investigating, resolved
    timeline_json = Column(JSON, nullable=True)
    prediction = Column(Text, nullable=True)
    risk_score = Column(Float, nullable=True)
    affected_users = Column(JSON, nullable=True)
    suspicious_ips = Column(JSON, nullable=True)
    mitigations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    incident_id = Column(Integer, nullable=True)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    report_type = Column(String(50), default="incident")  # incident, summary, threat
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
