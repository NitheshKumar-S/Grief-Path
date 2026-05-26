from fastapi import APIRouter, Depends, HTTPException
from models.schemas import JournalEntryCreate, JournalEntryResponse, JournalListItem
from middleware.auth import get_current_user
from services.emotion_classifier import classify_emotion
from services.vector_memory import store_entry, retrieve_similar
from services.coach import generate_coaching_response
from services.crisis_detector import check_crisis
from services.encryption import encrypt, decrypt
from database import supabase
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/entry", response_model=JournalEntryResponse)
async def create_entry(data: JournalEntryCreate, user_id: str = Depends(get_current_user)):
    # 1. Classify emotion + grief stage
    emotion_result = await classify_emotion(data.content)

    # 2. Crisis check (runs in parallel conceptually — use asyncio.gather in prod)
    crisis_result = await check_crisis(data.content)

    # 3. If crisis detected, skip coaching and return safe response
    if crisis_result["flagged"]:
        ai_response = (
            "I can hear that you're in a very dark place right now. "
            "Please reach out to a crisis helpline immediately — you deserve real support. "
            + " | ".join(crisis_result["resources"])
        )
    else:
        # 4. Retrieve similar past memories for context
        memories = retrieve_similar(user_id, data.content, top_k=3)
        # 5. Generate contextual coaching response
        ai_response = await generate_coaching_response(
            data.content,
            emotion_result["stage"],
            emotion_result["emotion"],
            memories
        )

    # 6. Encrypt content before storage
    encrypted_content = encrypt(data.content)
    entry_id = str(uuid.uuid4())

    # 7. Store in Supabase
    entry = {
        "id": entry_id,
        "user_id": user_id,
        "content_encrypted": encrypted_content,
        "emotion_detected": emotion_result["emotion"].value,
        "emotion_confidence": emotion_result["confidence"],
        "grief_stage": emotion_result["stage"].value,
        "ai_response": ai_response,
        "crisis_flagged": crisis_result["flagged"],
        "created_at": datetime.utcnow().isoformat(),
    }
    supabase.table("journal_entries").insert(entry).execute()

    # 8. Store in vector memory (only if not crisis)
    if not crisis_result["flagged"]:
        store_entry(user_id, entry_id, data.content, {
            "emotion": emotion_result["emotion"].value,
            "stage": emotion_result["stage"].value,
        })

    return JournalEntryResponse(
        id=entry_id,
        user_id=user_id,
        content=data.content,
        emotion_detected=emotion_result["emotion"],
        emotion_confidence=emotion_result["confidence"],
        grief_stage=emotion_result["stage"],
        ai_response=ai_response,
        crisis_flagged=crisis_result["flagged"],
        created_at=datetime.utcnow(),
    )

@router.get("/entries", response_model=list[JournalListItem])
async def list_entries(user_id: str = Depends(get_current_user)):
    result = supabase.table("journal_entries") \
        .select("id,emotion_detected,grief_stage,created_at,content_encrypted") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .limit(50) \
        .execute()
    entries = []
    for row in result.data:
        decrypted = decrypt(row["content_encrypted"])
        entries.append(JournalListItem(
            id=row["id"],
            emotion_detected=row["emotion_detected"],
            grief_stage=row["grief_stage"],
            created_at=row["created_at"],
            preview=decrypted[:80] + ("..." if len(decrypted) > 80 else ""),
        ))
    return entries

@router.get("/entry/{entry_id}", response_model=JournalEntryResponse)
async def get_entry(entry_id: str, user_id: str = Depends(get_current_user)):
    result = supabase.table("journal_entries") \
        .select("*").eq("id", entry_id).eq("user_id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Entry not found")
    row = result.data[0]
    row["content"] = decrypt(row["content_encrypted"])
    return JournalEntryResponse(**{k: row[k] for k in JournalEntryResponse.model_fields if k in row})
