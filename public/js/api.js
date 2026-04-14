/* ============================================================
   Master Story — api.js
   مساعدات API والوظائف المشتركة
   ============================================================ */

// ── طلبات الـ API ─────────────────────────────────────────────

const API = {
  async get(url) {
    const r = await fetch(url);
    if (r.status === 401) { location.href = '/'; return null; }
    return r.json();
  },

  async post(url, data) {
    const r = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    });
    if (r.status === 401) { location.href = '/'; return null; }
    return r.json();
  },

  async put(url, data) {
    const r = await fetch(url, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    });
    if (r.status === 401) { location.href = '/'; return null; }
    return r.json();
  },

  async del(url) {
    const r = await fetch(url, { method: 'DELETE' });
    if (r.status === 401) { location.href = '/'; return null; }
    return r.json();
  },
};

// ── Toast إشعارات ─────────────────────────────────────────────

function toast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✓', error: '✕', info: 'ℹ', warn: '⚠' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type] || '•'}</span><span>${message}</span>`;
  container.appendChild(t);

  setTimeout(() => {
    t.style.animation = 'slideIn .3s ease reverse';
    setTimeout(() => t.remove(), 300);
  }, duration);
}

// ── مؤشر التحميل ─────────────────────────────────────────────

function showLoading(message = 'جارٍ التحميل...') {
  let el = document.getElementById('loading-overlay');
  if (!el) {
    el = document.createElement('div');
    el.className = 'loading-overlay';
    el.id = 'loading-overlay';
    document.body.appendChild(el);
  }
  el.innerHTML = `<div class="spinner"></div><p>${message}</p>`;
  el.style.display = 'flex';
}

function hideLoading() {
  const el = document.getElementById('loading-overlay');
  if (el) el.style.display = 'none';
}

// ── مساعدات التاريخ ───────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return 'الآن';
  if (mins  < 60)  return `منذ ${mins} دقيقة`;
  if (hours < 24)  return `منذ ${hours} ساعة`;
  return `منذ ${days} يوم`;
}

// ── مساعدات النص ─────────────────────────────────────────────

function wordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function truncate(text, maxLen = 120) {
  if (!text || text.length <= maxLen) return text || '';
  return text.slice(0, maxLen).trim() + '…';
}

// ── الـ URL Params ────────────────────────────────────────────

function getParam(key) {
  return new URLSearchParams(location.search).get(key);
}

// ── شريط التنقل المحدث ────────────────────────────────────────

function markActiveNav() {
  const path = location.pathname;
  document.querySelectorAll('.navbar-nav a').forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}

// ── تسجيل الخروج ─────────────────────────────────────────────

async function logout() {
  await API.post('/auth/logout', {});
  location.href = '/';
}

// ── قائمة الأنواع الأدبية ─────────────────────────────────────

const GENRES = [
  'فانتازيا', 'خيال_علمي', 'تشويق_غموض', 'رومانسي',
  'رعب', 'مغامرة', 'تاريخي', 'واقعي', 'بوليسي', 'إثارة_حرب',
];

const GENRE_ICONS = {
  'فانتازيا': '🌙', 'خيال_علمي': '🚀', 'تشويق_غموض': '🔍',
  'رومانسي': '🌹', 'رعب': '👁', 'مغامرة': '⚔',
  'تاريخي': '📜', 'واقعي': '🏙', 'بوليسي': '🎭', 'إثارة_حرب': '🔥',
};

// ── بناء شريط التنقل ─────────────────────────────────────────

function buildNavbar(active = '') {
  const pages = [
    { href: '/dashboard.html', label: 'قصصي', icon: '📚' },
    { href: '/library.html',   label: 'المكتبة', icon: '📖' },
    { href: '/settings.html',  label: 'الإعدادات', icon: '⚙' },
  ];

  return `
<nav class="navbar">
  <a href="/dashboard.html" class="navbar-brand">
    <span class="logo-icon">🌙</span>
    <span>Master Story</span>
  </a>
  <ul class="navbar-nav">
    ${pages.map(p => `
      <li><a href="${p.href}" ${active === p.label ? 'class="active"' : ''}>
        <span class="nav-icon">${p.icon}</span>${p.label}
      </a></li>
    `).join('')}
  </ul>
  <button class="btn-logout" onclick="logout()">خروج</button>
</nav>`;
}

// تشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  markActiveNav();
});
