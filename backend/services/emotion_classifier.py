import json
from services.groq_client import chat
from models.schemas import EmotionLabel, GriefStage

SYSTEM = """You are an emotion classifier for grief journaling.
Given a journal entry, classify the primary emotion and grief stage.
Respond ONLY with valid JSON, no other text:
{"emotion": "<sadness|anger|guilt|yearning|numbness|acceptance|fear|relief>",
 "stage":   "<denial|anger|bargaining|depression|acceptance|yearning|searching>",
 "confidence": <0.0-1.0>}"""

async def classify_emotion(text: str) -> dict:
    try:
        raw  = chat(SYSTEM, f"Journal entry:\n{text}", max_tokens=80)
        data = json.loads(raw)
        return {
            "emotion":    EmotionLabel(data.get("emotion", "sadness")),
            "stage":      GriefStage(data.get("stage", "depression")),
            "confidence": float(data.get("confidence", 0.7)),
        }
    except Exception:
        return {"emotion": EmotionLabel.SADNESS, "stage": GriefStage.DEPRESSION, "confidence": 0.5}
