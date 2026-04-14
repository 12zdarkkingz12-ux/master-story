// ============================================================
//  Master Story — routes/stories.js
// ============================================================
const express = require('express');
const router  = express.Router();
const db      = require('../services/supabase');

// GET /api/stories — كل القصص
router.get('/', async (req, res) => {
  try {
    const stories = await db.getAllStories();
    res.json({ ok: true, stories });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/stories/:id — قصة واحدة
router.get('/:id', async (req, res) => {
  try {
    const story = await db.getStoryById(req.params.id);
    res.json({ ok: true, story });
  } catch (err) {
    res.status(404).json({ ok: false, error: 'القصة غير موجودة' });
  }
});

// GET /api/stories/:id/chapters — فصول قصة
router.get('/:id/chapters', async (req, res) => {
  try {
    const chapters = await db.getChaptersByStory(req.params.id);
    res.json({ ok: true, chapters });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/stories — إنشاء قصة جديدة
router.post('/', async (req, res) => {
  try {
    const { title, genre, style, darkness, world_data, characters, timeline } = req.body;
    if (!title || !genre) {
      return res.status(400).json({ ok: false, error: 'العنوان والنوع مطلوبان' });
    }
    const story = await db.createStory({
      title, genre,
      style:       style || '',
      darkness:    parseInt(darkness) || 5,
      world_data:  world_data || {},
      characters:  characters || [],
      timeline:    timeline || {},
    });
    res.json({ ok: true, story });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT /api/stories/:id — تحديث قصة
router.put('/:id', async (req, res) => {
  try {
    const allowed = ['title', 'genre', 'style', 'darkness', 'world_data', 'characters', 'timeline', 'status'];
    const updates = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    const story = await db.updateStory(req.params.id, updates);
    res.json({ ok: true, story });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/stories/:id — حذف قصة
router.delete('/:id', async (req, res) => {
  try {
    await db.deleteStory(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
