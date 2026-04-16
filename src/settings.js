// ============================================================
//  Master Story — routes/settings.js
// ============================================================
const express = require('express');
const router  = express.Router();
const db      = require('./supabase');
const { testConnection, FREE_MODELS } = require('./openrouter');

// GET /api/settings — جلب الإعدادات
router.get('/', async (req, res) => {
  try {
    const config = await db.getAllConfig();
    // إخفاء المفتاح جزئياً للأمان
    if (config.openrouter_key && config.openrouter_key.length > 8) {
      config.openrouter_key_preview = config.openrouter_key.slice(0, 8) + '••••••••';
    }
    res.json({ ok: true, config, freeModels: FREE_MODELS });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/settings — حفظ الإعدادات
router.post('/', async (req, res) => {
  try {
    const { openrouter_key, openrouter_model, max_tokens } = req.body;
    const updates = [];
    if (openrouter_key   !== undefined) updates.push(db.setConfig('openrouter_key',   openrouter_key));
    if (openrouter_model !== undefined) updates.push(db.setConfig('openrouter_model', openrouter_model));
    if (max_tokens       !== undefined) updates.push(db.setConfig('max_tokens',       String(max_tokens)));
    await Promise.all(updates);
    res.json({ ok: true, message: 'تم حفظ الإعدادات' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/settings/test — اختبار الاتصال
router.post('/test', async (req, res) => {
  try {
    const { api_key, model } = req.body;
    const keyToTest = api_key || await db.getConfig('openrouter_key') || process.env.OPENROUTER_API_KEY;
    if (!keyToTest) {
      return res.status(400).json({ ok: false, error: 'لا يوجد مفتاح API للاختبار' });
    }
    // FIX #8: استخدم النموذج المرسل من العميل فعلاً
    const modelToTest = model || await db.getConfig('openrouter_model') || 'google/gemma-3-12b-it:free';
    const reply = await testConnection(keyToTest, modelToTest);
    res.json({ ok: true, message: `الاتصال ناجح ✓ — الرد: ${reply}` });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/settings/models — قائمة النماذج المجانية
router.get('/models', (req, res) => {
  res.json({ ok: true, models: FREE_MODELS });
});

// GET /api/settings/stats — إحصائيات
router.get('/stats', async (req, res) => {
  try {
    const { supabase } = require('./supabase');
    const [storiesRes, chaptersRes, logsRes] = await Promise.all([
      supabase.from('stories').select('id', { count: 'exact', head: true }),
      supabase.from('chapters').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('gen_log').select('id, type, status, duration_ms').order('created_at', { ascending: false }).limit(50),
    ]);
    const logs = logsRes.data || [];
    const avgMs = logs.length > 0
      ? Math.round(logs.reduce((s, l) => s + (l.duration_ms || 0), 0) / logs.length)
      : 0;
    res.json({
      ok: true,
      stats: {
        totalStories:  storiesRes.count  || 0,
        totalChapters: chaptersRes.count || 0,
        totalRequests: logs.length,
        successRate:   logs.length > 0 ? Math.round(logs.filter(l => l.status === 'success').length / logs.length * 100) : 0,
        avgResponseMs: avgMs,
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
