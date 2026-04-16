-- ============================================================
--  Master Story v4.9 — مخطط قاعدة البيانات
--  شغّل هذا في Supabase SQL Editor (حذف + إعادة إنشاء كامل)
-- ============================================================

-- ── حذف الجداول القديمة إن وُجدت ──────────────────────────────
DROP TABLE IF EXISTS gen_log  CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS stories  CASCADE;
DROP TABLE IF EXISTS config   CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

-- ============================================================
--  جدول القصص
-- ============================================================
CREATE TABLE stories (
  id              UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  title           VARCHAR(500) NOT NULL,
  genre           TEXT         NOT NULL DEFAULT '[]',
  style           TEXT         DEFAULT '',
  darkness        INTEGER      DEFAULT 5 CHECK (darkness BETWEEN 1 AND 10),
  world_data      JSONB        DEFAULT '{}',
  characters      JSONB        DEFAULT '[]',
  timeline        JSONB        DEFAULT '{}',
  chapter_count   INTEGER      DEFAULT 0,
  total_words     INTEGER      DEFAULT 0,
  last_chapter_at TIMESTAMPTZ,
  status          VARCHAR(50)  DEFAULT 'active',
  created_at      TIMESTAMPTZ  DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ============================================================
--  جدول الفصول
-- ============================================================
CREATE TABLE chapters (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id    UUID         REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  chapter_num INTEGER      NOT NULL,
  title       VARCHAR(500) DEFAULT '',
  content     TEXT         DEFAULT '',
  summary     TEXT         DEFAULT '',
  word_count  INTEGER      DEFAULT 0,
  status      VARCHAR(50)  DEFAULT 'draft',
  model_used  VARCHAR(200) DEFAULT '',
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE(story_id, chapter_num)
);

-- ============================================================
--  جدول الإعدادات
-- ============================================================
CREATE TABLE config (
  key        VARCHAR(100) PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ  DEFAULT NOW()
);

-- ============================================================
--  جدول سجل التوليد
-- ============================================================
CREATE TABLE gen_log (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id    UUID,
  chapter_num INTEGER,
  type        VARCHAR(50),
  model       VARCHAR(200),
  duration_ms INTEGER,
  status      VARCHAR(50)  DEFAULT 'success',
  error_msg   TEXT,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- ============================================================
--  الإعدادات الافتراضية
-- ============================================================
INSERT INTO config (key, value) VALUES
  ('openrouter_model', 'meta-llama/llama-4-scout:free'),
  ('openrouter_key',   ''),
  ('max_tokens',       '4000'),
  ('app_password',     '')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
--  دالة تحديث updated_at تلقائياً
-- ============================================================
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

-- ============================================================
--  فهارس لتسريع الاستعلامات
-- ============================================================
CREATE INDEX idx_chapters_story_id     ON chapters(story_id);
CREATE INDEX idx_chapters_story_status ON chapters(story_id, status);
CREATE INDEX idx_chapters_status       ON chapters(status);
CREATE INDEX idx_gen_log_created       ON gen_log(created_at DESC);
CREATE INDEX idx_gen_log_story         ON gen_log(story_id);
CREATE INDEX idx_stories_created       ON stories(created_at DESC);
CREATE INDEX idx_stories_status        ON stories(status);

-- ============================================================
--  تعطيل RLS — ضروري لعمل الكتابة بدون أخطاء صلاحيات
-- ============================================================
ALTER TABLE stories  DISABLE ROW LEVEL SECURITY;
ALTER TABLE chapters DISABLE ROW LEVEL SECURITY;
ALTER TABLE config   DISABLE ROW LEVEL SECURITY;
ALTER TABLE gen_log  DISABLE ROW LEVEL SECURITY;
