"""
Advanced Risk Scoring Engine for security events.
Implements an extensible, rule-based approach to assessing risk levels.
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from abc import ABC, abstractmethod


@dataclass
class RiskFactor:
    """Represents an identified risk factor with its corresponding score impact."""
    factor: str
    detail: str
    impact: float


class RiskRule(ABC):
    """Abstract base class for all risk scoring rules."""

    @abstractmethod
    def evaluate(self, events: List[Dict[str, Any]], threats: List[Dict[str, Any]]) -> Optional[RiskFactor]:
        """
        Evaluate the rule against current events and threats.
        Returns a RiskFactor if the rule triggers, otherwise None.
        """
        pass


class FailedLoginRule(RiskRule):
    """Evaluates the ratio of failed logins across all events."""
    def evaluate(self, events: List[Dict[str, Any]], threats: List[Dict[str, Any]]) -> Optional[RiskFactor]:
        total = len(events)
        if total == 0:
            return None

        failures = sum(1 for e in events if e.get("status") == "failure")
        fail_ratio = failures / total

        if fail_ratio > 0.3:
            fail_score = min(fail_ratio * 40, 25)
            return RiskFactor(
                factor="High failure rate",
                detail=f"{failures}/{total} events are failures ({fail_ratio:.0%})",
                impact=round(fail_score, 1)
            )
        return None


class BruteForceRule(RiskRule):
    """Detects brute-force attack patterns and escalates score if successful."""
    def evaluate(self, events: List[Dict[str, Any]], threats: List[Dict[str, Any]]) -> Optional[RiskFactor]:
        brute_forces = [t for t in threats if t.get("type") == "brute_force"]
        if not brute_forces:
            return None

        bf_score = min(len(brute_forces) * 15, 25)
        successful = any(t.get("success_after") for t in brute_forces)

        if successful:
            bf_score += 15

        return RiskFactor(
            factor="Brute force attacks",
            detail=f"{len(brute_forces)} brute-force attacks detected" + (" (one succeeded!)" if successful else ""),
            impact=round(bf_score, 1)
        )


class PrivilegeEscalationRule(RiskRule):
    """Flags any active privilege escalation threats."""
    def evaluate(self, events: List[Dict[str, Any]], threats: List[Dict[str, Any]]) -> Optional[RiskFactor]:
        priv_esc = [t for t in threats if t.get("type") == "privilege_escalation"]
        if not priv_esc:
            return None

        pe_score = min(len(priv_esc) * 10, 20)
        return RiskFactor(
            factor="Privilege escalation",
            detail=f"{len(priv_esc)} escalation events detected",
            impact=round(pe_score, 1)
        )


class SuspiciousHoursRule(RiskRule):
    """Identifies authentication or activities occurring during unusual hours."""
    def evaluate(self, events: List[Dict[str, Any]], threats: List[Dict[str, Any]]) -> Optional[RiskFactor]:
        susp_hours = [t for t in threats if t.get("type") == "suspicious_hours"]
        if not susp_hours:
            return None

        sh_score = min(len(susp_hours) * 5, 10)
        return RiskFactor(
            factor="Off-hours activity",
            detail=f"{len(susp_hours)} events during suspicious hours (00:00–05:00)",
            impact=round(sh_score, 1)
        )


class DataExfiltrationRule(RiskRule):
    """High penalty for potential data exfiltration attempts."""
    def evaluate(self, events: List[Dict[str, Any]], threats: List[Dict[str, Any]]) -> Optional[RiskFactor]:
        exfil = [t for t in threats if t.get("type") == "data_exfiltration"]
        if not exfil:
            return None

        return RiskFactor(
            factor="Data exfiltration",
            detail=f"{len(exfil)} potential exfiltration events",
            impact=20.0
        )


class AdminAccessRule(RiskRule):
    """Detects successful authentications to sensitive accounts like root or admin."""
    def evaluate(self, events: List[Dict[str, Any]], threats: List[Dict[str, Any]]) -> Optional[RiskFactor]:
        admin_events = sum(
            1 for e in events
            if (e.get("username") or "").lower() in ("root", "admin", "administrator")
            and e.get("status") == "success"
        )
        if admin_events == 0:
            return None

        admin_score = min(admin_events * 3, 10)
        return RiskFactor(
            factor="Admin account access",
            detail=f"{admin_events} successful admin/root logins",
            impact=round(admin_score, 1)
        )


class ImpossibleTravelRule(RiskRule):
    """Advanced Rule: Detects rapid authentication attempts across geographically distant IP addresses."""
    def evaluate(self, events: List[Dict[str, Any]], threats: List[Dict[str, Any]]) -> Optional[RiskFactor]:
        impossible_travel = [t for t in threats if t.get("type") == "impossible_travel"]
        if not impossible_travel:
            return None

        return RiskFactor(
            factor="Impossible geographic travel",
            detail=f"{len(impossible_travel)} instance(s) of physically impossible travel velocity detected",
            impact=25.0
        )


class RiskEngine:
    """
    Central engine responsible for executing the registered risk rules
    and aggregating the total threat landscape severity.
    """
    def __init__(self):
        self.rules: List[RiskRule] = []

    def register_rule(self, rule: RiskRule):
        """Register a new risk evaluation rule into the engine."""
        self.rules.append(rule)

    def register_default_rules(self):
        """Registers the standard, out-of-the-box rule suite."""
        self.register_rule(FailedLoginRule())
        self.register_rule(BruteForceRule())
        self.register_rule(PrivilegeEscalationRule())
        self.register_rule(SuspiciousHoursRule())
        self.register_rule(DataExfiltrationRule())
        self.register_rule(AdminAccessRule())
        self.register_rule(ImpossibleTravelRule())

    def calculate_score(self, events: List[Dict[str, Any]], threats: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Executes all active rules and formulates the aggregated risk payload.
        """
        total_score = 0.0
        factors: List[Dict[str, Any]] = []

        for rule in self.rules:
            factor_result = rule.evaluate(events, threats)
            if factor_result is not None:
                total_score += factor_result.impact
                factors.append({
                    "factor": factor_result.factor,
                    "detail": factor_result.detail,
                    "impact": factor_result.impact
                })

        # Bounding the score mathematically
        total_score = min(total_score, 100.0)

        # Map to severity bands
        if total_score >= 75:
            severity = "critical"
        elif total_score >= 50:
            severity = "high"
        elif total_score >= 25:
            severity = "medium"
        else:
            severity = "low"

        return {
            "overall_score": round(total_score, 1),
            "severity": severity,
            "factors": factors
        }


# Maintain backward compatibility with the original function signature
def calculate_risk_score(events: list[dict], threats: list[dict]) -> dict:
    """Calculate overall risk score (0-100) and severity using the advanced RiskEngine."""
    engine = RiskEngine()
    engine.register_default_rules()
    return engine.calculate_score(events, threats)
