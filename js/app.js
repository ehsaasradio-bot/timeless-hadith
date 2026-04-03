/**
 * Timeless Hadith — app.js
 * Shared application logic: Auth · Bookmarks · Share as Image · Theme
 * ─────────────────────────────────────────────────────────────────────
 * Depends on: js/supabase-data.js  (TH object must be loaded first)
 * Usage: <script src="js/supabase-data.js"></script>
 *        <script src="js/app.js"></script>
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════════ */

const APP_KEY = {
  THEME:    'th_theme',
  CONSENT:  'th_cookie_consent',
  CONSENT_DATE: 'th_cookie_consent_date',
  USER:     'th_user',
  BOOKMARKS:'th_bookmarks',
};

// Replace with your real Google Cloud OAuth client ID
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

/* ═══════════════════════════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════════════════════════ */

const TH_THEME = (() => {
  function get() {
    // Always default to light; only honour an explicit saved preference
    return localStorage.getItem(APP_KEY.THEME) || 'light';
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(APP_KEY.THEME, theme);
    // SVG toggles handle their own state via CSS; no emoji fallback needed
  }

  function toggle() {
    apply(get() === 'dark' ? 'light' : 'dark');
  }

  function init() {
    apply(get());
  }

  return { get, apply, toggle, init };
})();

/* ═══════════════════════════════════════════════════════════════════
   AUTH  (Google Identity Services + demo fallback)
═══════════════════════════════════════════════════════════════════ */

