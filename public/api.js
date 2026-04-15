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
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (r.status === 401) { location.href = '/'; return null; }
    return r.json();
  },
  async put(url, data) {
    const r = await fetch(url, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
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

// ── مساعدات التاريخ ───────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'الآن';
  if (mins  < 60) return `منذ ${mins} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
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

function getParam(key) {
  return new URLSearchParams(location.search).get(key);
}

// ── تسجيل الخروج ─────────────────────────────────────────────

async function logout() {
  await API.post('/auth/logout', {});
  location.href = '/';
}

// ══════════════════════════════════════════════════════════════
//  نظام التصنيفات المتعددة
// ══════════════════════════════════════════════════════════════

const GENRE_CATEGORIES = [
  {
    id: 'main', label: '🌌 التصنيف الأساسي', tags: [
      { id: 'زراعة',     icon: '🌱', label: 'زراعة (Cultivation)' },
      { id: 'ووشيا',     icon: '⚔️', label: 'ووشيا (Wuxia)' },
      { id: 'شيانشيا',   icon: '✨', label: 'شيانشيا (Xianxia)' },
      { id: 'شوانهوان',  icon: '🌀', label: 'شوانهوان (Xuanhuan)' },
      { id: 'فانتازيا',  icon: '🌙', label: 'فانتازيا' },
      { id: 'خيال_علمي', icon: '🚀', label: 'خيال علمي' },
      { id: 'تشويق_غموض',icon: '🔍', label: 'تشويق وغموض' },
      { id: 'رومانسي',   icon: '🌹', label: 'رومانسي' },
      { id: 'رعب',       icon: '👁',  label: 'رعب' },
      { id: 'مغامرة',    icon: '🗺️', label: 'مغامرة' },
      { id: 'تاريخي',    icon: '📜', label: 'تاريخي' },
      { id: 'بوليسي',    icon: '🎭', label: 'بوليسي' },
    ]
  },
  {
    id: 'power', label: '⚡ نظام القوة', tags: [
      { id: 'نظام_تشي',    icon: '💨', label: 'تشي (Qi Cultivation)' },
      { id: 'تنقية_جسد',   icon: '💪', label: 'تنقية الجسد (Body Refinement)' },
      { id: 'زراعة_روح',   icon: '👻', label: 'زراعة الروح (Soul)' },
      { id: 'زراعة_دم',    icon: '🩸', label: 'زراعة الدم (Bloodline)' },
      { id: 'نظام',         icon: '💻', label: 'نظام (System)' },
      { id: 'حظ_قدر',      icon: '🎲', label: 'حظ وقدر (Luck / Fate)' },
      { id: 'سلالة_وحوش',  icon: '🐉', label: 'سلالة / دم تنين' },
    ]
  },
  {
    id: 'tropes', label: '🧬 الأنماط الشهيرة', tags: [
      { id: 'إعادة_ولادة',  icon: '♻️', label: 'إعادة الولادة (Reincarnation)' },
      { id: 'رجوع_زمن',    icon: '⏰', label: 'رجوع بالزمن (Regression)' },
      { id: 'انتقال_عالم',  icon: '🌐', label: 'انتقال لعالم آخر (Isekai)' },
      { id: 'بطل_مخفي',    icon: '🥷', label: 'بطل مخفي القوة (Hidden OP)' },
      { id: 'عبقري',        icon: '🧠', label: 'عبقري / ذكاء خارق' },
      { id: 'بطل_شرير',    icon: '😈', label: 'بطل شرير (Villain)' },
      { id: 'انتقام',       icon: '🔥', label: 'انتقام (Revenge)' },
    ]
  },
  {
    id: 'world', label: '🏯 بيئة العالم', tags: [
      { id: 'أكاديمية',     icon: '🏫', label: 'أكاديمية (Academy)' },
      { id: 'طوائف',        icon: '⛩️', label: 'طوائف (Sects / Clans)' },
      { id: 'ممالك',        icon: '👑', label: 'ممالك / إمبراطوريات' },
      { id: 'عوالم_متعددة', icon: '🌌', label: 'عوالم متعددة (Upper Realms)' },
    ]
  },
  {
    id: 'mood', label: '🧩 الجو العام', tags: [
      { id: 'حريم',         icon: '💕', label: 'حريم (Harem)' },
      { id: 'كوميدي',       icon: '😄', label: 'كوميدي' },
      { id: 'مظلم',         icon: '🌑', label: 'مظلم (Dark / Tragedy)' },
      { id: 'إثارة',        icon: '⚡', label: 'إثارة' },
      { id: 'نفسي',         icon: '🧩', label: 'نفسي' },
      { id: 'حياة_يومية',   icon: '☕', label: 'حياة يومية (Slice of Life)' },
      { id: 'نظام_ألعاب',   icon: '🎮', label: 'نظام ألعاب (RPG / Game-like)' },
    ]
  },
  {
    id: 'creatures', label: '🐉 المخلوقات والعناصر', tags: [
      { id: 'وحوش_روحية',  icon: '🦁', label: 'وحوش روحية (Spirit Beasts)' },
      { id: 'أشباح_شياطين',icon: '👹', label: 'أشباح / شياطين' },
      { id: 'آلهة_خالدين',  icon: '⭐', label: 'آلهة / خالدين' },
      { id: 'أسلحة_أسطورية',icon: '🗡️', label: 'أسلحة أسطورية' },
    ]
  },
];

// خريطة سريعة icon لكل id
const GENRE_ICONS = {};
GENRE_CATEGORIES.forEach(cat => cat.tags.forEach(t => { GENRE_ICONS[t.id] = t.icon; }));

// تحويل genre من DB (string أو JSON array) لمصفوفة
function parseGenres(genre) {
  if (!genre) return [];
  if (Array.isArray(genre)) return genre;
  try { const p = JSON.parse(genre); if (Array.isArray(p)) return p; } catch(_) {}
  // comma-separated (قديم)
  return genre.split(',').map(s => s.trim()).filter(Boolean);
}

// عرض badges للتصنيفات
function renderGenreBadges(genre) {
  const tags = parseGenres(genre);
  if (!tags.length) return '<span class="badge badge-genre">—</span>';
  return tags.map(t => {
    const icon = GENRE_ICONS[t] || '📚';
    const label = GENRE_CATEGORIES.flatMap(c => c.tags).find(x => x.id === t)?.label || t;
    return `<span class="badge badge-genre">${icon} ${label}</span>`;
  }).join('');
}

// ── بناء محدد التصنيفات (لـ wizard) ──────────────────────────

function buildGenrePicker(containerId, selectedIds = []) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = GENRE_CATEGORIES.map(cat => `
    <div class="genre-group" id="grp-${cat.id}">
      <button type="button" class="genre-group-header" onclick="toggleGenreGroup('${cat.id}')">
        <span>${cat.label}</span>
        <span class="genre-group-arrow" id="arr-${cat.id}">▾</span>
      </button>
      <div class="genre-group-body" id="gbody-${cat.id}">
        <div class="genre-tags-grid">
          ${cat.tags.map(t => `
            <button type="button"
              class="genre-tag ${selectedIds.includes(t.id) ? 'selected' : ''}"
              data-id="${t.id}"
              onclick="toggleGenreTag(this)">
              <span class="genre-tag-icon">${t.icon}</span>
              <span class="genre-tag-label">${t.label}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

function toggleGenreGroup(id) {
  const body = document.getElementById(`gbody-${id}`);
  const arr  = document.getElementById(`arr-${id}`);
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  arr.textContent    = open ? '▸' : '▾';
}

function toggleGenreTag(el) {
  el.classList.toggle('selected');
  updateGenrePreview();
}

function getSelectedGenres() {
  return Array.from(document.querySelectorAll('.genre-tag.selected'))
    .map(el => el.dataset.id);
}

function updateGenrePreview() {
  const sel = getSelectedGenres();
  const preview = document.getElementById('genre-preview');
  if (!preview) return;
  if (!sel.length) {
    preview.innerHTML = '<span style="color:var(--text3);font-size:.82rem">لم تختر تصنيفاً بعد</span>';
    return;
  }
  preview.innerHTML = sel.map(id => {
    const icon = GENRE_ICONS[id] || '📚';
    return `<span class="badge badge-genre">${icon} ${id.replace(/_/g,' ')}</span>`;
  }).join('');
}

// ── بناء شريط التنقل ─────────────────────────────────────────

function buildNavbar(active = '') {
  const pages = [
    { href: '/dashboard.html', label: 'قصصي',      icon: '📚' },
    { href: '/library.html',   label: 'المكتبة',   icon: '📖' },
    { href: '/settings.html',  label: 'الإعدادات', icon: '⚙'  },
  ];
  return `
<nav class="navbar">
  <a href="/dashboard.html" class="navbar-brand">
    <span class="logo-icon">🌙</span>
    <span>Master Story</span>
  </a>
  <button class="navbar-toggle" id="navbar-toggle" onclick="toggleNavMenu()" aria-label="القائمة">
    <span></span><span></span><span></span>
  </button>
  <ul class="navbar-nav" id="navbar-nav">
    ${pages.map(p => `
      <li><a href="${p.href}" ${active === p.label ? 'class="active"' : ''}>
        <span class="nav-icon">${p.icon}</span>${p.label}
      </a></li>
    `).join('')}
    <li class="nav-logout-mobile">
      <button class="btn-logout-mobile" onclick="logout()">خروج</button>
    </li>
  </ul>
  <button class="btn-logout" onclick="logout()">خروج</button>
</nav>`;
}

function toggleNavMenu() {
  const nav = document.getElementById('navbar-nav');
  const btn = document.getElementById('navbar-toggle');
  nav.classList.toggle('open');
  btn.classList.toggle('open');
}

// إغلاق القائمة عند الضغط خارجها
document.addEventListener('click', e => {
  const nav = document.getElementById('navbar-nav');
  const btn = document.getElementById('navbar-toggle');
  if (nav && btn && !nav.contains(e.target) && !btn.contains(e.target)) {
    nav.classList.remove('open');
    btn.classList.remove('open');
  }
});
