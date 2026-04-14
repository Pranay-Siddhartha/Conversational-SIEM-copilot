"""Rule-based threat detection engine."""
from collections import Counter, defaultdict
from datetime import timedelta
from typing import Optional


def detect_threats(events: list[dict]) -> list[dict]:
    """Analyze events and return detected threats."""
    threats = []
    threats.extend(_detect_brute_force(events))
    threats.extend(_detect_privilege_escalation(events))
    threats.extend(_detect_suspicious_hours(events))
    threats.extend(_detect_data_exfiltration(events))
    threats.extend(_detect_scanning(events))
    return threats


def _detect_brute_force(events: list[dict], threshold: int = 5) -> list[dict]:
    """Detect brute-force login attempts."""
    ip_failures = defaultdict(list)
    for e in events:
        if e.get("status") == "failure" and e.get("action") in ("ssh_login", "login"):
            ip = e.get("source_ip", "unknown")
            ip_failures[ip].append(e)

    threats = []
    for ip, fails in ip_failures.items():
        if len(fails) >= threshold:
            # Check if there was a subsequent success from same IP
            success_after = any(
                e.get("source_ip") == ip and e.get("status") == "success"
                for e in events
            )
            threats.append({
                "type": "brute_force",
                "severity": "critical" if success_after else "high",
                "source_ip": ip,
                "count": len(fails),
                "description": (
                    f"Brute-force attack: {len(fails)} failed logins from {ip}"
                    + (" — followed by successful login!" if success_after else "")
                ),
                "success_after": success_after,
            })
    return threats


def _detect_privilege_escalation(events: list[dict]) -> list[dict]:
    """Detect sudo/su/privilege escalation."""
    threats = []
    for e in events:
        action = (e.get("action") or "").lower()
        if action in ("sudo", "su", "privilege_escalation"):
            threats.append({
                "type": "privilege_escalation",
                "severity": "high",
                "source_ip": e.get("source_ip"),
                "username": e.get("username"),
                "description": f"Privilege escalation via {action} by {e.get('username', 'unknown')}",
            })
    return threats


def _detect_suspicious_hours(events: list[dict], start_hour: int = 0, end_hour: int = 5) -> list[dict]:
    """Detect activity during suspicious hours (midnight to 5 AM)."""
    threats = []
    for e in events:
        ts = e.get("timestamp")
        if ts and hasattr(ts, "hour") and start_hour <= ts.hour < end_hour:
            if e.get("status") == "success" and e.get("action") in ("ssh_login", "login", "sudo"):
                threats.append({
                    "type": "suspicious_hours",
                    "severity": "medium",
                    "source_ip": e.get("source_ip"),
                    "username": e.get("username"),
                    "description": f"Suspicious login at {ts.strftime('%H:%M')} by {e.get('username', 'unknown')}",
                })
    return threats


def _detect_data_exfiltration(events: list[dict]) -> list[dict]:
    """Detect potential data exfiltration patterns."""
    threats = []
    for e in events:
        action = (e.get("action") or "").lower()
        raw = (e.get("raw_line") or "").lower()
        if any(kw in action or kw in raw for kw in ["exfil", "transfer", "upload", "scp", "rsync", "curl"]):
            threats.append({
                "type": "data_exfiltration",
                "severity": "critical",
                "source_ip": e.get("source_ip"),
                "description": f"Possible data exfiltration activity: {action}",
            })
    return threats


def _detect_scanning(events: list[dict], threshold: int = 10) -> list[dict]:
    """Detect port/network scanning behavior."""
    ip_connections = defaultdict(set)
    for e in events:
        ip = e.get("source_ip")
        dest = e.get("dest_ip")
        if ip and dest:
            ip_connections[ip].add(dest)

    threats = []
    for ip, dests in ip_connections.items():
        if len(dests) >= threshold:
            threats.append({
                "type": "scanning",
                "severity": "high",
                "source_ip": ip,
                "description": f"Scanning behavior: {ip} connected to {len(dests)} unique destinations",
            })
    return threats