const TH_AUTH = (() => {
  /* ── State ── */
  let _user = null;

  function getUser() {
    if (_user) return _user;
    try {
      const raw = localStorage.getItem(APP_KEY.USER);
      _user = raw ? JSON.parse(raw) : null;
    } catch (_) {
      _user = null;
    }
    return _user;
  }

  function setUser(userObj) {
    _user = userObj;
    localStorage.setItem(APP_KEY.USER, JSON.stringify(userObj));
  }

  function logout() {
    _user = null;
    localStorage.removeItem(APP_KEY.USER);
    // Revoke Google session if GIS is loaded
    if (window.google && window.google.accounts) {
      try { google.accounts.id.disableAutoSelect(); } catch (_) {}
    }
    updateAuthUI();
    // Dispatch event so pages can react
    document.dispatchEvent(new CustomEvent('th:logout'));
  }

  /* ── Google Identity Services callback ── */
  function handleGoogleCredential(response) {
    try {
      // Decode JWT payload (base64url)
      const [, payload] = response.credential.split('.');
      const data = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      setUser({
        name:    data.name    || 'User',
        email:   data.email   || '',
        picture: data.picture || '',
        sub:     data.sub     || '',
        demo:    false,
      });
      closeLoginModal();
      updateAuthUI();
      document.dispatchEvent(new CustomEvent('th:login', { detail: getUser() }));
    } catch (err) {
      console.error('Google credential parse error:', err);
    }
  }

  /* ── Demo login (no Google Cloud project needed) ── */
  function demoLogin() {
    setUser({
      name:    'Demo User',
      email:   'demo@timelesshadith.com',
      picture: '',
      sub:     'demo',
      demo:    true,
    });
    closeLoginModal();
    updateAuthUI();
    document.dispatchEvent(new CustomEvent('th:login', { detail: getUser() }));
  }

  /* ── Update nav UI after login / logout ── */
  function updateAuthUI() {
    const user = getUser();
    const btnLogin  = document.getElementById('btn-login');
    const btnLogout = document.getElementById('btn-logout');
    const avatarWrap= document.getElementById('nav-avatar-wrap');
    const avatarImg = document.getElementById('nav-avatar-img');
    const avatarInitial = document.getElementById('nav-avatar-initial');

    if (user) {
      // Hide sign-in button, show avatar
      if (btnLogin)  btnLogin.style.display  = 'none';
      if (btnLogout) btnLogout.style.display = 'inline-flex';
      if (avatarWrap) avatarWrap.style.display = 'flex';

      if (avatarImg) {
        if (user.picture) {
          avatarImg.src = user.picture;
          avatarImg.style.display = 'block';
          if (avatarInitial) avatarInitial.style.display = 'none';
        } else {
          avatarImg.style.display = 'none';
          if (avatarInitial) {
            avatarInitial.style.display = 'flex';
            avatarInitial.textContent = user.name.charAt(0).toUpperCase();
          }
        }
      }
    } else {
      // Show sign-in button, hide avatar
      if (btnLogin)  btnLogin.style.display  = 'inline-flex';
      if (btnLogout) btnLogout.style.display = 'none';
      if (avatarWrap) avatarWrap.style.display = 'none';
    }
  }

  /* ── Login Modal ── */
  function showLoginModal(reason) {
    const modal = document.getElementById('login-modal');
    if (!modal) {
      _createLoginModal();
      return showLoginModal(reason);
    }
    const msg = modal.querySelector('.login-modal-reason');
    if (msg) msg.textContent = reason || 'Sign in to continue.';
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    // Init GIS button inside modal if not already done
    _initGISButton('google-signin-btn-modal');
  }

  function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  function _createLoginModal() {
    const el = document.createElement('div');
    el.id = 'login-modal';
    el.className = 'th-modal-overlay';
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Sign in');
    el.innerHTML = `
      <div class="th-modal-box login-modal-box" role="document">
        <button class="th-modal-close" aria-label="Close" onclick="TH_AUTH.closeLoginModal()"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        <div class="login-modal-logo">
          <img src="timelesshadith-logo.png" alt="Timeless Hadith" class="login-modal-logo-img" onerror="this.style.display='none'" />
        </div>
        <h2 class="login-modal-title">Sign in to Timeless Hadith</h2>
        <div id="google-signin-btn-modal" class="gis-btn-wrap"></div>
      </div>`;
    // Close on backdrop click
    el.addEventListener('click', e => { if (e.target === el) closeLoginModal(); });
    document.body.appendChild(el);
    _injectLoginModalStyles();
    _initGISButton('google-signin-btn-modal');
  }

  function _initGISButton(containerId) {
    if (!window.google || !window.google.accounts) return;
    const container = document.getElementById(containerId);
    if (!container || container.dataset.init) return;
    container.dataset.init = '1';
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback:  handleGoogleCredential,
    });
    google.accounts.id.renderButton(container, {
      theme: 'outline',
      size:  'large',
      width: 280,
      text:  'signin_with',
    });
  }

  function _injectLoginModalStyles() {
    if (document.getElementById('th-login-modal-style')) return;
    const s = document.createElement('style');
    s.id = 'th-login-modal-style';
    s.textContent = `
      .th-modal-overlay {
        position: fixed; inset: 0; z-index: 9000;
        background: rgba(0,0,0,.55);
        backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center;
        padding: 1rem;
      }
      .th-modal-box {
        background: var(--bg-card, #fff);
        border: 1px solid var(--border, rgba(0,0,0,.1));
        border-radius: 20px;
        padding: 2.5rem 2rem;
        width: 100%; max-width: 380px;
        position: relative;
        box-shadow: 0 32px 64px rgba(0,0,0,.22);
        animation: modalSlideIn .28s cubic-bezier(.34,1.56,.64,1) both;
      }
      @keyframes modalSlideIn {
        from { opacity:0; transform: scale(.88) translateY(20px); }
        to   { opacity:1; transform: scale(1)  translateY(0); }
      }
      .th-modal-close {
        position: absolute; top: 1rem; right: 1rem;
        background: none; border: none; font-size: 1.1rem;
        cursor: pointer; color: var(--text-secondary, #666);
        width: 32px; height: 32px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        transition: background .2s;
      }
      .th-modal-close:hover { background: var(--hover-bg, rgba(0,0,0,.06)); }
      .login-modal-logo { text-align: center; margin-bottom: 1.25rem; }
      .login-modal-logo-img { height: 48px; width: auto; object-fit: contain; }
      .login-modal-title {
        font-size: 1.15rem; font-weight: 700; text-align: center;
        margin: 0 0 1.5rem; color: var(--text-primary, #1d1d1f);
      }
      .gis-btn-wrap { display: flex; justify-content: center; }
    `;
    document.head.appendChild(s);
  }

  /* ── Init: restore session on page load ── */
  function init() {
    updateAuthUI();
    // One-tap sign-in (only if no active user and GIS loaded)
    window.addEventListener('load', () => {
      if (!getUser() && window.google && window.google.accounts
          && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback:  handleGoogleCredential,
          auto_select: false,
        });
        // Init inline nav button if present
        _initGISButton('google-signin-btn-nav');
      }
    });
    // Escape key closes login modal
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeLoginModal();
    });
  }

  return {
    getUser, setUser, logout, demoLogin,
    handleGoogleCredential,
    updateAuthUI,
    showLoginModal, closeLoginModal,
    init,
  };
})();

