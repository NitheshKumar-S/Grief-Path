from services.groq_client import chat
from models.schemas import EmotionLabel, GriefStage

def build_system(stage: GriefStage, emotion: EmotionLabel, memories: list[str]) -> str:
    memory_block = ""
    if memories:
        joined = "\n".join(f"- {m}" for m in memories if m)
        memory_block = f"\nThe person has previously written about:\n{joined}\nReference their journey without quoting them directly.\n"

    return f"""You are GriefPath, a compassionate grief companion — warm and empathetic, not a therapist.

The person is in the {stage.value} stage of grief. Current emotion: {emotion.value}.
{memory_block}
Guidelines:
- 3-5 sentences. Warm, not clinical.
- Acknowledge pain before any reframe.
- No platitudes like "time heals all wounds".
- End with one gentle open question.
- If you detect self-harm ideation, respond ONLY with: CRISIS_DETECTED"""

async def generate_coaching_response(
    entry_text: str, stage: GriefStage, emotion: EmotionLabel, memories: list[str]
) -> str:
    try:
        return chat(build_system(stage, emotion, memories), entry_text, max_tokens=350)
    except Exception:
        return "I'm here with you. Your feelings are valid, and you don't have to navigate this alone."
