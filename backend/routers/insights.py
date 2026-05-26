from fastapi import APIRouter, Depends
from models.schemas import InsightsResponse, EmotionDataPoint, EmotionLabel, GriefStage
from middleware.auth import get_current_user
from database import supabase
from services.coach import generate_coaching_response
from collections import Counter
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/", response_model=InsightsResponse)
async def get_insights(user_id: str = Depends(get_current_user)):
    # Fetch last 30 days of entries
    since = (datetime.utcnow() - timedelta(days=30)).isoformat()
    result = supabase.table("journal_entries") \
        .select("emotion_detected,grief_stage,created_at,emotion_confidence") \
        .eq("user_id", user_id) \
        .gte("created_at", since) \
        .order("created_at") \
        .execute()

    rows = result.data or []
    total = supabase.table("journal_entries").select("id", count="exact").eq("user_id", user_id).execute()
    total_entries = total.count or len(rows)

    # Emotion trend
    trend = [
        EmotionDataPoint(
            date=r["created_at"][:10],
            emotion=r["emotion_detected"],
            intensity=r.get("emotion_confidence", 0.7)
        ) for r in rows
    ]

    # Dominant emotion
    emotions = [r["emotion_detected"] for r in rows]
    dominant = Counter(emotions).most_common(1)[0][0] if emotions else "sadness"

    # Current grief stage (most recent)
    current_stage = rows[-1]["grief_stage"] if rows else "depression"

    # Streak calculation
    streak = 0
    today = datetime.utcnow().date()
    dates = sorted(set(r["created_at"][:10] for r in rows), reverse=True)
    for i, d in enumerate(dates):
        if (today - timedelta(days=i)).isoformat() == d:
            streak += 1
        else:
            break

    # AI-generated weekly summary
    summary = await generate_coaching_response(
        f"The user has written {len(rows)} journal entries in the last 30 days. "
        f"Most common emotion: {dominant}. Current grief stage: {current_stage}. "
        f"Journaling streak: {streak} days. Please write a warm, encouraging 2-sentence summary of their progress.",
        GriefStage(current_stage),
        EmotionLabel(dominant),
        []
    )

    return InsightsResponse(
        emotion_trend=trend,
        dominant_emotion=EmotionLabel(dominant),
        journal_streak=streak,
        total_entries=total_entries,
        grief_stage_current=GriefStage(current_stage),
        progress_summary=summary,
    )
