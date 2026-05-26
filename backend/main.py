from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routers import journal, auth, insights, crisis, memory
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("GriefPath API starting...")
    yield

app = FastAPI(title="GriefPath API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # lock down to your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,     prefix="/auth",     tags=["Auth"])
app.include_router(journal.router,  prefix="/journal",  tags=["Journal"])
app.include_router(insights.router, prefix="/insights", tags=["Insights"])
app.include_router(crisis.router,   prefix="/crisis",   tags=["Crisis"])
app.include_router(memory.router,   prefix="/memory",   tags=["Memory"])

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
