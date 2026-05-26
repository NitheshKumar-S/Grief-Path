"""
Shared Groq client — drop-in replacement for Anthropic.
Uses LLaMA 3.1 70B (free on Groq's free tier).
"""
from groq import Groq
from config import settings

client = Groq(api_key=settings.groq_api_key)
MODEL = "llama-3.1-70b-versatile"  # free, fast, high quality

def chat(system: str, user: str, max_tokens: int = 400) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=max_tokens,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": user},
        ]
    )
    return response.choices[0].message.content.strip()
