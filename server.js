// ============================================================
//  Master Story — server.js
//  نقطة الدخول الرئيسية للتطبيق
// ============================================================
require('dotenv').config();

const express    = require('express');
const session    = require('express-session');
const path       = require('path');

const authRoutes     = require('./src/authRoute');
const storyRoutes    = require('./src/stories');
const chapterRoutes  = require('./src/chapters');
const generateRoutes = require('./src/generate');
const settingsRoutes = require('./src/settings');
const { requireAuth } = require('./src/authMiddleware');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── الـ Middleware الأساسية ───────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret:            process.env.SESSION_SECRET || 'master-story-secret-key-change-me',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    secure:   process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge:   8 * 60 * 60 * 1000, // 8 ساعات
  }
}));

// ── الملفات الثابتة ───────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── مسارات المصادقة (بدون حماية) ─────────────────────────────
app.use('/auth', authRoutes);

// ── مسارات API (محمية) ───────────────────────────────────────
app.use('/api/stories',    requireAuth, storyRoutes);
app.use('/api/chapters',   requireAuth, chapterRoutes);
app.use('/api/generate',   requireAuth, generateRoutes);
app.use('/api/settings',   requireAuth, settingsRoutes);

// ── صفحة تسجيل الدخول ────────────────────────────────────────
app.get('/', (req, res) => {
  if (req.session.authenticated) {
    return res.redirect('/dashboard.html');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── حماية صفحات HTML (ما عدا index) ──────────────────────────
const protectedPages = [
  'dashboard.html', 'wizard.html', 'story.html',
  'generate.html',  'library.html', 'settings.html'
];

protectedPages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    if (!req.session.authenticated) {
      return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', page));
  });
});

// ── معالجة الأخطاء ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ ok: false, error: 'خطأ داخلي في الخادم' });
});

// ── تشغيل السيرفر ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌙 Master Story يعمل على المنفذ ${PORT}`);
  console.log(`   http://localhost:${PORT}\n`);
});
