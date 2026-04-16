// ============================================================
//  Master Story v4.9 — src/chapters.js
//  FIX #1: استخدام supabaseAdmin للكتابة
//  FIX #3: إزالة inner require
// ============================================================
const express          = require('express');
const router           = express.Router();
const db               = require('./supabase');
const { supabaseAdmin } = require('./supabase');

// GET /api/chapters/:id — فصل واحد
router.get('/:id', async (req, res) => {
  try {
    const chapter = await db.getChapterById(req.params.id);
    res.json({ ok: true, chapter });
  } catch (err) {
    res.status(404).json({ ok: false, error: 'الفصل غير موجود' });
  }
});

// POST /api/chapters/:id/approve — اعتماد فصل
router.post('/:id/approve', async (req, res) => {
  try {
    const chapter = await db.approveChapter(req.params.id);
    res.json({ ok: true, chapter });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT /api/chapters/:id — تعديل فصل (المحتوى أو العنوان أو الملخص)
// FIX #1: استخدام supabaseAdmin بدل supabase
router.put('/:id', async (req, res) => {
  try {
    const allowed = ['title', 'content', 'summary'];
    const updates = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    if (updates.content) {
      updates.word_count = updates.content.trim().split(/\s+/).filter(Boolean).length;
    }
    const { data, error } = await supabaseAdmin
      .from('chapters')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;

    // إعادة حساب total_words إذا تغيّر المحتوى
    if (updates.content) {
      await db.recalcStoryStats(data.story_id).catch(() => {});
    }
    res.json({ ok: true, chapter: data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/chapters/:id — حذف فصل
router.delete('/:id', async (req, res) => {
  try {
    const chapter = await db.getChapterById(req.params.id);
    await db.deleteChapter(req.params.id);
    if (chapter) {
      await db.recalcStoryStats(chapter.story_id).catch(() => {});
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
