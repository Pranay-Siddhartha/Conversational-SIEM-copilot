"""Multi-format log parser for SIEM Copilot."""
import re
import csv
import json
import io
import datetime
from typing import Optional
from dateutil import parser as dateutil_parser


def parse_log_file(content: str, filename: str) -> tuple[list[dict], str]:
    """Parse a log file and return (events_list, detected_source_type)."""
    filename_lower = filename.lower()

    if filename_lower.endswith(".json"):
        return _parse_json(content), "json"
    elif filename_lower.endswith(".csv"):
        return _parse_csv(content), "csv"
    elif "auth" in filename_lower or "secure" in filename_lower:
        return _parse_auth_log(content), "auth"
    elif "firewall" in filename_lower or "iptables" in filename_lower:
        return _parse_firewall_log(content), "firewall"
    else:
        # Try auto-detect
        if content.strip().startswith("[") or content.strip().startswith("{"):
            return _parse_json(content), "json"
        elif "," in content.split("\n")[0] and len(content.split("\n")[0].split(",")) >= 3:
            return _parse_csv(content), "csv"
        else:
            return _parse_auth_log(content), "auth"


def _safe_parse_timestamp(ts_str: str) -> Optional[datetime.datetime]:
    """Safely parse a timestamp string."""
    if not ts_str:
        return None
    try:
        return dateutil_parser.parse(ts_str, fuzzy=True)
    except (ValueError, TypeError):
        return None


# ── Auth Log Parser ──────────────────────────────────────────
AUTH_PATTERNS = [
    # Failed password
    re.compile(
        r"(?P<timestamp>\w+\s+\d+\s+[\d:]+)\s+\S+\s+sshd\[\d+\]:\s+Failed password for (?:invalid user )?(?P<user>\S+)\s+from\s+(?P<ip>[\d.]+)"
    ),
    # Accepted password
    re.compile(
        r"(?P<timestamp>\w+\s+\d+\s+[\d:]+)\s+\S+\s+sshd\[\d+\]:\s+Accepted (?:password|publickey) for (?P<user>\S+)\s+from\s+(?P<ip>[\d.]+)"
    ),
    # sudo / su
    re.compile(
        r"(?P<timestamp>\w+\s+\d+\s+[\d:]+)\s+\S+\s+sudo:\s+(?P<user>\S+)\s+:"
    ),
    # General sshd
    re.compile(
        r"(?P<timestamp>\w+\s+\d+\s+[\d:]+)\s+\S+\s+sshd\[\d+\]:\s+(?P<message>.*)"
    ),
]


def _parse_auth_log(content: str) -> list[dict]:
    events = []
    for line in content.strip().split("\n"):
        line = line.strip()
        if not line:
            continue

        event = {
            "timestamp": None,
            "source_ip": None,
            "dest_ip": None,
            "username": None,
            "action": None,
            "status": None,
            "raw_line": line,
            "severity": "info",
            "log_source": "auth",
        }

        # Try failed password
        m = AUTH_PATTERNS[0].search(line)
        if m:
            event["timestamp"] = _safe_parse_timestamp(m.group("timestamp"))
            event["username"] = m.group("user")
            event["source_ip"] = m.group("ip")
            event["action"] = "ssh_login"
            event["status"] = "failure"
            event["severity"] = "medium"
            events.append(event)
            continue

        # Try accepted password
        m = AUTH_PATTERNS[1].search(line)
        if m:
            event["timestamp"] = _safe_parse_timestamp(m.group("timestamp"))
            event["username"] = m.group("user")
            event["source_ip"] = m.group("ip")
            event["action"] = "ssh_login"
            event["status"] = "success"
            event["severity"] = "low"
            events.append(event)
            continue

        # Try sudo
        m = AUTH_PATTERNS[2].search(line)
        if m:
            event["timestamp"] = _safe_parse_timestamp(m.group("timestamp"))
            event["username"] = m.group("user")
            event["action"] = "sudo"
            event["status"] = "success"
            event["severity"] = "high"
            events.append(event)
            continue

        # General sshd message
        m = AUTH_PATTERNS[3].search(line)
        if m:
            event["timestamp"] = _safe_parse_timestamp(m.group("timestamp"))
            msg = m.group("message").lower()
            if "disconnect" in msg:
                event["action"] = "disconnect"
                event["status"] = "info"
            elif "invalid" in msg:
                event["action"] = "invalid_user"
                event["status"] = "failure"
                event["severity"] = "medium"
            else:
                event["action"] = "sshd_event"
                event["status"] = "info"
            events.append(event)
            continue

        # Fallback — store raw line
        event["action"] = "unknown"
        event["status"] = "info"
        events.append(event)

    return events