/* ═══════════════════════════════════════════════════════════════════
   BOOKMARKS
═══════════════════════════════════════════════════════════════════ */

const TH_BOOKMARKS = (() => {
  function getAll() {
    try {
      return JSON.parse(localStorage.getItem(APP_KEY.BOOKMARKS) || '[]');
    } catch (_) { return []; }
  }

  function saveAll(arr) {
    localStorage.setItem(APP_KEY.BOOKMARKS, JSON.stringify(arr));
  }

  function has(id) {
    return getAll().includes(id);
  }

  function add(id) {
    const list = getAll();
    if (!list.includes(id)) { list.push(id); saveAll(list); }
  }

  function remove(id) {
    saveAll(getAll().filter(x => x !== id));
  }

  /**
   * Toggle bookmark for a hadith.
   * @param {string}      id  — hadith id  (e.g. "fb-001")
   * @param {HTMLElement} btn — the bookmark button element
   */
  function toggle(id, btn) {
    // Require login
    if (!TH_AUTH.getUser()) {
      TH_AUTH.showLoginModal('Sign in to save hadiths to your bookmarks.');
      return;
    }
    const saved = has(id);
    if (saved) {
      remove(id);
    } else {
      add(id);
    }
    updateBtnState(btn, !saved);
    // Micro-animation: scale bounce
    btn.classList.remove('bm-bounce');
    void btn.offsetWidth; // reflow
    btn.classList.add('bm-bounce');
    btn.addEventListener('animationend', () => btn.classList.remove('bm-bounce'), { once: true });
    // Dispatch event
    document.dispatchEvent(new CustomEvent('th:bookmark', {
      detail: { id, saved: !saved }
    }));
  }

  function updateBtnState(btn, isSaved) {
    if (!btn) return;
    btn.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
    btn.setAttribute('aria-label', isSaved ? 'Remove bookmark' : 'Bookmark this hadith');
    btn.classList.toggle('bookmarked', isSaved);
    const icon = btn.querySelector('.bm-icon');
    // icon SVG fill is handled via CSS .bookmarked class
    // Visual fill
    btn.style.color = isSaved ? 'var(--accent, #0071e3)' : 'var(--text-secondary, #888)';
  }

  /** Sync all bookmark buttons on the page to current state */
  function syncPage() {
    document.querySelectorAll('[data-bookmark-id]').forEach(btn => {
      updateBtnState(btn, has(btn.dataset.bookmarkId));
    });
  }

  function init() {
    // Inject bounce keyframe once
    if (!document.getElementById('th-bm-style')) {
      const s = document.createElement('style');
      s.id = 'th-bm-style';
      s.textContent = `
        @keyframes bmBounce {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.45); }
          55%  { transform: scale(.85); }
          75%  { transform: scale(1.15); }
          90%  { transform: scale(.97); }
          100% { transform: scale(1); }
        }
        .bm-bounce { animation: bmBounce .55s cubic-bezier(.36,.07,.19,.97) both; }
        [data-bookmark-id] { cursor: pointer; }
      `;
      document.head.appendChild(s);
    }
    // Re-sync after login/logout
    document.addEventListener('th:login',  syncPage);
    document.addEventListener('th:logout', syncPage);
    syncPage();
    // Initial badge render + update on every bookmark change
    updateBadge();
    document.addEventListener('th:bookmark', updateBadge);
  }

  /** Update the nav bookmark count badge on all matching elements */
  function updateBadge() {
    const count = getAll().length;
    document.querySelectorAll('#nav-bm-badge, .bm-count-badge').forEach(el => {
      el.textContent = count > 0 ? (count > 99 ? '99+' : count) : '';
      el.dataset.count = count;
      el.setAttribute('aria-label', count + ' bookmarks');
    });
  }

  return { getAll, has, add, remove, toggle, updateBtnState, syncPage, updateBadge, init };
})();

