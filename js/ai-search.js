/* ─────────────────────────────────────────────────────────────────
   Timeless Hadith — AI Search  (frontend)

   Injects the AI-Ask section into the page.
   Depends on: nothing (standalone IIFE)
   Calls:      POST /api/ai-search  { query: "..." }
   Returns:    { answer: "...", hadiths: [{id,english,narrator,source,chapter}] }
───────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Styles ── */
  function _injectStyles() {
    if (document.getElementById('th-ai-style')) return;
    var s = document.createElement('style');
    s.id = 'th-ai-style';
    s.textContent = [

      /* Section wrapper */
      '.ai-section{',
        'max-width:760px;margin:0 auto 0;padding:0 24px;',
      '}',

      /* Header label */
      '.ai-section .section-label{',
        'text-align:center;margin-bottom:20px;',
      '}',

      /* Ask box */
      '.ai-box{',
        'background:var(--surface);',
        'border:1.5px solid var(--border);',
        'border-radius:20px;',
        'padding:20px 24px;',
        'transition:border-color .2s,box-shadow .2s;',
      '}',
      '.ai-box:focus-within{',
        'border-color:var(--accent);',
        'box-shadow:0 0 0 3px rgba(0,113,227,.12);',
      '}',
      '[data-theme="dark"] .ai-box:focus-within{',
        'box-shadow:0 0 0 3px rgba(41,151,255,.16);',
      '}',

      /* Input row */
      '.ai-input-row{',
        'display:flex;gap:10px;align-items:flex-end;',
      '}',
      '.ai-input{',
        'flex:1;',
        'border:none;background:transparent;',
        'font-family:inherit;font-size:15px;',
        'color:var(--ink);line-height:1.5;',
        'resize:none;outline:none;',
        'min-height:24px;max-height:120px;',
        'overflow-y:auto;',
      '}',
      '.ai-input::placeholder{color:var(--muted);}',
      '.ai-send-btn{',
        'flex-shrink:0;',
        'display:flex;align-items:center;justify-content:center;',
        'width:36px;height:36px;',
        'background:var(--accent);',
        'border:none;border-radius:50%;cursor:pointer;',
        'transition:opacity .2s,transform .15s;',
      '}',
      '.ai-send-btn:hover{opacity:.8;}',
      '.ai-send-btn:active{transform:scale(.93);}',
      '.ai-send-btn:disabled{opacity:.4;cursor:not-allowed;}',
      '.ai-send-btn svg{stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}',

      /* Hint */
      '.ai-hint{',
        'font-size:12px;color:var(--muted);',
        'margin-top:10px;',
        'display:flex;align-items:center;gap:6px;',
      '}',
      '.ai-hint svg{flex-shrink:0;}',

      /* Answer area */
      '.ai-answer{',
        'margin-top:18px;',
        'display:none;',
      '}',
      '.ai-answer.visible{display:block;}',

      /* Loading dots */
      '.ai-loading{',
        'display:flex;gap:5px;align-items:center;',
        'padding:4px 0;',
      '}',
      '.ai-loading span{',
        'width:6px;height:6px;border-radius:50%;',
        'background:var(--accent);',
        'animation:ai-pulse 1.1s ease-in-out infinite;',
      '}',
      '.ai-loading span:nth-child(2){animation-delay:.18s;}',
      '.ai-loading span:nth-child(3){animation-delay:.36s;}',
      '@keyframes ai-pulse{',
        '0%,80%,100%{opacity:.25;transform:scale(.8);}',
        '40%{opacity:1;transform:scale(1);}',
      '}',

      /* Answer text */
      '.ai-answer-text{',
        'font-size:15px;line-height:1.65;color:var(--ink);',
        'padding:2px 0 14px;',
      '}',

      /* Error */
      '.ai-error{',
        'font-size:13px;color:#c0392b;padding:4px 0 10px;',
      '}',
      '[data-theme="dark"] .ai-error{color:#ff6b6b;}',

      /* Sources label */
      '.ai-sources-label{',
        'font-size:11px;font-weight:600;letter-spacing:.06em;',
        'text-transform:uppercase;color:var(--muted);',
        'margin-bottom:10px;',
      '}',

      /* Source hadith cards */
      '.ai-hadith-list{',
        'display:flex;flex-direction:column;gap:10px;',
      '}',
      '.ai-hadith-card{',
        'background:var(--bg);',
        'border:1.5px solid var(--border);',
        'border-radius:12px;padding:14px 16px;',
        'transition:border-color .2s;',
      '}',
      '.ai-hadith-card:hover{border-color:var(--accent);}',
      '.ai-hadith-source{',
        'font-size:11px;font-weight:600;letter-spacing:.04em;',
        'text-transform:uppercase;color:var(--accent);',
        'margin-bottom:6px;',
      '}',
      '.ai-hadith-chapter{',
        'font-size:11px;color:var(--muted);margin-bottom:6px;',
      '}',
      '.ai-hadith-english{',
        'font-size:13px;line-height:1.6;color:var(--ink);',
        /* Clamp to 3 lines */
        'display:-webkit-box;-webkit-line-clamp:3;',
        '-webkit-box-orient:vertical;overflow:hidden;',
      '}',
      '.ai-hadith-narrator{',
        'font-size:12px;color:var(--muted);margin-top:6px;',
      '}',

      /* Mobile */
      '@media(max-width:600px){',
        '.ai-section{padding:0 16px;}',
        '.ai-box{padding:16px;}',
      '}'

    ].join('');
    document.head.appendChild(s);
  }

  /* ── Build section HTML ── */
  function _buildSection() {
    var sec = document.createElement('section');
    sec.className  = 'ai-section';
    sec.id         = 'ai-ask';
    sec.setAttribute('aria-label', 'Ask AI about Hadith');

    sec.innerHTML = [
      '<h2 class="section-label">Ask About Hadith</h2>',
      '<div class="ai-box">',
        '<div class="ai-input-row">',
          '<textarea',
            ' class="ai-input"',
            ' id="ai-input"',
            ' rows="1"',
            ' placeholder="e.g. What does Islam say about honesty?"',
            ' aria-label="Ask a question about Hadith"',
            ' maxlength="500"',
          '></textarea>',
          '<button class="ai-send-btn" id="ai-send-btn" aria-label="Ask" type="button">',
            '<svg width="16" height="16" viewBox="0 0 24 24">',
              '<line x1="22" y1="2" x2="11" y2="13"/>',
              '<polygon points="22 2 15 22 11 13 2 9 22 2"/>',
            '</svg>',
          '</button>',
        '</div>',
        '<p class="ai-hint">',
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">',
            '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/>',
            '<line x1="12" y1="8" x2="12.01" y2="8"/>',
          '</svg>',
          'Answers are grounded in Sahih al-Bukhari. Source hadiths are shown below each answer.',
        '</p>',
        '<div class="ai-answer" id="ai-answer"></div>',
      '</div>'
    ].join('');

    return sec;
  }

  /* ── Auto-grow textarea ── */
  function _autoGrow(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  /* ── Render loading state ── */
  function _showLoading(container) {
    container.innerHTML =
      '<div class="ai-loading" aria-live="polite" aria-label="Thinking…">' +
        '<span></span><span></span><span></span>' +
      '</div>';
    container.classList.add('visible');
  }

  /* ── Render error ── */
  function _showError(container, msg) {
    container.innerHTML =
      '<p class="ai-error">' + _esc(msg) + '</p>';
    container.classList.add('visible');
  }

  /* ── Render answer + sources ── */
  function _showAnswer(container, data) {
    var html = '<p class="ai-answer-text">' + _esc(data.answer) + '</p>';

    if (data.hadiths && data.hadiths.length > 0) {
      html += '<p class="ai-sources-label">Source Hadiths</p>';
      html += '<div class="ai-hadith-list">';
      data.hadiths.forEach(function (h) {
        html +=
          '<div class="ai-hadith-card">' +
            '<p class="ai-hadith-source">' + _esc(h.source) + '</p>' +
            (h.chapter ? '<p class="ai-hadith-chapter">' + _esc(h.chapter) + '</p>' : '') +
            '<p class="ai-hadith-english">' + _esc(h.english) + '</p>' +
            (h.narrator ? '<p class="ai-hadith-narrator">Narrated by ' + _esc(h.narrator) + '</p>' : '') +
          '</div>';
      });
      html += '</div>';
    }

    container.innerHTML = html;
    container.classList.add('visible');
  }

  /* ── HTML escape ── */
  function _esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ── Submit query ── */
  function _ask(query, btn, container) {
    query = query.trim();
    if (!query) return;

    btn.disabled = true;
    _showLoading(container);

    fetch('/api/ai-search', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query: query })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.error) {
        _showError(container, data.error);
      } else {
        _showAnswer(container, data);
      }
    })
    .catch(function (err) {
      _showError(container, 'Network error — please try again.');
    })
    .finally(function () {
      btn.disabled = false;
    });
  }

  /* ── Mount ── */
  function _mount() {
    /* Only show the AI search widget on the homepage */
    var path = window.location.pathname;
    if (path !== '/' && !path.endsWith('/index.html') && path !== '/index.html') return;

    /* Find the anchor: inject right before #featured (homepage). */
    var anchor =
      document.getElementById('featured') ||
      document.querySelector('main') ||
      document.body;

    _injectStyles();

    var sec     = _buildSection();
    var divider = document.createElement('div');
    divider.className = 'section-divider';

    /* Insert: divider → AI section → divider, before anchor */
    if (anchor.parentNode && anchor !== document.body && anchor !== document.querySelector('main')) {
      anchor.parentNode.insertBefore(divider.cloneNode(), anchor);
      anchor.parentNode.insertBefore(sec, anchor);
      anchor.parentNode.insertBefore(divider, anchor);
    } else {
      /* fallback: append inside anchor */
      anchor.appendChild(divider.cloneNode());
      anchor.appendChild(sec);
      anchor.appendChild(divider);
    }

    /* Wire events */
    var input     = document.getElementById('ai-input');
    var sendBtn   = document.getElementById('ai-send-btn');
    var answerDiv = document.getElementById('ai-answer');

    if (!input || !sendBtn || !answerDiv) return;

    input.addEventListener('input', function () { _autoGrow(input); });

    sendBtn.addEventListener('click', function () {
      _ask(input.value, sendBtn, answerDiv);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        _ask(input.value, sendBtn, answerDiv);
      }
    });
  }

  /* ── Boot ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _mount);
  } else {
    _mount();
  }

})();
