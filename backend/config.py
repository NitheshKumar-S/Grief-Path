from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str
    groq_api_key: str           # <-- replaces anthropic_api_key
    pinecone_api_key: str
    pinecone_index: str = "griefpath-memory"
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080
    encryption_key: str
    environment: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
