/* ─────────────────────────────────────────────────────────────
   Timeless Hadith — AI Search  (answer renderer)

   No widget HTML is injected. The existing hero `.ai-search-card`
   (see index.html) owns the input UI. This module:

     • Exposes   window.TH_AI.ask(query)
     • Renders an answer card + numbered source cards right below
       the hero `.ai-search-card`
     • Calls     POST /api/ai-search { query }
     • Expects   { answer, hadiths: [{id, english, narrator,
                    source, chapter, url, source_short,
                    hadith_number, book_number, source_row_id}] }

   Depends on: nothing (standalone IIFE)
───────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Inject answer-card styles ── */
  function _injectStyles() {
    if (document.getElementById('th-ai-style')) return;
    var s = document.createElement('style');
    s.id = 'th-ai-style';
    s.textContent = [

      /* Answer wrapper — sits right below the hero AI search card */
      '.ai-answer-wrap{',
        'max-width:760px;',
        'margin:22px auto 0;',
        'padding:0 24px;',
        'display:none;',
      '}',
      '.ai-answer-wrap.visible{display:block;}',

      /* Loading dots */
      '.ai-loading{',
        'display:flex;gap:5px;align-items:center;justify-content:center;',
        'padding:22px 2px;',
      '}',
      '.ai-loading span{',
        'width:7px;height:7px;border-radius:50%;',
        'background:var(--accent);',
        'animation:ai-pulse 1.1s ease-in-out infinite;',
      '}',
      '.ai-loading span:nth-child(2){animation-delay:.18s;}',
      '.ai-loading span:nth-child(3){animation-delay:.36s;}',
      '@keyframes ai-pulse{',
        '0%,80%,100%{opacity:.25;transform:scale(.8);}',
        '40%{opacity:1;transform:scale(1);}',
      '}',

      /* Error */
      '.ai-error{',
        'font-size:13px;color:#c0392b;padding:16px 18px;',
        'background:var(--surface);',
        'border:1px solid var(--border);',
        'border-radius:14px;',
      '}',
      '[data-theme="dark"] .ai-error{color:#ff6b6b;}',

      /* ───────── Answer card ───────── */
      '.ai-answer-card{',
        'background:var(--surface);',
        'border:1px solid var(--border);',
        'border-radius:18px;',
        'padding:22px 24px;',
        'box-shadow:0 1px 2px rgba(0,0,0,.04),0 8px 24px rgba(0,0,0,.04);',
        'animation:ai-fade-up .35s ease-out both;',
      '}',
      '[data-theme="dark"] .ai-answer-card{',
        'box-shadow:0 1px 2px rgba(0,0,0,.4),0 8px 24px rgba(0,0,0,.25);',
      '}',
      '@keyframes ai-fade-up{',
        'from{opacity:0;transform:translateY(8px);}',
        'to{opacity:1;transform:translateY(0);}',
      '}',
      '.ai-answer-header{',
        'display:flex;align-items:center;gap:10px;',
        'margin-bottom:14px;',
      '}',
      '.ai-answer-title{',
        'display:flex;align-items:center;gap:9px;',
        'font-size:17px;font-weight:700;',
        'color:var(--ink);letter-spacing:-.01em;',
      '}',
      '.ai-answer-icon{',
        'display:inline-flex;align-items:center;justify-content:center;',
        'width:26px;height:26px;border-radius:8px;',
        'background:linear-gradient(135deg,rgba(0,113,227,.14),rgba(120,80,220,.14));',
        'color:var(--accent);',
      '}',
      '[data-theme="dark"] .ai-answer-icon{',
        'background:linear-gradient(135deg,rgba(41,151,255,.22),rgba(140,110,240,.22));',
      '}',
      '.ai-answer-icon svg{display:block;}',

      /* Answer body */
      '.ai-answer-body{',
        'font-size:15.5px;line-height:1.78;color:var(--ink);',
        'text-align:left;',
      '}',
      '.ai-answer-body *{text-align:left;}',
      '.ai-answer-body p{margin:0 0 14px;text-align:left;}',
      '.ai-answer-body p:last-child{margin-bottom:0;}',
      '.ai-answer-body strong{font-weight:700;color:var(--accent);}',
      '[data-theme="dark"] .ai-answer-body strong{color:#4ea4ff;}',

      /* Numbered list — structured, colorful, left-aligned */
      '.ai-list{',
        'list-style:none;margin:14px 0 4px;padding:0;',
        'display:flex;flex-direction:column;gap:12px;',
      '}',
      '.ai-list-item{',
        'position:relative;',
        'padding:12px 14px 12px 46px;',
        'background:linear-gradient(135deg,rgba(0,113,227,.05),rgba(120,80,220,.04));',
        'border:1px solid rgba(0,113,227,.12);',
        'border-left:3px solid var(--accent);',
        'border-radius:12px;',
        'font-size:15px;line-height:1.7;color:var(--ink);',
        'text-align:left;',
        'transition:transform .18s,box-shadow .18s,border-color .18s;',
      '}',
      '[data-theme="dark"] .ai-list-item{',
        'background:linear-gradient(135deg,rgba(41,151,255,.08),rgba(140,110,240,.06));',
        'border-color:rgba(41,151,255,.2);',
        'border-left-color:var(--accent);',
      '}',
      '.ai-list-item:hover{',
        'transform:translateX(2px);',
        'box-shadow:0 4px 14px rgba(0,113,227,.08);',
      '}',
      '.ai-list-num{',
        'position:absolute;top:11px;left:12px;',
        'display:inline-flex;align-items:center;justify-content:center;',
        'width:26px;height:26px;',
        'font-size:12px;font-weight:800;line-height:1;',
        'color:#fff;',
        'background:linear-gradient(135deg,var(--accent),#7850dc);',
        'border-radius:999px;',
        'box-shadow:0 2px 6px rgba(0,113,227,.28);',
      '}',

      /* Highlighted quote (no italics per brand rule) */
      '.ai-quote{',
        'font-weight:500;color:var(--ink);',
        'background:linear-gradient(transparent 62%,rgba(0,113,227,.14) 62%);',
        'padding:0 2px;border-radius:2px;',
      '}',
      '[data-theme="dark"] .ai-quote{',
        'background:linear-gradient(transparent 62%,rgba(41,151,255,.22) 62%);',
      '}',

      /* Inline citation pill */
      '.ai-cite{',
        'display:inline-flex;align-items:center;justify-content:center;',
        'min-width:18px;height:18px;',
        'padding:0 6px;margin:0 2px;',
        'font-size:10.5px;font-weight:700;line-height:1;',
        'color:var(--accent);',
        'background:rgba(0,113,227,.1);',
        'border-radius:999px;',
        'text-decoration:none;vertical-align:1px;',
        'transition:background .15s,color .15s,transform .15s;',
      '}',
      '[data-theme="dark"] .ai-cite{',
        'background:rgba(41,151,255,.18);',
      '}',
      '.ai-cite:hover{',
        'background:var(--accent);color:#fff;',
        'transform:translateY(-1px);',
      '}',
      '.ai-cite-inert{',
        'display:inline-block;min-width:16px;padding:0 4px;',
        'font-size:10.5px;font-weight:700;',
        'color:var(--muted);vertical-align:1px;',
      '}',

      /* Action row */
      '.ai-answer-actions{',
        'display:flex;gap:8px;flex-wrap:wrap;',
        'margin-top:18px;padding-top:16px;',
        'border-top:1px solid var(--border);',
      '}',
      '.ai-action-btn{',
        'display:inline-flex;align-items:center;gap:7px;',
        'padding:8px 14px;background:transparent;',
        'border:1px solid var(--border);border-radius:999px;',
        'font-family:inherit;font-size:13px;font-weight:500;',
        'color:var(--ink);cursor:pointer;',
        'transition:background .15s,border-color .15s,color .15s;',
      '}',
      '.ai-action-btn:hover{',
        'background:var(--bg);',
        'border-color:var(--accent);',
        'color:var(--accent);',
      '}',
      '.ai-action-btn:active{transform:translateY(1px);}',
      '.ai-action-btn svg{',
        'width:14px;height:14px;stroke:currentColor;fill:none;',
        'stroke-width:2;stroke-linecap:round;stroke-linejoin:round;',
      '}',
      '.ai-action-btn.is-success{border-color:#2ea043;color:#2ea043;}',

      /* ───────── Sources ───────── */
      '.ai-sources{',
        'margin-top:22px;',
        'animation:ai-fade-up .35s ease-out .08s both;',
      '}',
      '.ai-sources-header{',
        'display:flex;align-items:center;gap:9px;',
        'font-size:15px;font-weight:700;color:var(--ink);',
        'margin-bottom:12px;letter-spacing:-.01em;',
      '}',
      '.ai-sources-header svg{color:var(--muted);}',
      '.ai-sources-grid{',
        'display:grid;grid-template-columns:repeat(2,1fr);gap:12px;',
      '}',
      '.ai-source-card{',
        'display:flex;flex-direction:column;gap:6px;',
        'padding:16px 16px 14px 44px;',
        'background:var(--surface);',
        'border:1px solid var(--border);',
        'border-radius:14px;',
        'text-decoration:none;color:var(--ink);',
        'transition:border-color .18s,transform .18s,box-shadow .18s;',
        'position:relative;min-height:112px;',
      '}',
      '.ai-source-card:hover{',
        'border-color:var(--accent);',
        'transform:translateY(-1px);',
        'box-shadow:0 6px 18px rgba(0,0,0,.06);',
      '}',
      '[data-theme="dark"] .ai-source-card:hover{',
        'box-shadow:0 6px 18px rgba(0,0,0,.35);',
      '}',
      '.ai-source-num{',
        'position:absolute;top:14px;left:14px;',
        'display:inline-flex;align-items:center;justify-content:center;',
        'width:22px;height:22px;',
        'font-size:11px;font-weight:700;',
        'color:var(--accent);',
        'background:rgba(0,113,227,.1);',
        'border-radius:999px;line-height:1;',
      '}',
      '[data-theme="dark"] .ai-source-num{',
        'background:rgba(41,151,255,.2);',
      '}',
      '.ai-source-card:hover .ai-source-num{',
        'background:var(--accent);color:#fff;',
      '}',
      '.ai-source-title{',
        'font-size:13px;font-weight:600;color:var(--ink);',
        'line-height:1.5;',
        'display:-webkit-box;-webkit-line-clamp:3;',
        '-webkit-box-orient:vertical;overflow:hidden;',
      '}',
      '.ai-source-narrator{',
        'font-size:11.5px;color:var(--muted);line-height:1.4;',
        'margin-top:2px;',
      '}',
      '.ai-source-badge{',
        'display:inline-flex;align-items:center;gap:6px;',
        'font-size:11px;font-weight:600;letter-spacing:.02em;',
        'text-transform:uppercase;',
        'color:var(--accent);',
        'margin-top:auto;padding-top:6px;',
      '}',
      '.ai-source-badge svg{',
        'width:12px;height:12px;stroke:currentColor;fill:none;',
        'stroke-width:2;stroke-linecap:round;stroke-linejoin:round;',
      '}',

      /* Mobile */
      '@media(max-width:600px){',
        '.ai-answer-wrap{padding:0 16px;}',
        '.ai-answer-card{padding:18px 18px;}',
        '.ai-sources-grid{grid-template-columns:1fr;}',
      '}'

    ].join('');
    document.head.appendChild(s);
  }

  /* ── SVG icon library ── */
  var ICONS = {
    sparkle:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"/>' +
        '<path d="M19 15l.7 1.8L21.5 17.5l-1.8.7L19 20l-.7-1.8L16.5 17.5l1.8-.7z"/>' +
      '</svg>',
    copy:
      '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    share:
      '<svg viewBox="0 0 24 24"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>',
    globe:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="12" r="10"/>' +
        '<line x1="2" y1="12" x2="22" y2="12"/>' +
        '<path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/>' +
      '</svg>',
    book:
      '<svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'
  };

  /* ── HTML escape ── */
  function _esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ── Format inline tokens (bold / quotes / citations) on a line ── */
  function _formatInline(safe, hadiths) {
    // **bold** → <strong>
    safe = safe.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');

    // "quoted" → highlighter span with curly quotes
    safe = safe.replace(/&quot;([^]*?)&quot;/g, function (_m, inner) {
      return '<span class="ai-quote">\u201C' + inner + '\u201D</span>';
    });

    // [N] citation markers → clickable pills → internal hadith page
    safe = safe.replace(/\[(\d+)\]/g, function (_m, n) {
      var idx = parseInt(n, 10) - 1;
      var h   = hadiths && hadiths[idx];
      if (h && h.url) {
        return '<a class="ai-cite" href="' + _esc(h.url) +
               '" aria-label="Source ' + n + '">' + n + '</a>';
      }
      return '<sup class="ai-cite-inert">' + n + '</sup>';
    });

    return safe;
  }

  /* ── Format answer text into prose + structured numbered list blocks ── */
  function _formatAnswer(text, hadiths) {
    var safe = _esc(text || '');

    // Split into blocks on blank lines
    var blocks = safe.split(/\n{2,}/);

    var out  = [];
    var list = null; // accumulator for consecutive "N. item" lines

    function flushList() {
      if (list && list.length) {
        out.push('<ol class="ai-list">' + list.join('') + '</ol>');
      }
      list = null;
    }

    blocks.forEach(function (block) {
      var lines = block.split(/\n/);

      // Check if every non-empty line in the block is a numbered item like "1. ..."
      var allNumbered = lines.length > 0 && lines.every(function (ln) {
        return /^\s*\d+[\.\)]\s+/.test(ln) || ln.trim() === '';
      });

      if (allNumbered) {
        if (!list) list = [];
        lines.forEach(function (ln) {
          var m = ln.match(/^\s*(\d+)[\.\)]\s+(.*)$/);
          if (!m) return;
          var num  = m[1];
          var body = _formatInline(m[2], hadiths);
          list.push(
            '<li class="ai-list-item">' +
              '<span class="ai-list-num">' + num + '</span>' +
              body +
            '</li>'
          );
        });
      } else {
        flushList();
        var formatted = _formatInline(block, hadiths);
        out.push('<p>' + formatted.replace(/\n/g, '<br>') + '</p>');
      }
    });

    flushList();
    return out.join('');
  }

  /* ── Ensure the answer target exists (created lazily, inserted right
        below the hero `.ai-search-card`). ── */
  function _ensureTarget() {
    var existing = document.getElementById('ai-answer-wrap');
    if (existing) return existing;

    var anchor = document.querySelector('.ai-search-card');
    if (!anchor || !anchor.parentNode) return null;

    var wrap = document.createElement('div');
    wrap.id = 'ai-answer-wrap';
    wrap.className = 'ai-answer-wrap';
    wrap.setAttribute('aria-live', 'polite');

    // Insert right after the .ai-search-card
    anchor.parentNode.insertBefore(wrap, anchor.nextSibling);
    return wrap;
  }

  /* ── States ── */
  function _showLoading(target) {
    target.innerHTML =
      '<div class="ai-loading" aria-label="Thinking">' +
        '<span></span><span></span><span></span>' +
      '</div>';
    target.classList.add('visible');
  }

  function _showError(target, msg) {
    target.innerHTML = '<p class="ai-error">' + _esc(msg) + '</p>';
    target.classList.add('visible');
  }

  function _showAnswer(target, data) {
    var answerHtml = [
      '<article class="ai-answer-card">',
        '<header class="ai-answer-header">',
          '<div class="ai-answer-title">',
            '<span class="ai-answer-icon" aria-hidden="true">', ICONS.sparkle, '</span>',
            '<span>Answer</span>',
          '</div>',
        '</header>',
        '<div class="ai-answer-body">', _formatAnswer(data.answer, data.hadiths), '</div>',
        '<div class="ai-answer-actions">',
          '<button class="ai-action-btn" type="button" data-action="copy" aria-label="Copy answer">',
            ICONS.copy, '<span>Copy</span>',
          '</button>',
          '<button class="ai-action-btn" type="button" data-action="share" aria-label="Share answer">',
            ICONS.share, '<span>Share</span>',
          '</button>',
        '</div>',
      '</article>'
    ].join('');

    var sourcesHtml = '';
    if (data.hadiths && data.hadiths.length > 0) {
      sourcesHtml += '<section class="ai-sources">';
      sourcesHtml +=   '<div class="ai-sources-header">' + ICONS.globe + '<span>Sources</span></div>';
      sourcesHtml +=   '<div class="ai-sources-grid">';
      data.hadiths.forEach(function (h, i) {
        var num      = i + 1;
        var title    = (h.english || '').trim();
        var narrator = h.narrator ? 'Narrated by ' + h.narrator : '';
        var href     = h.url || '/categories.html';
        sourcesHtml +=
          '<a class="ai-source-card" href="' + _esc(href) + '">' +
            '<div class="ai-source-num">' + num + '</div>' +
            '<div class="ai-source-title">' + _esc(title) + '</div>' +
            (narrator ? '<div class="ai-source-narrator">' + _esc(narrator) + '</div>' : '') +
            '<div class="ai-source-badge">' + ICONS.book + '<span>Reference</span></div>' +
          '</a>';
      });
      sourcesHtml +=   '</div>';
      sourcesHtml += '</section>';
    }

    target.innerHTML = answerHtml + sourcesHtml;
    target.classList.add('visible');

    // Wire Copy button
    var copyBtn = target.querySelector('[data-action="copy"]');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var label = copyBtn.querySelector('span');
        var original = label ? label.textContent : 'Copy';
        var done = function () {
          copyBtn.classList.add('is-success');
          if (label) label.textContent = 'Copied';
          setTimeout(function () {
            copyBtn.classList.remove('is-success');
            if (label) label.textContent = original;
          }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(data.answer || '').then(done).catch(function () {});
        }
      });
    }

    // Wire Share button (native share if available, otherwise copy)
    var shareBtn = target.querySelector('[data-action="share"]');
    if (shareBtn) {
      shareBtn.addEventListener('click', function () {
        var label = shareBtn.querySelector('span');
        var original = label ? label.textContent : 'Share';
        var shareText = (data.answer || '') + '\n\nvia Timeless Hadith — ' + window.location.href;
        var done = function (msg) {
          shareBtn.classList.add('is-success');
          if (label) label.textContent = msg || 'Shared';
          setTimeout(function () {
            shareBtn.classList.remove('is-success');
            if (label) label.textContent = original;
          }, 1500);
        };
        if (navigator.share) {
          navigator.share({
            title: 'Timeless Hadith',
            text:  shareText,
            url:   window.location.href
          }).then(function () { done('Shared'); }).catch(function () {});
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shareText).then(function () { done('Copied'); });
        }
      });
    }
  }

  /* ── Submit query to the backend ── */
  function _ask(query) {
    query = String(query || '').trim();
    if (!query) return;

    var target = _ensureTarget();
    if (!target) return;

    _showLoading(target);
    // Gently scroll the answer area into view
    setTimeout(function () {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 120);

    fetch('/api/ai-search', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query: query })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.error) {
        _showError(target, data.error);
      } else {
        _showAnswer(target, data);
      }
    })
    .catch(function () {
      _showError(target, 'Network error — please try again.');
    });
  }

  /* ── Public API ── */
  window.TH_AI = {
    ask: _ask
  };

  /* ── Boot: just inject styles (widget is already in index.html) ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _injectStyles);
  } else {
    _injectStyles();
  }

})();
