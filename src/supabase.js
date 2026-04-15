// ============================================================
//  Master Story — src/supabase.js
// ============================================================
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;           // anon key (للقراءة العامة)
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;  // service_role (للكتابة الآمنة)

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('⚠ تحذير: SUPABASE_URL أو SUPABASE_KEY غير موجودين في .env');
}

// عميل القراءة (anon)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// عميل الكتابة (service_role إذا توفر، وإلا يرجع لـ anon)
const supabaseAdmin = SERVICE_KEY
  ? createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : supabase;

// ── مساعدات القصص ─────────────────────────────────────────────

async function getAllStories() {
  const { data, error } = await supabase
    .from('stories')
    .select('id, title, genre, darkness, chapter_count, status, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function getStoryById(id) {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

async function createStory(storyData) {
  const { data, error } = await supabaseAdmin
    .from('stories')
    .insert(storyData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function updateStory(id, updates) {
  const { data, error } = await supabaseAdmin
    .from('stories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteStory(id) {
  const { error } = await supabaseAdmin
    .from('stories')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ── مساعدات الفصول ────────────────────────────────────────────

async function getChaptersByStory(storyId) {
  const { data, error } = await supabase
    .from('chapters')
    .select('id, chapter_num, title, summary, word_count, status, created_at')
    .eq('story_id', storyId)
    .order('chapter_num', { ascending: true });
  if (error) throw error;
  return data;
}

async function getChapterById(id) {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

async function getApprovedSummaries(storyId, limit = 10) {
  const { data, error } = await supabase
    .from('chapters')
    .select('chapter_num, title, summary')
    .eq('story_id', storyId)
    .eq('status', 'approved')
    .order('chapter_num', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

async function getNextChapterNum(storyId) {
  const { data, error } = await supabase
    .from('chapters')
    .select('chapter_num')
    .eq('story_id', storyId)
    .eq('status', 'approved')
    .order('chapter_num', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data.length > 0 ? data[0].chapter_num + 1 : 1;
}

async function upsertChapter(chapterData) {
  const { data, error } = await supabaseAdmin
    .from('chapters')
    .upsert(chapterData, { onConflict: 'story_id,chapter_num' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function approveChapter(id) {
  const { data, error } = await supabaseAdmin
    .from('chapters')
    .update({ status: 'approved' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  // تحديث عدد الفصول — نحسب يدوياً بدل RPC لأمان أكثر
  const chapters = await getChaptersByStory(data.story_id);
  const count    = chapters.filter(c => c.status === 'approved').length;
  await updateStory(data.story_id, { chapter_count: count });
  return data;
}

async function deleteChapter(id) {
  const { error } = await supabaseAdmin
    .from('chapters')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ── مساعدات الإعدادات ─────────────────────────────────────────

async function getConfig(key) {
  const { data } = await supabase
    .from('config')
    .select('value')
    .eq('key', key)
    .single();
  return data?.value || null;
}

async function setConfig(key, value) {
  const { error } = await supabaseAdmin
    .from('config')
    .upsert({ key, value }, { onConflict: 'key' });
  if (error) throw error;
}

async function getAllConfig() {
  const { data, error } = await supabase
    .from('config')
    .select('key, value');
  if (error) throw error;
  const result = {};
  (data || []).forEach(row => { result[row.key] = row.value; });
  return result;
}

// ── سجل التوليد ───────────────────────────────────────────────

async function logGeneration(logData) {
  await supabaseAdmin.from('gen_log').insert(logData);
}

module.exports = {
  supabase, supabaseAdmin,
  getAllStories, getStoryById, createStory, updateStory, deleteStory,
  getChaptersByStory, getChapterById, getApprovedSummaries,
  getNextChapterNum, upsertChapter, approveChapter, deleteChapter,
  getConfig, setConfig, getAllConfig,
  logGeneration,
};
