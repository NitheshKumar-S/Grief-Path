import re, json
from services.groq_client import chat

CRISIS_PATTERNS = [
    r"\bsuicid\w*\b", r"\bkill myself\b", r"\bend my life\b",
    r"\bdon'?t want to (be here|live|exist)\b", r"\bcan'?t go on\b",
    r"\bno reason to live\b", r"\bhurt myself\b", r"\bself.harm\b",
]
RESOURCES = [
    "iCall (India): 9152987821",
    "Vandrevala Foundation: 1860-2662-345 (24/7)",
    "AASRA: 9820466627",
    "iCall Chat: icallhelpline.org",
]

def keyword_screen(text: str) -> bool:
    return any(re.search(p, text.lower()) for p in CRISIS_PATTERNS)

async def check_crisis(text: str) -> dict:
    if not keyword_screen(text):
        return {"flagged": False, "severity": "none", "resources": []}
    try:
        raw = chat(
            """Crisis detection classifier. Respond ONLY with JSON:
{"flagged": true/false, "severity": "low"|"medium"|"high"}
Flag true only for clear suicidal ideation or intent to self-harm.""",
            text, max_tokens=40
        )
        result = json.loads(raw)
        flagged  = result.get("flagged", False)
        severity = result.get("severity", "low")
    except Exception:
        flagged, severity = True, "medium"
    return {"flagged": flagged, "severity": severity, "resources": RESOURCES if flagged else []}
