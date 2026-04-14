// ============================================================
//  Master Story — routes/chapters.js
// ============================================================
const express = require('express');
const router  = express.Router();
const db      = require('../services/supabase');

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
    const chapter = await db.getChapterById(req.params.id);
    if (!chapter) return res.status(404).json({ ok: false, error: 'الفصل غير موجود' });

    // تحديث حالة الفصل
    const { supabase } = require('../services/supabase');
    const { data, error } = await supabase
      .from('chapters')
      .update({ status: 'approved' })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;

    // تحديث عدد الفصول في القصة
    const approved = await db.getChaptersByStory(chapter.story_id);
    const approvedCount = approved.filter(c => c.status === 'approved').length;
    await db.updateStory(chapter.story_id, { chapter_count: approvedCount });

    res.json({ ok: true, chapter: data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT /api/chapters/:id — تعديل فصل (المحتوى أو الملخص)
router.put('/:id', async (req, res) => {
  try {
    const { supabase } = require('../services/supabase');
    const allowed = ['title', 'content', 'summary'];
    const updates = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    if (updates.content) {
      updates.word_count = updates.content.trim().split(/\s+/).length;
    }
    const { data, error } = await supabase
      .from('chapters')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
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
    // إعادة حساب عدد الفصول
    if (chapter) {
      const remaining = await db.getChaptersByStory(chapter.story_id);
      const approvedCount = remaining.filter(c => c.status === 'approved').length;
      await db.updateStory(chapter.story_id, { chapter_count: approvedCount });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