# ── CSV Parser ───────────────────────────────────────────────
COLUMN_MAP = {
    "ip": "source_ip", "src_ip": "source_ip", "source": "source_ip",
    "source_ip": "source_ip", "sourceip": "source_ip", "src": "source_ip",
    "dst_ip": "dest_ip", "dest": "dest_ip", "destination": "dest_ip",
    "dest_ip": "dest_ip", "destip": "dest_ip", "dst": "dest_ip",
    "user": "username", "username": "username", "account": "username",
    "user_name": "username",
    "action": "action", "event": "action", "event_type": "action",
    "type": "action", "activity": "action",
    "status": "status", "result": "status", "outcome": "status",
    "timestamp": "timestamp", "time": "timestamp", "date": "timestamp",
    "datetime": "timestamp", "event_time": "timestamp",
    "severity": "severity", "level": "severity", "priority": "severity",
}


def _parse_csv(content: str) -> list[dict]:
    events = []
    reader = csv.DictReader(io.StringIO(content))
    for row in reader:
        event = {
            "timestamp": None,
            "source_ip": None,
            "dest_ip": None,
            "username": None,
            "action": None,
            "status": None,
            "raw_line": json.dumps(row),
            "severity": "info",
            "log_source": "csv",
            "extra_data": {},
        }

        mapped_keys = set()
        for col, val in row.items():
            if not col:
                continue
            col_lower = str(col).strip().lower().replace(" ", "_")
            if col_lower in COLUMN_MAP:
                target = COLUMN_MAP[col_lower]
                if target == "timestamp":
                    event[target] = _safe_parse_timestamp(val)
                else:
                    event[target] = val.strip() if val else None
                mapped_keys.add(col)
            else:
                event["extra_data"][col] = val

        events.append(event)
    return events


# ── JSON Parser ──────────────────────────────────────────────
def _parse_json(content: str) -> list[dict]:
    events = []
    try:
        data = json.loads(content)
        if isinstance(data, dict):
            data = [data]
    except json.JSONDecodeError:
        # Try NDJSON
        data = []
        for line in content.strip().split("\n"):
            line = line.strip()
            if line:
                try:
                    data.append(json.loads(line))
                except json.JSONDecodeError:
                    continue

    for obj in data:
        if not isinstance(obj, dict):
            continue
        event = {
            "timestamp": None,
            "source_ip": None,
            "dest_ip": None,
            "username": None,
            "action": None,
            "status": None,
            "raw_line": json.dumps(obj),
            "severity": "info",
            "log_source": "json",
            "extra_data": {},
        }

        for col, val in obj.items():
            col_lower = col.strip().lower().replace(" ", "_")
            if col_lower in COLUMN_MAP:
                target = COLUMN_MAP[col_lower]
                if target == "timestamp":
                    event[target] = _safe_parse_timestamp(str(val))
                else:
                    event[target] = str(val).strip() if val else None
            else:
                event["extra_data"][col] = val

        events.append(event)
    return events


# ── Firewall Log Parser ─────────────────────────────────────
FIREWALL_PATTERN = re.compile(
    r"(?P<timestamp>[\w\s:]+?)\s+.*?SRC=(?P<src>[\d.]+).*?DST=(?P<dst>[\d.]+).*?PROTO=(?P<proto>\w+)"
)


def _parse_firewall_log(content: str) -> list[dict]:
    events = []
    for line in content.strip().split("\n"):
        line = line.strip()
        if not line:
            continue

        event = {
            "timestamp": None,
            "source_ip": None,
            "dest_ip": None,
            "username": None,
            "action": "firewall_event",
            "status": "info",
            "raw_line": line,
            "severity": "low",
            "log_source": "firewall",
        }

        m = FIREWALL_PATTERN.search(line)
        if m:
            event["timestamp"] = _safe_parse_timestamp(m.group("timestamp"))
            event["source_ip"] = m.group("src")
            event["dest_ip"] = m.group("dst")
            event["action"] = f"firewall_{m.group('proto').lower()}"

        if "DROP" in line or "BLOCK" in line or "DENY" in line:
            event["status"] = "blocked"
            event["severity"] = "medium"
        elif "ACCEPT" in line or "ALLOW" in line:
            event["status"] = "allowed"

        events.append(event)
    return events
