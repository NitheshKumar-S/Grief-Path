from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class GriefStage(str, Enum):
    DENIAL     = "denial"
    ANGER      = "anger"
    BARGAINING = "bargaining"
    DEPRESSION = "depression"
    ACCEPTANCE = "acceptance"
    YEARNING   = "yearning"
    SEARCHING  = "searching"

class EmotionLabel(str, Enum):
    SADNESS    = "sadness"
    ANGER      = "anger"
    GUILT      = "guilt"
    YEARNING   = "yearning"
    NUMBNESS   = "numbness"
    ACCEPTANCE = "acceptance"
    FEAR       = "fear"
    RELIEF     = "relief"

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    display_name: str
    loss_type: Optional[str] = None
    loss_date: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str

class JournalEntryCreate(BaseModel):
    content: str
    mood_self_report: Optional[int] = None

class JournalEntryResponse(BaseModel):
    id: str
    user_id: str
    content: str
    emotion_detected: EmotionLabel
    emotion_confidence: float
    grief_stage: GriefStage
    ai_response: str
    crisis_flagged: bool
    created_at: datetime

class JournalListItem(BaseModel):
    id: str
    emotion_detected: EmotionLabel
    grief_stage: GriefStage
    created_at: datetime
    preview: str

class EmotionDataPoint(BaseModel):
    date: str
    emotion: EmotionLabel
    intensity: float

class InsightsResponse(BaseModel):
    emotion_trend: List[EmotionDataPoint]
    dominant_emotion: EmotionLabel
    journal_streak: int
    total_entries: int
    grief_stage_current: GriefStage
    progress_summary: str

class MemoryCreate(BaseModel):
    title: str
    content: str
    memory_date: Optional[str] = None

class MemoryResponse(BaseModel):
    id: str
    title: str
    content: str
    memory_date: Optional[str]
    created_at: datetime

class CrisisCheckResponse(BaseModel):
    flagged: bool
    severity: str
    resources: List[str]
