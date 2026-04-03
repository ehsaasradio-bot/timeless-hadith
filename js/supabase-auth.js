/* ─────────────────────────────────────────────────────────────────
   Timeless Hadith — Supabase Auth
   Replaces Google Identity Services (GIS) with Supabase Auth.

   Load order in HTML:
     <script src="js/supabase-data.js"></script>
     <script src="js/app.js"></script>
     <script src="js/supabase-auth.js"></script>   ← this file

   What this does:
   • On page load: restores an existing Supabase session, OR
     detects an OAuth callback in the URL hash and saves the session
   • Patches TH_AUTH.showLoginModal() to show Supabase-powered buttons
   • Patches TH_AUTH.logout() to also revoke the Supabase session
   • Exposes window.TH_SB_AUTH for use in the login modal
───────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Supabase config (anon key — public read-only) ── */
  var SB_URL  = 'https://dwcsledifvnyrunxejzd.supabase.co';
  var SB_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Y3NsZWRpZnZueXJ1bnhlanpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTgwNzgsImV4cCI6MjA5MDUzNDA3OH0.Aww8QcExJF1tPwMPvqP5q0_avc3YJclqsFJcXptlnZo';
  var SESSION_KEY = 'th_supabase_session';

  /* ─────────────────────────────────────────────────────────
     Session helpers
  ───────────────────────────────────────────────────────── */

  function _saveSession(s) {
    s.expires_at = Date.now() + (parseInt(s.expires_in, 10) || 3600) * 1000;
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) {}
  }

  function _loadSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (s.expires_at && Date.now() > s.expires_at) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return s;
    } catch (e) { return null; }
  }

  function _clearSession() {
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
  }

  /* ─────────────────────────────────────────────────────────
     Parse OAuth callback from URL hash
     Supabase returns: #access_token=...&refresh_token=...&...
  ───────────────────────────────────────────────────────── */

  function _parseHashCallback() {
    var hash = window.location.hash;
    if (!hash || hash.indexOf('access_token') === -1) return null;
    try {
      var params = new URLSearchParams(hash.slice(1));
      var token = params.get('access_token');
      if (!token) return null;
      return {
        access_token:  token,
        refresh_token: params.get('refresh_token') || '',
        expires_in:    params.get('expires_in')    || '3600',
        token_type:    params.get('token_type')    || 'bearer'
      };
    } catch (e) { return null; }
  }

  /* ─────────────────────────────────────────────────────────
     Fetch user from Supabase /auth/v1/user
  ───────────────────────────────────────────────────────── */

  function _fetchUser(accessToken) {
    return fetch(SB_URL + '/auth/v1/user', {
      headers: {
        'apikey':        SB_KEY,
        'Authorization': 'Bearer ' + accessToken
      }
    }).then(function (r) { return r.json(); })
      .catch(function () { return null; });
  }

  /* ─────────────────────────────────────────────────────────
     Map a Supabase user object → TH user format
  ───────────────────────────────────────────────────────── */

  function _toTHUser(sbUser) {
    if (!sbUser || sbUser.error) return null;
    var meta = sbUser.user_metadata || {};
    var idMeta = (sbUser.identities && sbUser.identities[0])
      ? (sbUser.identities[0].identity_data || {})
      : {};
    return {
      name:    meta.full_name || meta.name || idMeta.full_name || idMeta.name || sbUser.email || 'User',
      email:   sbUser.email   || meta.email || '',
      picture: meta.avatar_url || meta.picture || idMeta.avatar_url || idMeta.picture || '',
      sub:     sbUser.id || '',
      demo:    false,
      sbId:    sbUser.id || ''
    };
  }

  /* ─────────────────────────────────────────────────────────
     Apply a TH user — update TH_AUTH state + UI
  ───────────────────────────────────────────────────────── */

  function _applyUser(thUser) {
    if (!thUser) return;
    if (typeof TH_AUTH !== 'undefined' && typeof TH_AUTH.setUser === 'function') {
      TH_AUTH.setUser(thUser);
      TH_AUTH.updateAuthUI();
      document.dispatchEvent(new CustomEvent('th:login', { detail: thUser }));
    }
  }

  /* ─────────────────────────────────────────────────────────
     Public API: TH_SB_AUTH
  ───────────────────────────────────────────────────────── */

  window.TH_SB_AUTH = {

    /* Redirect to Supabase Google OAuth */
    signInWithGoogle: function () {
      var redirect = window.location.origin + window.location.pathname;
      window.location.href =
        SB_URL + '/auth/v1/authorize' +
        '?provider=google' +
        '&redirect_to=' + encodeURIComponent(redirect);
    },

    /* Send magic link to email */
    signInWithEmail: function (email) {
      var btn   = document.getElementById('sb-email-btn');
      var input = document.getElementById('sb-email-input');
      var msg   = document.getElementById('sb-email-msg');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      if (msg) { msg.textContent = ''; msg.className = 'sb-msg'; }

      return fetch(SB_URL + '/auth/v1/otp', {
        method:  'POST',
        headers: {
          'apikey':        SB_KEY,
          'Content-Type':  'application/json'
        },
        body: JSON.stringify({ email: email, create_user: true })
      }).then(function (r) {
        if (r.ok) {
          if (msg) { msg.textContent = 'Check your inbox — a magic link has been sent.'; msg.className = 'sb-msg sb-msg-ok'; }
          if (input) input.value = '';
        } else {
          if (msg) { msg.textContent = 'Could not send link. Check the email address.'; msg.className = 'sb-msg sb-msg-err'; }
        }
        if (btn) { btn.disabled = false; btn.textContent = 'Send magic link'; }
        return r.ok;
      }).catch(function () {
        if (msg) { msg.textContent = 'Network error — please try again.'; msg.className = 'sb-msg sb-msg-err'; }
        if (btn) { btn.disabled = false; btn.textContent = 'Send magic link'; }
        return false;
      });
    },

    /* Sign out: revoke Supabase session + clear TH_AUTH */
    signOut: function () {
      var s = _loadSession();
      if (s && s.access_token) {
        fetch(SB_URL + '/auth/v1/logout', {
          method:  'POST',
          headers: {
            'apikey':        SB_KEY,
            'Authorization': 'Bearer ' + s.access_token
          }
        }).catch(function () {});
      }
      _clearSession();
      if (typeof TH_AUTH !== 'undefined' && typeof TH_AUTH.logout === 'function') {
        TH_AUTH.logout();
      }
    },

    /* Get the stored session */
    getSession: _loadSession
  };

  /* ─────────────────────────────────────────────────────────
     Replace login modal content with Supabase UI
  ───────────────────────────────────────────────────────── */

  function _buildAuthButtons() {
    return [
      /* Google button */
      '<button class="sb-google-btn" onclick="TH_SB_AUTH.signInWithGoogle()" type="button">',
        '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">',
          '<path fill="#4285f4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>',
          '<path fill="#34a853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>',
          '<path fill="#fbbc05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>',
          '<path fill="#ea4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>',
        '</svg>',
        'Continue with Google',
      '</button>'
    ].join('');
  }

  function _injectAuthStyles() {
    if (document.getElementById('th-sb-auth-style')) return;
    var s = document.createElement('style');
    s.id = 'th-sb-auth-style';
    s.textContent = [
      '.sb-google-btn{display:flex;align-items:center;justify-content:center;gap:10px;',
        'width:100%;padding:10px 20px;border:1.5px solid #dadce0;border-radius:8px;',
        'background:#fff;cursor:pointer;font-size:14px;font-weight:500;color:#3c4043;',
        'font-family:inherit;transition:box-shadow .2s;}',
      '.sb-google-btn:hover{box-shadow:0 1px 4px rgba(0,0,0,.15);}',
      '.sb-divider{display:flex;align-items:center;gap:.75rem;margin:14px 0;',
        'color:#999;font-size:13px;}',
      '.sb-divider::before,.sb-divider::after{content:"";flex:1;height:1px;background:#e5e5e5;}',
      '.sb-email-wrap{display:flex;flex-direction:column;gap:8px;}',
      '.sb-email-wrap input{padding:10px 14px;border:1.5px solid #e5e5e5;border-radius:8px;',
        'font-size:14px;font-family:inherit;outline:none;transition:border-color .2s;}',
      '.sb-email-wrap input:focus{border-color:var(--accent,#0071e3);}',
      '.sb-email-btn{padding:10px 14px;border:none;border-radius:8px;',
        'background:var(--accent,#0071e3);color:#fff;cursor:pointer;font-size:14px;',
        'font-weight:500;font-family:inherit;transition:opacity .2s;}',
      '.sb-email-btn:disabled{opacity:.55;cursor:not-allowed;}',
      '.sb-msg{font-size:12px;margin:2px 0 0;min-height:16px;}',
      '.sb-msg-ok{color:#1a7f4b;}',
      '.sb-msg-err{color:#c0392b;}'
    ].join('');
    document.head.appendChild(s);
  }

  function _patchLoginModal() {
    /* TH_AUTH is declared with `const` in app.js so it is NOT on window —
       use typeof check instead of window.TH_AUTH */
    if (typeof TH_AUTH === 'undefined') return;

    _injectAuthStyles();

    /* Patch showLoginModal to inject Supabase buttons */
    var _origShow = TH_AUTH.showLoginModal.bind(TH_AUTH);
    TH_AUTH.showLoginModal = function (reason) {
      _origShow(reason);
      /* Replace the GIS wrap with Supabase buttons */
      setTimeout(function () {
        var wrap = document.getElementById('google-signin-btn-modal');
        if (wrap && !wrap.dataset.sb) {
          wrap.dataset.sb = '1';
          wrap.innerHTML = _buildAuthButtons();
        }
      }, 50);
    };

    /* Patch logout to also revoke Supabase session */
    var _origLogout = TH_AUTH.logout.bind(TH_AUTH);
    TH_AUTH.logout = function () {
      var s = _loadSession();
      if (s && s.access_token) {
        fetch(SB_URL + '/auth/v1/logout', {
          method:  'POST',
          headers: {
            'apikey':        SB_KEY,
            'Authorization': 'Bearer ' + s.access_token
          }
        }).catch(function () {});
      }
      _clearSession();
      _origLogout();
    };
  }

  /* ─────────────────────────────────────────────────────────
     Boot: restore session or handle OAuth callback
  ───────────────────────────────────────────────────────── */

  function _boot() {
    /* 1. Check for OAuth callback in URL hash */
    var hashSession = _parseHashCallback();
    if (hashSession) {
      _saveSession(hashSession);
      /* Clean the URL (remove hash tokens) */
      try {
        history.replaceState(
          null, '',
          window.location.pathname + window.location.search
        );
      } catch (e) {}

      _fetchUser(hashSession.access_token).then(function (sbUser) {
        var thUser = _toTHUser(sbUser);
        if (thUser) _applyUser(thUser);
      });
      return;
    }

    /* 2. Restore stored session */
    var stored = _loadSession();
    if (stored && stored.access_token) {
      _fetchUser(stored.access_token).then(function (sbUser) {
        var thUser = _toTHUser(sbUser);
        if (thUser) _applyUser(thUser);
      });
    }
  }

  /* ─────────────────────────────────────────────────────────
     Run
  ───────────────────────────────────────────────────────── */

  /* Patch the modal as soon as DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      _patchLoginModal();
      _boot();
    });
  } else {
    _patchLoginModal();
    _boot();
  }

})();