/* ═══════════════════════════════════════════════════════════════════
   SHARE AS IMAGE  (Canvas 1080 × 1080)
═══════════════════════════════════════════════════════════════════ */

const TH_SHARE = (() => {
  const W = 1080, H = 1080;
  let _canvas = null;
  let _hadith = null;
  let _cat    = null;

  /* ── Canvas text wrap helper ── */
  function _wrapText(ctx, text, x, y, maxW, lineH) {
    const words = text.split(' ');
    let line = '';
    const lines = [];
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineH));
    return lines.length;
  }

  /* ── Draw Arabic text right-to-left ── */
  function _wrapArabic(ctx, text, x, y, maxW, lineH) {
    // Split on spaces; Canvas handles RTL naturally when direction is set
    const words = text.split(' ');
    let line = '';
    const lines = [];
    for (const word of words) {
      const test = line ? `${word} ${line}` : word;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineH));
    return lines.length;
  }

  /* ── Generate canvas and return as blob URL ── */
  async function generate(hadith, catTitle) {
    _hadith = hadith;
    _cat    = catTitle || '';

    const canvas = document.createElement('canvas');
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const isDark = TH_THEME.get() === 'dark';
    const BG    = isDark ? '#0d0d0f' : '#ffffff';
    const TEXT1 = isDark ? '#f5f5f7' : '#1d1d1f';
    const TEXT2 = isDark ? '#a1a1a6' : '#6e6e73';
    const ACCENT= '#0071e3';
    const PAD   = 80;
    const INNER = W - PAD * 2;

    // ── Background ──
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // Subtle gradient overlay
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, isDark ? 'rgba(0,113,227,.08)' : 'rgba(0,113,227,.04)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // ── Top accent line ──
    ctx.fillStyle = ACCENT;
    ctx.fillRect(0, 0, W, 5);

    let y = PAD + 20;

    // ── Logo / Brand ──
    ctx.fillStyle = ACCENT;
    ctx.font = 'bold 36px -apple-system, SF Pro Display, Helvetica Neue, sans-serif';
    ctx.textAlign = 'center';
    ctx.direction = 'ltr';
    ctx.fillText('Timeless Hadith', W / 2, y);
    y += 52;

    // ── Category badge ──
    if (_cat) {
      const badgeText = _cat.toUpperCase();
      ctx.font = '500 22px -apple-system, SF Pro Display, Helvetica Neue, sans-serif';
      ctx.fillStyle = TEXT2;
      ctx.fillText(badgeText, W / 2, y);
      y += 38;
    }

    // ── Divider ──
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, y);
    ctx.lineTo(W - PAD, y);
    ctx.stroke();
    y += 50;

    // ── Arabic text ──
    if (hadith.arabic) {
      ctx.direction = 'rtl';
      ctx.textAlign = 'center';
      ctx.fillStyle = TEXT1;
      ctx.font = '500 38px "Noto Naskh Arabic", serif';
      const arabicLines = _wrapArabic(ctx, hadith.arabic, W / 2, y, INNER, 62);
      y += arabicLines * 62 + 40;
      ctx.direction = 'ltr';
    }

    // ── Divider ──
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD + 60, y - 20);
    ctx.lineTo(W - PAD - 60, y - 20);
    ctx.stroke();

    // ── English translation ──
    ctx.textAlign = 'center';
    ctx.direction = 'ltr';
    ctx.fillStyle = TEXT1;
    ctx.font = '400 30px -apple-system, SF Pro Display, Georgia, serif';
    const engLines = _wrapText(ctx, `"${hadith.english}"`, W / 2, y, INNER, 48);
    y += engLines * 48 + 44;

    // ── Reference pill ──
    const refText = `${hadith.narrator || ''} · ${hadith.source || ''} ${hadith.number ? '#' + hadith.number : ''}`.trim().replace(/^·\s*/, '').replace(/\s*·\s*$/, '');
    ctx.font = '500 24px -apple-system, SF Pro Display, Helvetica Neue, sans-serif';
    const refW = ctx.measureText(refText).width + 48;
    const refX = (W - refW) / 2;
    const refY = y;
    const refH = 44;

    // Pill background
    ctx.fillStyle = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.05)';
    _roundRect(ctx, refX, refY, refW, refH, 22);
    ctx.fill();

    ctx.fillStyle = ACCENT;
    ctx.fillText(refText, W / 2, refY + 29);
    y += refH + 40;

    // ── Authenticity badge ──
    if (hadith.authenticity) {
      const auth = hadith.authenticity;
      const authColor = auth === 'Sahih' ? '#30d158' : auth === 'Hasan' ? '#ffd60a' : TEXT2;
      ctx.font = '500 22px -apple-system, SF Pro Display, Helvetica Neue, sans-serif';
      ctx.fillStyle = authColor;
      ctx.fillText(auth, W / 2, y);
      y += 36;
    }

    // ── Copyright footer ──
    const footerY = H - PAD;
    ctx.fillStyle = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)';
    ctx.fillRect(0, footerY - 32, W, 1);

    ctx.font = '400 20px -apple-system, SF Pro Display, Helvetica Neue, sans-serif';
    ctx.fillStyle = TEXT2;
    ctx.textAlign = 'center';
    ctx.fillText('ehsaasradio-bot.github.io/timeless-hadith', W / 2, footerY);

    _canvas = canvas;

    // Return blob URL for preview
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        resolve(URL.createObjectURL(blob));
      }, 'image/png');
    });
  }

  /* ── RoundRect polyfill ── */
  function _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  /* ── Download the generated image ── */
  function download() {
    if (!_canvas) return;
    const a = document.createElement('a');
    a.download = `hadith-${_hadith ? _hadith.id : 'share'}.png`;
    _canvas.toBlob(blob => {
      a.href = URL.createObjectURL(blob);
      a.click();
    }, 'image/png');
  }

  /* ── Share via Gmail: download + open compose ── */
  function shareViaGmail() {
    if (!_hadith) return;
    download();
    const subject = encodeURIComponent('A Hadith from Timeless Hadith');
    const body    = encodeURIComponent(
      `Assalamu Alaikum,\n\n"${_hadith.english}"\n\n— ${_hadith.narrator || ''}, ${_hadith.source || ''} ${_hadith.number ? '#' + _hadith.number : ''}\n\nVisit timelesshadith.com for more.`
    );
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
  }

  /* ── Share Modal ── */
  async function showModal(hadith, catTitle) {
    // Ensure modal exists
    let modal = document.getElementById('share-img-modal');
    if (!modal) { _createShareModal(); modal = document.getElementById('share-img-modal'); }

    const preview  = document.getElementById('share-img-preview');
    const loading  = document.getElementById('share-img-loading');
    const dlBtn    = document.getElementById('share-img-download');
    const gmailBtn = document.getElementById('share-img-gmail');

    if (loading) loading.style.display = 'flex';
    if (preview) preview.style.display = 'none';

    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const blobUrl = await generate(hadith, catTitle);

    if (loading) loading.style.display = 'none';
    if (preview) {
      preview.src = blobUrl;
      preview.style.display = 'block';
    }
    if (dlBtn) dlBtn.onclick = download;
    if (gmailBtn) gmailBtn.onclick = shareViaGmail;
  }

  function closeModal() {
    const modal = document.getElementById('share-img-modal');
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    // Free preview blob
    const preview = document.getElementById('share-img-preview');
    if (preview && preview.src.startsWith('blob:')) {
      URL.revokeObjectURL(preview.src);
      preview.src = '';
    }
  }

  function _createShareModal() {
    const el = document.createElement('div');
    el.id = 'share-img-modal';
    el.className = 'th-modal-overlay';
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Share as Image');
    el.innerHTML = `
      <div class="th-modal-box share-modal-box" role="document">
        <button class="th-modal-close" aria-label="Close" onclick="TH_SHARE.closeModal()"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        <h2 class="share-modal-title">Share as Image</h2>
        <div id="share-img-loading" class="share-modal-loading" aria-live="polite">
          <div class="share-spinner"></div>
          <span>Generating image…</span>
        </div>
        <div class="share-img-frame">
          <img id="share-img-preview" src="" alt="Hadith share preview" class="share-img-preview" />
        </div>
        <div class="share-modal-actions">
          <button id="share-img-download" class="share-btn share-btn-primary">
            Download PNG
          </button>
          <button id="share-img-gmail" class="share-btn share-btn-gmail">
            Share via Gmail
          </button>
        </div>
        <p class="share-modal-note">Image downloaded · Gmail compose opens in a new tab</p>
      </div>`;
    el.addEventListener('click', e => { if (e.target === el) closeModal(); });
    document.body.appendChild(el);
    _injectShareModalStyles();
  }

  function _injectShareModalStyles() {
    if (document.getElementById('th-share-style')) return;
    const s = document.createElement('style');
    s.id = 'th-share-style';
    s.textContent = `
      .share-modal-box {
        max-width: 520px; padding: 2rem 1.75rem;
        display: flex; flex-direction: column; align-items: center; gap: 1.25rem;
      }
      .share-modal-title {
        font-size: 1.15rem; font-weight: 700;
        color: var(--text-primary, #1d1d1f); margin: 0;
      }
      .share-modal-loading {
        display: flex; flex-direction: column; align-items: center; gap: .75rem;
        color: var(--text-secondary, #888); font-size: .9rem; padding: 2rem 0;
      }
      .share-spinner {
        width: 36px; height: 36px; border: 3px solid var(--border, #e5e5e5);
        border-top-color: var(--accent, #0071e3);
        border-radius: 50%; animation: spin .7s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .share-img-frame {
        width: 100%; border-radius: 12px; overflow: hidden;
        border: 1px solid var(--border, rgba(0,0,0,.1));
        box-shadow: 0 8px 32px rgba(0,0,0,.12);
      }
      .share-img-preview {
        width: 100%; display: block;
      }
      .share-modal-actions {
        display: flex; gap: .75rem; width: 100%; flex-wrap: wrap;
      }
      .share-btn {
        flex: 1; padding: .7rem 1rem; border-radius: 12px;
        font-size: .9rem; font-weight: 600; cursor: pointer;
        border: none; transition: transform .15s, box-shadow .15s;
      }
      .share-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,.15); }
      .share-btn:active { transform: translateY(0); }
      .share-btn-primary {
        background: var(--accent, #0071e3); color: #fff;
      }
      .share-btn-gmail {
        background: var(--bg-secondary, #f5f5f7);
        border: 1px solid var(--border, #e5e5e5);
        color: var(--text-primary, #1d1d1f);
      }
      .share-modal-note {
        font-size: .75rem; color: var(--text-secondary, #999); margin: 0; text-align: center;
      }
    `;
    document.head.appendChild(s);
  }

  return { generate, download, shareViaGmail, showModal, closeModal };
})();

