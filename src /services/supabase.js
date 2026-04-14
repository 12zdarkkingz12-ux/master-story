// ============================================================
//  Master Story — services/supabase.js
// ============================================================
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

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
  const { data, error } = await supabase
    .from('stories')
    .insert(storyData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function updateStory(id, updates) {
  const { data, error } = await supabase
    .from('stories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteStory(id) {
  const { error } = await supabase
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
  const { data, error } = await supabase
    .from('chapters')
    .upsert(chapterData, { onConflict: 'story_id,chapter_num' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function approveChapter(id) {
  const { data, error } = await supabase
    .from('chapters')
    .update({ status: 'approved' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  // تحديث عدد الفصول في القصة
  await supabase.rpc('update_chapter_count', { p_story_id: data.story_id });
  return data;
}

async function deleteChapter(id) {
  const { error } = await supabase
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
  const { error } = await supabase
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
  await supabase.from('gen_log').insert(logData);
}

module.exports = {
  supabase,
  getAllStories, getStoryById, createStory, updateStory, deleteStory,
  getChaptersByStory, getChapterById, getApprovedSummaries,
  getNextChapterNum, upsertChapter, approveChapter, deleteChapter,
  getConfig, setConfig, getAllConfig,
  logGeneration,
};
