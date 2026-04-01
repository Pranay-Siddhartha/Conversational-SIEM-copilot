"""AI Service — Gemini/OpenAI with smart data-driven fallback."""
import json
import re
import urllib.request
import urllib.error
from collections import Counter
from app.config import settings
from app.prompts.templates import (
    CHAT_SYSTEM_PROMPT, CHAT_USER_TEMPLATE,
    TIMELINE_PROMPT, PREDICTION_PROMPT, REPORT_PROMPT,
)


def _call_ai(system_prompt: str, user_prompt: str) -> str:
    """Route to AI provider, fall back to smart analysis."""
    provider = settings.AI_PROVIDER.lower()

    if provider == "openai" and settings.OPENAI_API_KEY:
        return _call_openai(system_prompt, user_prompt)
    elif provider == "gemini" and settings.GEMINI_API_KEY:
        return _call_gemini(system_prompt, user_prompt)
    else:
        # Smart fallback — analyze the data directly
        return _smart_analysis(user_prompt)


def _call_openai(system_prompt: str, user_prompt: str) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
        max_tokens=2000,
    )
    return response.choices[0].message.content


def _call_gemini(system_prompt: str, user_prompt: str) -> str:
    """Call Gemini via REST API."""
    api_key = settings.GEMINI_API_KEY
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"

    payload = json.dumps({
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"parts": [{"text": user_prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 2048},
    })

    req = urllib.request.Request(
        url, data=payload.encode("utf-8"),
        headers={"Content-Type": "application/json"}, method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["candidates"][0]["content"]["parts"][0]["text"]
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Gemini API error: {body[:100]}")


# ── Public API ───────────────────────────────────────────────

def chat_with_logs(question: str, log_context: str, count: int = 0) -> str:
    """Conversational chat about log data."""
    prompt = CHAT_USER_TEMPLATE.format(
        count=count, log_context=log_context, question=question
    )

    provider = settings.AI_PROVIDER.lower()
    has_key = (provider == "openai" and settings.OPENAI_API_KEY) or \
              (provider == "gemini" and settings.GEMINI_API_KEY)

    if has_key:
        try:
            return _call_ai(CHAT_SYSTEM_PROMPT, prompt)
        except Exception:
            pass

    # Smart analysis from actual log data
    return _analyze_logs_smart(question, log_context, count)


def generate_attack_story(events_text: str) -> dict:
    """Generate a narrative attack timeline."""
    prompt = TIMELINE_PROMPT.format(events=events_text)

    try:
        raw = _call_ai(CHAT_SYSTEM_PROMPT, prompt)
        json_match = re.search(r'\{[\s\S]*\}', raw)
        if json_match:
            return json.loads(json_match.group())
        return {"narrative": raw, "overall_severity": "high"}
    except Exception:
        return _build_smart_narrative(events_text)


def predict_next_move(timeline_text: str) -> dict:
    """Predict attacker's next action."""
    prompt = PREDICTION_PROMPT.format(timeline=timeline_text)

    try:
        raw = _call_ai(CHAT_SYSTEM_PROMPT, prompt)
        json_match = re.search(r'\{[\s\S]*\}', raw)
        if json_match:
            return json.loads(json_match.group())
        return {
            "predicted_next_move": raw[:200],
            "confidence": "medium",
            "reasoning": raw,
            "recommended_actions": [],
        }
    except Exception:
        return _build_smart_prediction(timeline_text)


def generate_report(incident_data: str) -> str:
    """Generate a formatted incident report."""
    prompt = REPORT_PROMPT.format(incident_data=incident_data)
    try:
        return _call_ai(CHAT_SYSTEM_PROMPT, prompt)
    except Exception:
        return _build_smart_report(incident_data)


# ── Smart Data-Driven Analysis (No API Key Needed) ───────────

def _analyze_logs_smart(question: str, log_context: str, count: int) -> str:
    """Analyze logs directly from the data — no AI API needed."""
    lines = log_context.strip().split("\n")
    q = question.lower()

    # Parse log lines into structured data
    events = []
    for line in lines:
        event = {}
        for part in line.split():
            if part.startswith("src="):
                event["ip"] = part[4:]
            elif part.startswith("user="):
                event["user"] = part[5:]
            elif part.startswith("action="):
                event["action"] = part[7:]
            elif part.startswith("status="):
                event["status"] = part[7:]
            elif part.startswith("severity="):
                event["severity"] = part[9:]
        if line.startswith("["):
            event["time"] = line.split("]")[0].strip("[")
        events.append(event)

    total = len(events)
    failures = [e for e in events if e.get("status") == "failure"]
    successes = [e for e in events if e.get("status") == "success"]
    high_sev = [e for e in events if e.get("severity") in ("high", "critical")]

    ip_counter = Counter(e.get("ip", "-") for e in events if e.get("ip") and e.get("ip") != "-")
    user_counter = Counter(e.get("user", "-") for e in events if e.get("user") and e.get("user") != "-")
    fail_ips = Counter(e.get("ip", "-") for e in failures if e.get("ip") and e.get("ip") != "-")
    action_counter = Counter(e.get("action", "-") for e in events if e.get("action") and e.get("action") != "-")

    # Route to specific analysis based on question
    if any(kw in q for kw in ["suspicious", "ip", "threat", "malicious"]):
        return _format_suspicious_ips(ip_counter, fail_ips, failures, successes, total)
    elif any(kw in q for kw in ["brute", "force", "failed login", "failed"]):
        return _format_brute_force(fail_ips, failures, successes, total)
    elif any(kw in q for kw in ["admin", "root", "privilege", "sudo", "escalat"]):
        return _format_admin_activity(events, user_counter)
    elif any(kw in q for kw in ["user", "login", "who"]):
        return _format_user_analysis(user_counter, fail_ips, events)
    elif any(kw in q for kw in ["summar", "overview", "what happened"]):
        return _format_summary(events, total, failures, successes, ip_counter, user_counter, high_sev)
    elif any(kw in q for kw in ["report", "incident"]):
        return _format_summary(events, total, failures, successes, ip_counter, user_counter, high_sev)
    else:
        return _format_summary(events, total, failures, successes, ip_counter, user_counter, high_sev)


def _format_suspicious_ips(ip_counter, fail_ips, failures, successes, total):
    result = "## 🔍 Suspicious IP Analysis\n\n"
    result += f"Analyzed **{total}** log events. Found **{len(failures)}** failures across **{len(fail_ips)}** unique IPs.\n\n"

    if fail_ips:
        result += "### 🔴 Most Suspicious IPs (by failed attempts)\n\n"
        result += "| IP Address | Failed Attempts | Risk Level |\n"
        result += "|------------|----------------|------------|\n"
        for ip, count in fail_ips.most_common(10):
            risk = "🔴 Critical" if count >= 10 else "🟠 High" if count >= 5 else "🟡 Medium"
            result += f"| `{ip}` | {count} | {risk} |\n"

    # Check for successful logins after failures (brute force success)
    fail_ips_set = set(fail_ips.keys())
    success_ips = set(e.get("ip") for e in successes if e.get("ip") and e.get("ip") != "-")
    compromised = fail_ips_set & success_ips

    if compromised:
        result += f"\n### ⚠️ CRITICAL: Successful Login After Failed Attempts\n\n"
        for ip in compromised:
            result += f"- **`{ip}`** — {fail_ips[ip]} failed attempts followed by successful login! This indicates a **successful brute-force attack**.\n"

    result += "\n### 🛡️ Recommended Actions\n"
    for ip, count in fail_ips.most_common(3):
        result += f"- Block IP `{ip}` at the firewall immediately\n"
    result += "- Enable account lockout after 5 failed attempts\n"
    result += "- Deploy multi-factor authentication\n"
    result += "- Review all successful logins from flagged IPs\n"

    return result


def _format_brute_force(fail_ips, failures, successes, total):
    result = "## 🔓 Brute Force Attack Analysis\n\n"

    if not failures:
        return result + "No failed login attempts detected in the current log data.\n"

    result += f"Detected **{len(failures)}** failed login attempts across **{len(fail_ips)}** source IPs.\n\n"

    for ip, count in fail_ips.most_common(5):
        status = "⚠️ **COMPROMISED** — followed by successful login!" if any(
            e.get("ip") == ip and e.get("status") == "success" for e in successes
        ) else "Blocked — no successful login"
        result += f"### `{ip}` — {count} failed attempts\n"
        result += f"- Status: {status}\n\n"

    result += "### 🛡️ Mitigation\n"
    result += "- Implement fail2ban or similar intrusion prevention\n"
    result += "- Enable SSH key-based authentication only\n"
    result += "- Deploy rate limiting on authentication endpoints\n"
    result += "- Set up alerts for >5 failed login attempts from any IP\n"

    return result


def _format_admin_activity(events, user_counter):
    result = "## 👤 Admin & Privilege Escalation Analysis\n\n"

    admin_users = ["root", "admin", "administrator"]
    admin_events = [e for e in events if e.get("user", "").lower() in admin_users]
    sudo_events = [e for e in events if e.get("action", "").lower() in ("sudo", "su", "privilege_escalation")]

    if admin_events:
        result += f"### Admin Account Activity\n"
        result += f"Found **{len(admin_events)}** events involving admin/root accounts.\n\n"
        for user in admin_users:
            user_evts = [e for e in admin_events if e.get("user", "").lower() == user]
            if user_evts:
                result += f"- **{user}**: {len(user_evts)} events\n"

    if sudo_events:
        result += f"\n### ⚡ Privilege Escalation Events\n"
        result += f"Detected **{len(sudo_events)}** privilege escalation (sudo/su) events.\n\n"
        result += "⚠️ Privilege escalation should be closely monitored, especially after brute-force activity.\n"

    result += "\n### 🛡️ Recommended Actions\n"
    result += "- Audit all admin account usage in the last 24 hours\n"
    result += "- Implement least-privilege access policies\n"
    result += "- Enable real-time alerting for sudo/su commands\n"
    result += "- Restrict root login to local terminal only\n"

    return result


def _format_user_analysis(user_counter, fail_ips, events):
    result = "## 👥 User Activity Analysis\n\n"
    result += f"Found **{len(user_counter)}** unique users in the logs.\n\n"

    if user_counter:
        result += "| User | Event Count | Status |\n"
        result += "|------|------------|--------|\n"
        for user, count in user_counter.most_common(10):
            user_fails = sum(1 for e in events if e.get("user") == user and e.get("status") == "failure")
            status = "🔴 Targeted" if user_fails > 3 else "🟢 Normal"
            result += f"| `{user}` | {count} | {status} |\n"

    return result


def _format_summary(events, total, failures, successes, ip_counter, user_counter, high_sev):
    result = "## 📊 Security Log Summary\n\n"
    result += f"| Metric | Value |\n"
    result += f"|--------|-------|\n"
    result += f"| Total Events | {total} |\n"
    result += f"| Failed Attempts | {len(failures)} |\n"
    result += f"| Successful Logins | {len(successes)} |\n"
    result += f"| High/Critical Events | {len(high_sev)} |\n"
    result += f"| Unique IPs | {len(ip_counter)} |\n"
    result += f"| Unique Users | {len(user_counter)} |\n\n"

    fail_rate = len(failures) / total * 100 if total > 0 else 0
    if fail_rate > 50:
        result += f"⚠️ **Alert**: {fail_rate:.0f}% failure rate indicates active attack!\n\n"

    if high_sev:
        result += "### 🚨 High Severity Events\n"
        for e in high_sev[:5]:
            result += f"- **{e.get('action', 'event')}** by `{e.get('user', 'unknown')}` from `{e.get('ip', 'unknown')}`\n"

    result += "\n### 🛡️ Recommended Actions\n"
    result += "- Investigate all high-severity events\n"
    result += "- Block top offending IPs at the firewall\n"
    result += "- Rotate credentials for potentially compromised accounts\n"
    result += "- Enable enhanced logging and monitoring\n"

    return result


def _build_smart_narrative(events_text: str) -> dict:
    """Build timeline narrative from actual events."""
    lines = [l.strip() for l in events_text.strip().split("\n") if l.strip()]

    if not lines:
        return {"narrative": "No significant events to analyze.", "overall_severity": "low"}

    # Count severity indicators
    critical_count = sum(1 for l in lines if "critical" in l.lower())
    high_count = sum(1 for l in lines if "high" in l.lower())
    failure_count = sum(1 for l in lines if "failure" in l.lower() or "failed" in l.lower())
    sudo_count = sum(1 for l in lines if "sudo" in l.lower() or "privilege" in l.lower())

    severity = "critical" if critical_count > 0 else "high" if high_count > 0 else "medium"

    narrative = f"**Attack Progression Analysis** ({len(lines)} suspicious events detected)\n\n"

    if failure_count > 5:
        narrative += (
            f"The analysis reveals a concentrated brute-force attack pattern with "
            f"**{failure_count} failed authentication attempts**. This volume of failures "
            f"strongly suggests automated credential stuffing or password spraying.\n\n"
        )

    if sudo_count > 0:
        narrative += (
            f"**{sudo_count} privilege escalation events** were detected, indicating "
            f"the attacker gained initial access and attempted to elevate permissions. "
            f"This is a critical escalation in the attack kill chain.\n\n"
        )

    # Extract unique IPs mentioned
    ip_pattern = re.compile(r'\d+\.\d+\.\d+\.\d+')
    ips = set()
    for line in lines:
        ips.update(ip_pattern.findall(line))

    if ips:
        narrative += f"**{len(ips)} unique IP addresses** were involved: {', '.join(list(ips)[:5])}.\n\n"

    narrative += (
        "This attack chain follows a pattern consistent with: "
        "**reconnaissance → credential attack → access → escalation → potential exfiltration**. "
        "Immediate investigation and containment is recommended."
    )

    return {"narrative": narrative, "overall_severity": severity}


def _build_smart_prediction(timeline_text: str) -> dict:
    """Predict next attacker move from timeline patterns."""
    text = timeline_text.lower()

    if "exfil" in text or "transfer" in text or "scp" in text or "curl" in text:
        return {
            "predicted_next_move": "Establishing persistence and covering tracks",
            "confidence": "high",
            "reasoning": (
                "Data exfiltration has already occurred, indicating the attacker is in the "
                "late stages of the kill chain. The most likely next steps are establishing "
                "persistence mechanisms (cron jobs, backdoor accounts, modified binaries) and "
                "clearing logs to cover their tracks."
            ),
            "recommended_actions": [
                "Check for newly created user accounts or SSH keys",
                "Audit cron jobs and scheduled tasks",
                "Verify integrity of system binaries",
                "Preserve logs before they can be tampered with",
                "Isolate affected systems from the network",
            ],
        }
    elif "sudo" in text or "privilege" in text or "escalat" in text:
        return {
            "predicted_next_move": "Lateral movement to internal hosts using stolen credentials",
            "confidence": "high",
            "reasoning": (
                "After privilege escalation, attackers typically move laterally through the "
                "network using harvested credentials, SSH keys from the compromised host, "
                "or pass-the-hash techniques to reach high-value targets."
            ),
            "recommended_actions": [
                "Rotate all SSH keys on the compromised host immediately",
                "Monitor for unusual connections between internal hosts",
                "Audit access logs on adjacent systems",
                "Implement network segmentation to limit lateral movement",
                "Deploy endpoint detection on all critical servers",
            ],
        }
    elif "success" in text and "failure" in text:
        return {
            "predicted_next_move": "Privilege escalation and internal reconnaissance",
            "confidence": "high",
            "reasoning": (
                "A successful login after multiple failures indicates a compromised account. "
                "The attacker will likely attempt to escalate privileges, enumerate internal "
                "resources, and establish persistence before moving to high-value targets."
            ),
            "recommended_actions": [
                "Lock the compromised account immediately",
                "Block the source IP at the firewall",
                "Force password resets for all related accounts",
                "Monitor for sudo/su activity from the compromised user",
                "Enable enhanced logging on all authentication events",
            ],
        }
    else:
        return {
            "predicted_next_move": "Continued credential attacks or reconnaissance",
            "confidence": "medium",
            "reasoning": (
                "Based on the current attack pattern, the threat actor is likely to continue "
                "probing for weak credentials or shift to scanning for vulnerable services. "
                "Early-stage attacks often escalate rapidly if not contained."
            ),
            "recommended_actions": [
                "Block suspicious source IPs at the perimeter",
                "Enable rate limiting on all authentication endpoints",
                "Deploy honeypots to detect lateral movement",
                "Implement account lockout policies",
                "Enable real-time alerting for failed login spikes",
            ],
        }


def _build_smart_report(incident_data_str: str) -> str:
    """Build incident report from actual data."""
    try:
        data = json.loads(incident_data_str)
    except (json.JSONDecodeError, TypeError):
        data = {}

    total = data.get("total_events", 0)
    threats = data.get("total_threats", 0)
    score = data.get("risk_score", 0)
    severity = data.get("risk_severity", "unknown").upper()
    ips = data.get("suspicious_ips", [])
    users = data.get("affected_users", [])
    failures = data.get("failed_events", 0)
    factors = data.get("risk_factors", [])
    threat_details = data.get("threats", [])

    report = f"# 🚨 Security Incident Report\n\n"
    report += f"**Generated**: Automated SIEM Copilot Analysis\n"
    report += f"**Severity**: {severity} (Risk Score: {score}/100)\n\n"

    report += "## Executive Summary\n\n"
    report += (
        f"Analysis of **{total}** security events revealed **{threats}** distinct threats "
        f"with an overall risk score of **{score}/100 ({severity})**. "
        f"A total of **{failures}** failed authentication attempts were recorded across "
        f"**{len(ips)}** unique IP addresses affecting **{len(users)}** user accounts.\n\n"
    )

    if threat_details:
        report += "## Detected Threats\n\n"
        report += "| Type | Severity | Description |\n"
        report += "|------|----------|-------------|\n"
        for t in threat_details[:10]:
            report += f"| {t.get('type', 'unknown')} | {t.get('severity', '-')} | {t.get('description', '-')} |\n"
        report += "\n"

    if factors:
        report += "## Risk Factor Breakdown\n\n"
        for f in factors:
            report += f"- **{f.get('factor', 'Unknown')}** (+{f.get('impact', 0)} risk): {f.get('detail', '')}\n"
        report += "\n"

    if ips:
        report += "## Suspicious IP Addresses\n\n"
        for ip in ips[:10]:
            report += f"- `{ip}`\n"
        report += "\n"

    if users:
        report += "## Affected User Accounts\n\n"
        for user in users[:10]:
            report += f"- `{user}`\n"
        report += "\n"

    report += "## Recommended Mitigations\n\n"
    report += "1. **Immediate**: Block all identified suspicious IPs at the perimeter firewall\n"
    report += "2. **Critical**: Force credential rotation for all affected user accounts\n"
    report += "3. **High**: Enable multi-factor authentication on all privileged accounts\n"
    report += "4. **Medium**: Deploy intrusion detection/prevention systems\n"
    report += "5. **Ongoing**: Implement continuous log monitoring and automated alerting\n\n"

    report += "## Conclusion\n\n"
    report += (
        f"This incident has been classified as **{severity}** severity. "
        f"Immediate containment actions are recommended to prevent further compromise. "
        f"All affected systems should be isolated and forensically examined.\n"
    )

    return report


def _smart_analysis(prompt: str) -> str:
    """Generic smart analysis fallback."""
    return _format_summary([], 0, [], [], Counter(), Counter(), [])