/* ═══════════════════════════════════════════════════════════════════
   SHARE AS TEXT  (Web Share API + clipboard fallback)
═══════════════════════════════════════════════════════════════════ */

const TH_SHARE_TEXT = (() => {
  async function share(hadith, catTitle) {
    const text = [
      catTitle ? `${catTitle}` : '',
      hadith.arabic ? hadith.arabic : '',
      `"${hadith.english}"`,
      hadith.narrator  ? `— ${hadith.narrator}`  : '',
      hadith.source    ? hadith.source            : '',
      hadith.number    ? `Hadith #${hadith.number}` : '',
      '',
      'Read more at timelesshadith.com',
    ].filter(Boolean).join('\n');

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Timeless Hadith', text });
        return;
      } catch (_) { /* fall through */ }
    }
    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(text);
      _toast('Hadith copied to clipboard');
    } catch (_) {
      _toast('Could not copy — please copy manually');
    }
  }

  function _toast(msg) {
    const t = document.createElement('div');
    t.className = 'th-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('th-toast-show'));
    setTimeout(() => {
      t.classList.remove('th-toast-show');
      setTimeout(() => t.remove(), 400);
    }, 2800);

    if (!document.getElementById('th-toast-style')) {
      const s = document.createElement('style');
      s.id = 'th-toast-style';
      s.textContent = `
        .th-toast {
          position: fixed; bottom: 5rem; left: 50%; transform: translateX(-50%) translateY(12px);
          background: #1d1d1f; color: #fff; padding: .6rem 1.25rem;
          border-radius: 100px; font-size: .875rem; font-weight: 500;
          opacity: 0; transition: opacity .3s, transform .3s;
          z-index: 9999; white-space: nowrap; pointer-events: none;
          box-shadow: 0 4px 16px rgba(0,0,0,.25);
        }
        .th-toast-show { opacity: 1; transform: translateX(-50%) translateY(0); }
      `;
      document.head.appendChild(s);
    }
  }

  return { share };
})();

