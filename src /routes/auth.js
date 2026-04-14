// ============================================================
//  Master Story — routes/auth.js
// ============================================================
const express = require('express');
const router  = express.Router();

function getPassword() {
  return process.env.APP_PASSWORD || 'MasterStory2025';
}

// POST /auth/login
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ ok: false, error: 'أدخل كلمة المرور' });
  }
  if (password !== getPassword()) {
    return res.status(401).json({ ok: false, error: 'كلمة المرور غير صحيحة' });
  }
  req.session.authenticated = true;
  req.session.loginTime     = Date.now();
  res.json({ ok: true, redirect: '/dashboard.html' });
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// GET /auth/check
router.get('/check', (req, res) => {
  res.json({ authenticated: !!req.session.authenticated });
});

module.exports = router;
