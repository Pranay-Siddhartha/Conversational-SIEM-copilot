import json
import re
import urllib.request
import urllib.error
import os

from backend.config import settings
from backend.prompts.templates import (
    CHAT_SYSTEM_PROMPT,
    CHAT_USER_TEMPLATE,
    TIMELINE_PROMPT,
    PREDICTION_PROMPT,
    REPORT_PROMPT,
)


def call_groq(system_prompt: str, user_prompt: str) -> str:
    """Call Groq API using lightweight urllib (Vercel-safe)."""

    # Safe key loading
    api_key = os.getenv("GROQ_API_KEY") or getattr(settings, "GROQ_API_KEY", None)

    # Debug visibility in Vercel logs
    print(f"DEBUG: Groq API initialized. Key present: {bool(api_key)}")

    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is missing. Add it in Vercel Project Settings → Environment Variables."
        )

    url = "https://api.groq.com/openai/v1/chat/completions"

    payload = json.dumps({
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 2048,
    })

    req = urllib.request.Request(
        url,
        data=payload.encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "SIEMCopilot/1.0",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            raw = resp.read().decode("utf-8")
            data = json.loads(raw)

            if "choices" not in data or not data["choices"]:
                raise RuntimeError(f"Unexpected Groq response: {raw[:300]}")

            return data["choices"][0]["message"]["content"]

    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Groq API error: {body[:300]}")

    except urllib.error.URLError as e:
        raise RuntimeError(f"Groq network error: {str(e)}")

    except Exception as e:
        raise RuntimeError(f"Unexpected Groq failure: {str(e)}")


def generate_chat_response(question: str, log_context: str, count: int = 0) -> str:
    """Generate AI response for chat-based security investigation."""
    prompt = CHAT_USER_TEMPLATE.format(
        count=count,
        log_context=log_context,
        question=question,
    )
    return call_groq(CHAT_SYSTEM_PROMPT, prompt)


def generate_attack_story(events_text: str) -> dict:
    """Generate timeline narrative from security events."""
    prompt = TIMELINE_PROMPT.format(events=events_text)
    raw = call_groq(CHAT_SYSTEM_PROMPT, prompt)

    json_match = re.search(r"\{[\s\S]*\}", raw)
    if json_match:
        return json.loads(json_match.group())

    return {
        "narrative": raw,
        "overall_severity": "high",
    }


def predict_next_move(timeline_text: str) -> dict:
    """Predict attacker next move from timeline."""
    prompt = PREDICTION_PROMPT.format(timeline=timeline_text)
    raw = call_groq(CHAT_SYSTEM_PROMPT, prompt)

    json_match = re.search(r"\{[\s\S]*\}", raw)
    if json_match:
        return json.loads(json_match.group())

    return {
        "predicted_next_move": raw[:200],
        "confidence": "medium",
        "reasoning": raw,
    }


def generate_report(incident_data: str) -> str:
    """Generate professional incident response report."""
    prompt = REPORT_PROMPT.format(incident_data=incident_data)
    return call_groq(CHAT_SYSTEM_PROMPT, prompt)