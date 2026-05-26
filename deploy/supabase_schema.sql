-- Run this in your Supabase SQL editor to set up the database

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  loss_type     TEXT,
  loss_date     DATE,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
  content_encrypted   TEXT NOT NULL,
  emotion_detected    TEXT NOT NULL,
  emotion_confidence  FLOAT NOT NULL DEFAULT 0.7,
  grief_stage         TEXT NOT NULL,
  ai_response         TEXT NOT NULL,
  crisis_flagged      BOOLEAN DEFAULT FALSE,
  mood_self_report    INT,
  created_at          TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_journal_user ON journal_entries(user_id);
CREATE INDEX idx_journal_created ON journal_entries(created_at DESC);

-- Memory capsules table
CREATE TABLE IF NOT EXISTS memory_capsules (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  content_encrypted TEXT NOT NULL,
  memory_date       DATE,
  created_at        TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_memory_user ON memory_capsules(user_id);

-- Enable Row Level Security (important for Supabase!)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_capsules ENABLE ROW LEVEL SECURITY;

-- Note: since we use the service role key in our backend, RLS won't block our
-- server-side queries, but it prevents direct client-side access to other users' data.

COMMENT ON TABLE journal_entries IS 'content_encrypted is AES-256 encrypted; only the user can decrypt.';
