// ============================================================
//  Master Story — middleware/auth.js
// ============================================================

function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  if (req.xhr || req.headers.accept?.includes('application/json') ||
      req.path.startsWith('/api/')) {
    return res.status(401).json({ ok: false, error: 'غير مصرح. سجّل دخولك أولاً.' });
  }
  res.redirect('/');
}

module.exports = { requireAuth };