/* ═══════════════════════════════════════════════════════════════════
   COOKIE CONSENT  (PDPL)
═══════════════════════════════════════════════════════════════════ */

const TH_COOKIE = (() => {
  function hasConsent() {
    return !!localStorage.getItem(APP_KEY.CONSENT);
  }

  function accept() {
    localStorage.setItem(APP_KEY.CONSENT, 'accepted');
    localStorage.setItem(APP_KEY.CONSENT_DATE, new Date().toISOString());
    _hide();
  }

  function decline() {
    localStorage.setItem(APP_KEY.CONSENT, 'declined');
    localStorage.setItem(APP_KEY.CONSENT_DATE, new Date().toISOString());
    _hide();
  }

  function _hide() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.style.transform = 'translateY(calc(100% + 2rem))';
      banner.style.opacity   = '0';
      setTimeout(() => banner.remove(), 500);
    }
  }

  function init() {
    if (hasConsent()) return;
    setTimeout(() => {
      const banner = document.getElementById('cookie-banner');
      if (banner) {
        banner.style.transform = 'translateY(0)';
        banner.style.opacity   = '1';
      }
    }, 1500);
  }

  return { hasConsent, accept, decline, init };
})();

/* ═══════════════════════════════════════════════════════════════════
   LIKES (localStorage-based heart/like count per hadith)
═══════════════════════════════════════════════════════════════════ */

