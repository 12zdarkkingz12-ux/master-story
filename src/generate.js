// ============================================================
//  Master Story — routes/generate.js
// ============================================================
const express  = require('express');
const router   = express.Router();
const db       = require('./supabase');
const ai       = require('./openrouter');
const prompts  = require('./promptBuilder');

// ── POST /api/generate/world ──────────────────────────────────
router.post('/world', async (req, res) => {
  const start = Date.now();
  try {
    const { title, genre, style, darkness, model } = req.body;
    if (!title) {
      return res.status(400).json({ ok: false, error: 'العنوان مطلوب' });
    }
    const prompt = prompts.buildWorldPrompt({ title, genre, style, darkness });
    const result = await ai.generate(prompt, { model, maxTokens: 2500 });
    await db.logGeneration({ type: 'world', model: result.model, duration_ms: Date.now() - start, status: 'success' });
    res.json({ ok: true, text: result.text, model: result.model });
  } catch (err) {
    await db.logGeneration({ type: 'world', status: 'failed', error_msg: err.message, duration_ms: Date.now() - start });
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── POST /api/generate/characters ────────────────────────────
router.post('/characters', async (req, res) => {
  const start = Date.now();
  try {
    const { title, genre, world_data, charCount, model } = req.body;
    const prompt = prompts.buildCharactersPrompt({ title, genre, world_data, charCount: charCount || 4 });
    const result = await ai.generate(prompt, { model, maxTokens: 3000 });
    await db.logGeneration({ type: 'characters', model: result.model, duration_ms: Date.now() - start, status: 'success' });
    res.json({ ok: true, text: result.text, model: result.model });
  } catch (err) {
    await db.logGeneration({ type: 'characters', status: 'failed', error_msg: err.message, duration_ms: Date.now() - start });
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── POST /api/generate/timeline ───────────────────────────────
router.post('/timeline', async (req, res) => {
  const start = Date.now();
  try {
    const { title, genre, world_data, characters, model } = req.body;
    const prompt = prompts.buildTimelinePrompt({ title, genre, world_data, characters });
    const result = await ai.generate(prompt, { model, maxTokens: 2000 });
    await db.logGeneration({ type: 'timeline', model: result.model, duration_ms: Date.now() - start, status: 'success' });
    res.json({ ok: true, text: result.text, model: result.model });
  } catch (err) {
    await db.logGeneration({ type: 'timeline', status: 'failed', error_msg: err.message, duration_ms: Date.now() - start });
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── POST /api/generate/chapter ────────────────────────────────
// FIX #3: لا نستخدم res.end() داخل finally — نتركه بعد الـ stream
router.post('/chapter', async (req, res) => {
  const start = Date.now();
  const { storyId, chapterNum, chapterNotes, chapterTitle, model } = req.body;

  if (!storyId) {
    return res.status(400).json({ ok: false, error: 'storyId مطلوب' });
  }

  // إعداد SSE
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.flushHeaders();

  const send = (event, data) => {
    try { res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); } catch(_) {}
  };

  let ended = false;
  const end = () => { if (!ended) { ended = true; res.end(); } };

  try {
    const [story, prevSummaries] = await Promise.all([
      db.getStoryById(storyId),
      db.getApprovedSummaries(storyId, 8),
    ]);

    const targetChapterNum = chapterNum || await db.getNextChapterNum(storyId);
    send('status', { message: `جارٍ توليد الفصل ${targetChapterNum}...` });

    const prompt = prompts.buildChapterPrompt({
      story, chapterNum: targetChapterNum, chapterNotes, chapterTitle, prevSummaries,
    });

    let fullText  = '';
    let modelUsed = '';

    await ai.streamGenerate(
      prompt,
      { model, maxTokens: 4000 },
      (chunk) => { fullText += chunk; send('chunk', { text: chunk }); },
      (text, elapsed, usedModel) => { fullText = text; modelUsed = usedModel; }
    );

    const wordCount = fullText.trim().split(/\s+/).filter(Boolean).length;
    const titleMatch = fullText.match(/الفصل\s+\d+[:\s]+([^\n]+)/);
    const detectedTitle = chapterTitle || (titleMatch ? titleMatch[1].trim() : `الفصل ${targetChapterNum}`);

    const chapter = await db.upsertChapter({
      story_id: storyId, chapter_num: targetChapterNum,
      title: detectedTitle, content: fullText,
      summary: '', word_count: wordCount,
      status: 'draft', model_used: modelUsed,
    });

    await db.logGeneration({
      story_id: storyId, chapter_num: targetChapterNum,
      type: 'chapter', model: modelUsed,
      duration_ms: Date.now() - start, status: 'success',
    });

    send('done', {
      chapterId: chapter.id, chapterNum: targetChapterNum,
      title: detectedTitle, wordCount, model: modelUsed,
    });

  } catch (err) {
    await db.logGeneration({
      story_id: storyId, type: 'chapter',
      status: 'failed', error_msg: err.message,
      duration_ms: Date.now() - start,
    }).catch(() => {});
    send('error', { message: err.message });
  }

  // نُنهي الاتصال دائماً — لكن مرة واحدة فقط
  end();
});

// ── POST /api/generate/summary ────────────────────────────────
// FIX #6: نستخدم supabaseAdmin لضمان الكتابة
router.post('/summary', async (req, res) => {
  try {
    const { chapterId, model } = req.body;
    const chapter = await db.getChapterById(chapterId);
    if (!chapter) return res.status(404).json({ ok: false, error: 'الفصل غير موجود' });

    const prompt = prompts.buildSummaryPrompt(chapter.content, chapter.chapter_num);
    const result = await ai.generate(prompt, { model, maxTokens: 300 });

    // FIX: supabaseAdmin بدل supabase
    await db.supabaseAdmin
      .from('chapters')
      .update({ summary: result.text.trim() })
      .eq('id', chapterId);

    res.json({ ok: true, summary: result.text.trim() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
