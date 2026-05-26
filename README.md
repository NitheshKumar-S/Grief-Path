# 🌿 GriefPath — Full Stack Setup Guide

## Project Structure
```
griefpath/
├── backend/          # FastAPI — deploy to Render / Railway / Fly.io
├── frontend/         # React Native (Expo) — deploy to App Store / Play Store
└── deploy/           # Dockerfiles, SQL schema, deployment configs
```

---

## Step 1 — Supabase (Database)
1. Create a free project at https://supabase.com
2. Go to SQL Editor → paste contents of `deploy/supabase_schema.sql` → Run
3. Copy your Project URL and Service Role Key from Settings → API

---

## Step 2 — Pinecone (Vector Memory)
1. Create a free account at https://pinecone.io
2. Create an index named `griefpath-memory`, dimension `384`, metric `cosine`
3. Copy your API key

---

## Step 3 — Anthropic API Key
1. Go to https://console.anthropic.com
2. Create an API key with sufficient credits

---

## Step 4 — Backend Setup & Deploy

### Local development
```bash
cd backend
cp .env.example .env
# Fill in all values in .env

pip install -r requirements.txt
uvicorn main:app --reload
# API running at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Deploy to Render (free tier)
1. Push this repo to GitHub
2. Go to https://render.com → New Web Service → Connect repo
3. Use `deploy/render.yaml` — it configures everything
4. Add your env vars in the Render dashboard
5. Deploy — you get a public URL like `https://griefpath-api.onrender.com`

### Or deploy with Docker
```bash
cd deploy
docker-compose up --build
```

---

## Step 5 — Frontend Setup

```bash
cd frontend
npm install

# Create a .env file:
echo "EXPO_PUBLIC_API_URL=https://your-render-url.onrender.com" > .env
```

### Run on your phone (fastest way to demo)
```bash
npx expo start
# Scan QR code with Expo Go app (iOS or Android)
```

### Build for production
```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Build for Android (APK for testing)
eas build --platform android --profile preview

# Build for iOS
eas build --platform ios
```

### Configure `app.json` before building
```json
{
  "expo": {
    "name": "GriefPath",
    "slug": "griefpath",
    "version": "1.0.0",
    "icon": "./assets/icon.png",
    "splash": { "backgroundColor": "#F5F0EB" },
    "ios": { "bundleIdentifier": "com.yourname.griefpath" },
    "android": { "package": "com.yourname.griefpath" }
  }
}
```

---

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/register | Create account |
| POST | /auth/login | Login |
| POST | /journal/entry | Submit journal + get AI response |
| GET | /journal/entries | List all entries |
| GET | /insights/ | Emotion trends + AI summary |
| POST | /memory/ | Add memory capsule |
| GET | /memory/ | List memories |
| POST | /crisis/check | Manual crisis check |
| GET | /health | Health check |

Full interactive docs at `/docs` when running locally.

---

## Tech Stack Summary
| Layer | Technology |
|-------|-----------|
| Mobile app | React Native + Expo |
| Backend API | FastAPI (Python) |
| Database | Supabase (PostgreSQL) |
| Auth | JWT + bcrypt |
| Encryption | AES-256 via Fernet |
| AI coaching | Claude (claude-sonnet-4) |
| Emotion classification | Claude (zero-shot) |
| Vector memory | Pinecone + MiniLM embeddings |
| Crisis detection | Keyword screen + Claude confirmation |
| Hosting | Render.com (backend) + Expo (mobile) |

---

## Resume talking points
- **RAG architecture**: journal entries embedded → retrieved at coaching time → injected into LLM context
- **Privacy engineering**: AES-256 encryption at rest, JWT auth, Supabase RLS
- **Responsible AI**: dual-layer crisis detection (keyword + LLM), LLM guardrails, no clinical advice
- **Full stack**: mobile (React Native) + REST API (FastAPI) + vector DB + LLM
- **Real-world problem**: grief support is inaccessible; this bridges the gap affordably
