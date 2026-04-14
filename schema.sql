-- ============================================================
--  Master Story — مخطط قاعدة البيانات
--  شغّل هذا في Supabase SQL Editor
-- ============================================================

-- ── جدول القصص ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stories (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         VARCHAR(500) NOT NULL,
  genre         VARCHAR(100) NOT NULL DEFAULT 'واقعي',
  style         TEXT DEFAULT '',
  darkness      INTEGER DEFAULT 5 CHECK (darkness BETWEEN 1 AND 10),
  world_data    JSONB DEFAULT '{}',
  characters    JSONB DEFAULT '[]',
  timeline      JSONB DEFAULT '{}',
  chapter_count INTEGER DEFAULT 0,
  status        VARCHAR(50) DEFAULT 'active',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── جدول الفصول ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chapters (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id    UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  chapter_num INTEGER NOT NULL,
  title       VARCHAR(500) DEFAULT '',
  content     TEXT DEFAULT '',
  summary     TEXT DEFAULT '',
  word_count  INTEGER DEFAULT 0,
  status      VARCHAR(50) DEFAULT 'draft',
  model_used  VARCHAR(200) DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, chapter_num)
);

-- ── جدول الإعدادات ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS config (
  key        VARCHAR(100) PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── جدول سجل التوليد ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gen_log (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id      UUID,
  chapter_num   INTEGER,
  type          VARCHAR(50),
  model         VARCHAR(200),
  duration_ms   INTEGER,
  status        VARCHAR(50) DEFAULT 'success',
  error_msg     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── الإعدادات الافتراضية ─────────────────────────────────────
INSERT INTO config (key, value) VALUES
  ('openrouter_model', 'meta-llama/llama-4-scout:free'),
  ('openrouter_key', ''),
  ('max_tokens', '4000'),
  ('app_password', '')
ON CONFLICT (key) DO NOTHING;

-- ── دالة تحديث updated_at تلقائياً ──────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
