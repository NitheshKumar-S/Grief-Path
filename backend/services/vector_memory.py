"""
Vector memory using Pinecone for semantic retrieval of past journal entries.
Each entry is embedded and stored; at coaching time, top-k similar memories
are retrieved and injected into the LLM prompt for contextual awareness.
"""
from pinecone import Pinecone, ServerlessSpec
from sentence_transformers import SentenceTransformer
from config import settings
import uuid

pc = Pinecone(api_key=settings.pinecone_api_key)
embedder = SentenceTransformer("all-MiniLM-L6-v2")  # 384-dim, fast & free

def get_or_create_index():
    existing = [i.name for i in pc.list_indexes()]
    if settings.pinecone_index not in existing:
        pc.create_index(
            name=settings.pinecone_index,
            dimension=384,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
    return pc.Index(settings.pinecone_index)

def store_entry(user_id: str, entry_id: str, text: str, metadata: dict):
    """Embed and upsert a journal entry into Pinecone."""
    index = get_or_create_index()
    vector = embedder.encode(text).tolist()
    index.upsert(vectors=[{
        "id": entry_id,
        "values": vector,
        "metadata": {
            "user_id": user_id,
            "text_preview": text[:200],
            **metadata
        }
    }])

def retrieve_similar(user_id: str, query_text: str, top_k: int = 4) -> list[str]:
    """Retrieve top-k semantically similar past entries for a user."""
    index = get_or_create_index()
    vector = embedder.encode(query_text).tolist()
    results = index.query(
        vector=vector,
        top_k=top_k,
        filter={"user_id": {"$eq": user_id}},
        include_metadata=True
    )
    return [m["metadata"].get("text_preview", "") for m in results.get("matches", [])]
