from fastapi import APIRouter, Depends, HTTPException
from models.schemas import MemoryCreate, MemoryResponse
from middleware.auth import get_current_user
from services.encryption import encrypt, decrypt
from database import supabase
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/", response_model=MemoryResponse)
async def create_memory(data: MemoryCreate, user_id: str = Depends(get_current_user)):
    memory_id = str(uuid.uuid4())
    row = {
        "id": memory_id,
        "user_id": user_id,
        "title": data.title,
        "content_encrypted": encrypt(data.content),
        "memory_date": data.memory_date,
        "created_at": datetime.utcnow().isoformat(),
    }
    supabase.table("memory_capsules").insert(row).execute()
    return MemoryResponse(id=memory_id, title=data.title, content=data.content,
                          memory_date=data.memory_date, created_at=datetime.utcnow())

@router.get("/", response_model=list[MemoryResponse])
async def list_memories(user_id: str = Depends(get_current_user)):
    result = supabase.table("memory_capsules").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    memories = []
    for row in result.data:
        memories.append(MemoryResponse(
            id=row["id"], title=row["title"],
            content=decrypt(row["content_encrypted"]),
            memory_date=row.get("memory_date"),
            created_at=row["created_at"]
        ))
    return memories

@router.delete("/{memory_id}")
async def delete_memory(memory_id: str, user_id: str = Depends(get_current_user)):
    supabase.table("memory_capsules").delete().eq("id", memory_id).eq("user_id", user_id).execute()
    return {"deleted": True}