const TH_LIKES = (() => {
  const STORE_KEY = 'th_likes';

  function _getAll() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch(e) { return {}; }
  }
  function _save(obj) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(obj)); } catch(e) {}
  }

  function isLiked(id) {
    return !!_getAll()[id];
  }

  function getCount(id) {
    /* Simulate a "total likes" count: user's like + a seed based on id hash */
    const seed = _hashCode(id) % 47 + 3;  // 3–49 base likes
    return seed + (_getAll()[id] ? 1 : 0);
  }

  function toggle(id, btnEl) {
    const all = _getAll();
    if (all[id]) {
      delete all[id];
    } else {
      all[id] = Date.now();
    }
    _save(all);
    /* Update this button's UI */
    if (btnEl) _updateBtn(btnEl, id);
    /* Also update any other like buttons for same id on page */
    document.querySelectorAll('[data-like-id="' + id + '"]').forEach(el => {
      if (el !== btnEl) _updateBtn(el, id);
    });
  }

  function _updateBtn(btn, id) {
    const liked = isLiked(id);
    const count = getCount(id);
    btn.classList.toggle('liked', liked);
    btn.setAttribute('aria-pressed', liked);
    const countEl = btn.querySelector('.like-count');
    if (countEl) countEl.textContent = count;
    const svg = btn.querySelector('svg');
    if (svg) svg.setAttribute('fill', liked ? 'currentColor' : 'none');
  }

  function syncPage() {
    document.querySelectorAll('[data-like-id]').forEach(btn => {
      const id = btn.dataset.likeId;
      _updateBtn(btn, id);
    });
  }

  /* Simple string hash for deterministic seed */
  function _hashCode(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  return { isLiked, getCount, toggle, syncPage };
})();

/* ═══════════════════════════════════════════════════════════════════
   CARD MICRO-INTERACTIONS
═══════════════════════════════════════════════════════════════════ */

const TH_INTERACTIONS = (() => {
  function initCards(selector) {
    document.querySelectorAll(selector || '.hadith-card, .category-card').forEach(card => {
      // Click scale
      card.addEventListener('mousedown', () => {
        card.style.transform = 'scale(.97)';
      });
      card.addEventListener('mouseup', () => {
        card.style.transform = '';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  return { initCards };
})();

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL INIT
═══════════════════════════════════════════════════════════════════ */

(function init() {
  // Theme must be first to avoid flash
  TH_THEME.init();

  document.addEventListener('DOMContentLoaded', () => {
    TH_AUTH.init();
    TH_BOOKMARKS.init();
    TH_COOKIE.init();
    TH_INTERACTIONS.initCards();
    TH_LIKES.syncPage();
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL CONVENIENCE  (called from inline HTML onclick)
═══════════════════════════════════════════════════════════════════ */

// Google GIS global callback
window.handleGoogleCredential = TH_AUTH.handleGoogleCredential.bind(TH_AUTH);
