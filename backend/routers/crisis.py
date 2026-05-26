from fastapi import APIRouter, Depends
from models.schemas import CrisisCheckResponse
from middleware.auth import get_current_user
from services.crisis_detector import check_crisis
from pydantic import BaseModel

router = APIRouter()

class CrisisCheckRequest(BaseModel):
    text: str

@router.post("/check", response_model=CrisisCheckResponse)
async def check(data: CrisisCheckRequest, user_id: str = Depends(get_current_user)):
    return await check_crisis(data.text)
