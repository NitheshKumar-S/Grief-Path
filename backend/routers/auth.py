from fastapi import APIRouter, HTTPException, status
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from models.schemas import UserRegister, UserLogin, TokenResponse
from database import supabase
from config import settings

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode({"sub": user_id, "exp": expire}, settings.jwt_secret, algorithm=settings.jwt_algorithm)

@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister):
    hashed = pwd_context.hash(data.password)
    try:
        result = supabase.table("users").insert({
            "email": data.email,
            "password_hash": hashed,
            "display_name": data.display_name,
            "loss_type": data.loss_type,
            "loss_date": data.loss_date,
        }).execute()
        user = result.data[0]
        return TokenResponse(access_token=create_token(user["id"]), user_id=user["id"])
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    result = supabase.table("users").select("*").eq("email", data.email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user = result.data[0]
    if not pwd_context.verify(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenResponse(access_token=create_token(user["id"]), user_id=user["id"])
