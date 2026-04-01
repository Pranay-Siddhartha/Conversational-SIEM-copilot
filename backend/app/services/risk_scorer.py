"""Risk scoring engine for security events."""
from collections import Counter


def calculate_risk_score(events: list[dict], threats: list[dict]) -> dict:
    """Calculate overall risk score (0-100) and severity."""
    score = 0.0
    factors = []

    # Factor 1: Failed login ratio
    total = len(events)
    failures = sum(1 for e in events if e.get("status") == "failure")
    if total > 0:
        fail_ratio = failures / total
        fail_score = min(fail_ratio * 40, 25)
        score += fail_score
        if fail_ratio > 0.3:
            factors.append({
                "factor": "High failure rate",
                "detail": f"{failures}/{total} events are failures ({fail_ratio:.0%})",
                "impact": round(fail_score, 1),
            })

    # Factor 2: Brute force attacks
    brute_forces = [t for t in threats if t.get("type") == "brute_force"]
    if brute_forces:
        bf_score = min(len(brute_forces) * 15, 25)
        score += bf_score
        successful = any(t.get("success_after") for t in brute_forces)
        if successful:
            score += 15
            bf_score += 15
        factors.append({
            "factor": "Brute force attacks",
            "detail": f"{len(brute_forces)} brute-force attacks detected"
                      + (" (one succeeded!)" if successful else ""),
            "impact": round(bf_score, 1),
        })

    # Factor 3: Privilege escalation
    priv_esc = [t for t in threats if t.get("type") == "privilege_escalation"]
    if priv_esc:
        pe_score = min(len(priv_esc) * 10, 20)
        score += pe_score
        factors.append({
            "factor": "Privilege escalation",
            "detail": f"{len(priv_esc)} escalation events detected",
            "impact": round(pe_score, 1),
        })

    # Factor 4: Suspicious hours
    susp_hours = [t for t in threats if t.get("type") == "suspicious_hours"]
    if susp_hours:
        sh_score = min(len(susp_hours) * 5, 10)
        score += sh_score
        factors.append({
            "factor": "Off-hours activity",
            "detail": f"{len(susp_hours)} events during suspicious hours (00:00–05:00)",
            "impact": round(sh_score, 1),
        })

    # Factor 5: Data exfiltration
    exfil = [t for t in threats if t.get("type") == "data_exfiltration"]
    if exfil:
        ex_score = 20
        score += ex_score
        factors.append({
            "factor": "Data exfiltration",
            "detail": f"{len(exfil)} potential exfiltration events",
            "impact": ex_score,
        })

    # Factor 6: Admin/root account usage
    admin_events = sum(
        1 for e in events
        if (e.get("username") or "").lower() in ("root", "admin", "administrator")
        and e.get("status") == "success"
    )
    if admin_events > 0:
        admin_score = min(admin_events * 3, 10)
        score += admin_score
        factors.append({
            "factor": "Admin account access",
            "detail": f"{admin_events} successful admin/root logins",
            "impact": round(admin_score, 1),
        })

    # Cap at 100
    score = min(score, 100)

    # Determine severity
    if score >= 75:
        severity = "critical"
    elif score >= 50:
        severity = "high"
    elif score >= 25:
        severity = "medium"
    else:
        severity = "low"

    return {
        "overall_score": round(score, 1),
        "severity": severity,
        "factors": factors,
    }
