/* ─────────────────────────────────────────────────────────────────
   Timeless Hadith — AI Search  (frontend)

   Injects the AI-Ask section into the homepage.
   Design: glowing orb · time-based greeting · collection filter
           example chips · results with source hadith cards
   Calls:  POST /api/ai-search  { query: "...", collection: "..." }
   Returns: { answer: "...", hadiths: [{id,english,arabic,narrator,source,chapter}] }
───────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Styles ── */
  function _injectStyles() {
    if (document.getElementById('th-ai-style')) return;
    var s = document.createElement('style');
    s.id = 'th-ai-style';
    s.textContent = `

/* ── Section wrapper ── */
.ai-section {
  max-width: 720px;
  margin: 0 auto;
  padding: 56px 24px 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ── Orb ── */
.ai-orb-wrap {
  position: relative;
  width: 80px; height: 80px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 28px;
}
.ai-orb-glow {
  position: absolute; inset: -16px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(168,85,247,.3) 0%, transparent 70%);
  animation: ai-orb-pulse 3s ease-in-out infinite;
}
.ai-orb {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%,
    #e0aaff 0%, #c084fc 25%, #a855f7 50%, #7c3aed 75%, #4c1d95 100%
  );
  box-shadow:
    0 0 28px rgba(168,85,247,.5),
    0 0 56px rgba(168,85,247,.2),
    inset 0 -6px 16px rgba(0,0,0,.3),
    inset 0 4px 10px rgba(255,255,255,.2);
  animation: ai-orb-float 4s ease-in-out infinite;
  position: relative; z-index: 1;
}
.ai-orb::after {
  content: '';
  position: absolute; top: 15%; left: 20%;
  width: 30%; height: 18%;
  background: rgba(255,255,255,.35);
  border-radius: 50%;
  filter: blur(3px);
  transform: rotate(-30deg);
}
@keyframes ai-orb-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-7px); }
}
@keyframes ai-orb-pulse {
  0%, 100% { opacity: .55; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

/* ── Greeting ── */
.ai-greeting {
  text-align: center;
  margin-bottom: 36px;
}
.ai-greeting-line1 {
  font-size: 30px; font-weight: 800;
  letter-spacing: -.6px; line-height: 1.15;
  color: var(--ink);
  margin-bottom: 2px;
}
[data-theme="dark"] .ai-greeting-line1 { color: #f0f0f5; }
.ai-greeting-line2 {
  font-size: 30px; font-weight: 800;
  letter-spacing: -.6px; line-height: 1.15;
  color: var(--ink);
}
[data-theme="dark"] .ai-greeting-line2 { color: #f0f0f5; }
.ai-greeting-line2 span {
  background: linear-gradient(135deg, #a855f7 0%, #c084fc 50%, #f0abfc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Search box ── */
.ai-box {
  width: 100%;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 18px;
  padding: 18px 18px 14px;
  margin-bottom: 32px;
  transition: border-color .2s, box-shadow .2s;
  box-shadow: 0 4px 20px rgba(0,0,0,.06);
}
[data-theme="dark"] .ai-box {
  background: #131a24;
  border-color: #2a2a3a;
  box-shadow: 0 4px 24px rgba(0,0,0,.3);
}
.ai-box:focus-within {
  border-color: rgba(168,85,247,.5);
  box-shadow: 0 4px 28px rgba(168,85,247,.12), 0 0 0 3px rgba(168,85,247,.08);
}

.ai-input-row {
  display: flex; gap: 12px; align-items: flex-start;
  margin-bottom: 14px;
}
.ai-input-icon {
  margin-top: 3px; flex-shrink: 0;
  color: #a855f7;
}
.ai-input {
  flex: 1;
  border: none; background: transparent;
  font-family: inherit; font-size: 15px;
  color: var(--ink); line-height: 1.6;
  resize: none; outline: none;
  min-height: 52px; max-height: 180px;
  overflow-y: auto;
}
[data-theme="dark"] .ai-input { color: #f0f0f5; }
.ai-input::placeholder { color: var(--muted); }

/* ── Toolbar ── */
.ai-toolbar {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.ai-toolbar-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--muted);
  font-size: 12px; font-weight: 500;
  cursor: pointer; font-family: inherit;
  transition: all .15s; position: relative;
}
[data-theme="dark"] .ai-toolbar-btn {
  background: #0d1117; border-color: #2a2a3a;
}
.ai-toolbar-btn:hover { color: var(--ink); border-color: #999; }
[data-theme="dark"] .ai-toolbar-btn:hover { color: #f0f0f5; border-color: #444; }
.ai-toolbar-sep { flex: 1; }
.ai-send-btn {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: #18181b;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s, transform .1s;
  color: white; flex-shrink: 0;
}
[data-theme="dark"] .ai-send-btn { background: #e8e8ed; }
.ai-send-btn:hover { background: #2d2d33; transform: scale(1.05); }
[data-theme="dark"] .ai-send-btn:hover { background: #f5f5f7; }
.ai-send-btn:active { transform: scale(.95); }
.ai-send-btn:disabled { opacity: .45; cursor: not-allowed; transform: none; }
.ai-send-btn svg { stroke: #fff; fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
[data-theme="dark"] .ai-send-btn svg { stroke: #18181b; }

/* ── Collection dropdown ── */
.ai-dropdown {
  position: absolute;
  top: calc(100% + 4px); left: 0;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 5px;
  min-width: 200px;
  z-index: 50;
  box-shadow: 0 8px 32px rgba(0,0,0,.15);
  display: none;
}
[data-theme="dark"] .ai-dropdown {
  background: #1c1c28; border-color: #333348;
  box-shadow: 0 8px 32px rgba(0,0,0,.5);
}
.ai-dropdown.open { display: block; }
.ai-dropdown-item {
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 13px; font-weight: 500;
  cursor: pointer;
  display: flex; align-items: center; gap: 10px;
  color: var(--ink); transition: background .1s;
  font-family: inherit;
  border: none; background: transparent; width: 100%; text-align: left;
}
[data-theme="dark"] .ai-dropdown-item { color: #dde6f0; }
.ai-dropdown-item:hover { background: var(--surface); }
[data-theme="dark"] .ai-dropdown-item:hover { background: rgba(255,255,255,.05); }
.ai-dropdown-item.ai-checked { color: #a855f7; }
.ai-dropdown-check { font-size: 13px; width: 16px; }

/* ── Example chips ── */
.ai-examples-label {
  font-size: 11px; font-weight: 700;
  letter-spacing: 1.2px; text-transform: uppercase;
  color: var(--muted);
  align-self: flex-start;
  margin-bottom: 12px;
}
.ai-chips-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
}
.ai-chip {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 15px 16px;
  cursor: pointer;
  transition: all .2s;
  display: flex; flex-direction: column;
  justify-content: space-between;
  min-height: 96px; gap: 12px;
  font-family: inherit; text-align: left;
}
[data-theme="dark"] .ai-chip {
  background: #131a24; border-color: #2a2a3a;
}
.ai-chip:hover {
  border-color: rgba(168,85,247,.4);
  box-shadow: 0 4px 16px rgba(168,85,247,.1);
  transform: translateY(-2px);
}
[data-theme="dark"] .ai-chip:hover { background: #1c1c28; }
.ai-chip-text {
  font-size: 13px; font-weight: 500;
  color: var(--ink); line-height: 1.5;
}
[data-theme="dark"] .ai-chip-text { color: #dde6f0; }
.ai-chip-icon {
  width: 28px; height: 28px;
  border-radius: 8px;
  background: rgba(168,85,247,.1);
  border: 1px solid rgba(168,85,247,.25);
  display: flex; align-items: center; justify-content: center;
  color: #a855f7; flex-shrink: 0;
}
.ai-chip-icon svg { stroke: #a855f7; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

/* ── Results ── */
.ai-results {
  width: 100%;
  display: none;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}
.ai-results.visible { display: flex; }

.ai-thinking {
  background: var(--surface);
  border: 1px solid rgba(168,85,247,.3);
  border-radius: 14px;
  padding: 14px 18px;
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; color: #a855f7; font-weight: 500;
}
[data-theme="dark"] .ai-thinking { background: #131a24; }
.ai-thinking-dots { display: flex; gap: 4px; align-items: center; }
.ai-thinking-dots span {
  width: 6px; height: 6px; background: #a855f7;
  border-radius: 50%;
  animation: ai-bounce 1.2s ease-in-out infinite;
}
.ai-thinking-dots span:nth-child(2) { animation-delay: .2s; }
.ai-thinking-dots span:nth-child(3) { animation-delay: .4s; }
@keyframes ai-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: .35; }
  40% { transform: translateY(-5px); opacity: 1; }
}

.ai-result-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px 22px;
  animation: ai-fade-up .3s ease forwards;
}
[data-theme="dark"] .ai-result-card { background: #131a24; border-color: #2a2a3a; }
@keyframes ai-fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.ai-answer-text {
  font-size: 14px; line-height: 1.75;
  color: var(--ink); margin-bottom: 16px;
}
[data-theme="dark"] .ai-answer-text { color: #dde6f0; }

.ai-hadith-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 10px;
  transition: border-color .2s;
}
[data-theme="dark"] .ai-hadith-card { background: #1c1c28; border-color: #333348; }
.ai-hadith-card:hover { border-color: rgba(168,85,247,.4); }

.ai-hadith-arabic {
  font-family: 'Noto Naskh Arabic', Georgia, serif;
  font-size: 18px; line-height: 2;
  direction: rtl; text-align: right;
  color: var(--ink);
  margin-bottom: 12px; padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
[data-theme="dark"] .ai-hadith-arabic { color: #f0f0f5; border-color: #2a2a3a; }

.ai-hadith-english {
  font-size: 13px; line-height: 1.7;
  color: var(--ink); font-style: italic;
  margin-bottom: 12px;
}
[data-theme="dark"] .ai-hadith-english { color: #ccd6e0; }

.ai-hadith-meta { display: flex; gap: 7px; flex-wrap: wrap; }
.ai-hadith-tag {
  font-size: 11px; font-weight: 600;
  padding: 3px 10px; border-radius: 100px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--muted);
}
[data-theme="dark"] .ai-hadith-tag { background: #0d1117; border-color: #2a2a3a; }
.ai-hadith-tag.ai-tag-source {
  background: rgba(52,211,153,.08);
  border-color: rgba(52,211,153,.25);
  color: #059669;
}
[data-theme="dark"] .ai-hadith-tag.ai-tag-source { color: #34d399; }

.ai-sources-section { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border); }
[data-theme="dark"] .ai-sources-section { border-color: #2a2a3a; }
.ai-sources-label {
  font-size: 10px; font-weight: 700; letter-spacing: .8px;
  text-transform: uppercase; color: var(--muted); margin-bottom: 8px;
}
.ai-source-chips { display: flex; flex-wrap: wrap; gap: 7px; }
.ai-source-chip {
  font-size: 12px; font-weight: 600;
  padding: 4px 11px; border-radius: 100px;
  background: rgba(168,85,247,.08);
  border: 1px solid rgba(168,85,247,.25);
  color: #a855f7; cursor: pointer;
  transition: background .15s;
  display: flex; align-items: center; gap: 4px;
}
.ai-source-chip:hover { background: rgba(168,85,247,.18); }

.ai-related-section { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); }
[data-theme="dark"] .ai-related-section { border-color: #2a2a3a; }
.ai-related-label {
  font-size: 10px; font-weight: 700; letter-spacing: .8px;
  text-transform: uppercase; color: var(--muted); margin-bottom: 8px;
}
.ai-related-chips { display: flex; flex-wrap: wrap; gap: 7px; }
.ai-related-chip {
  font-size: 12px; padding: 4px 11px; border-radius: 100px;
  background: var(--surface); border: 1px solid var(--border);
  color: var(--muted); cursor: pointer; transition: all .15s;
  font-family: inherit;
}
[data-theme="dark"] .ai-related-chip { background: #0d1117; border-color: #2a2a3a; }
.ai-related-chip:hover { color: var(--ink); border-color: #999; }
[data-theme="dark"] .ai-related-chip:hover { color: #f0f0f5; border-color: #555; }

.ai-error-text { font-size: 13px; color: #dc2626; padding: 4px 0; }
[data-theme="dark"] .ai-error-text { color: #f87171; }

/* ── Footer note ── */
.ai-footer-note {
  text-align: center;
  font-size: 11px; color: var(--muted);
  margin-top: 28px; line-height: 1.6;
}

/* ── Mobile ── */
@media (max-width: 600px) {
  .ai-section { padding: 40px 16px 48px; }
  .ai-greeting-line1, .ai-greeting-line2 { font-size: 22px; }
  .ai-chips-grid { grid-template-columns: 1fr; }
  .ai-orb { width: 54px; height: 54px; }
  .ai-orb-wrap { width: 66px; height: 66px; }
}
    `;
    document.head.appendChild(s);
  }

  /* ── Helpers ── */
  function _esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function _greeting() {
    var h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  /* ── Build HTML ── */
  function _buildSection() {
    var sec = document.createElement('section');
    sec.className = 'ai-section';
    sec.id = 'ai-ask';
    sec.setAttribute('aria-label', 'Ask AI about Hadith');

    sec.innerHTML = `
      <!-- Orb -->
      <div class="ai-orb-wrap" aria-hidden="true">
        <div class="ai-orb-glow"></div>
        <div class="ai-orb"></div>
      </div>

      <!-- Greeting -->
      <div class="ai-greeting">
        <div class="ai-greeting-line1" id="ai-greeting">${_greeting()}</div>
        <div class="ai-greeting-line2">What's on <span>your mind?</span></div>
      </div>

      <!-- Results (shown after search) -->
      <div class="ai-results" id="ai-results"></div>

      <!-- Search box -->
      <div class="ai-box">
        <div class="ai-input-row">
          <div class="ai-input-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              <path d="M20 3h1m0 0v1m0-1a2 2 0 0 0-2-2m2 2h-1"/>
            </svg>
          </div>
          <textarea
            class="ai-input"
            id="ai-input"
            rows="2"
            placeholder="Ask about a hadith, topic, or Islamic teaching…"
            aria-label="Ask a question about Hadith"
            maxlength="600"
          ></textarea>
        </div>
        <div class="ai-toolbar">
          <!-- Collection filter -->
          <div style="position:relative;">
            <button class="ai-toolbar-btn" id="ai-collection-btn" aria-haspopup="listbox" aria-expanded="false" type="button">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              <span id="ai-collection-label">All Collections</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div class="ai-dropdown" id="ai-dropdown" role="listbox">
              <button class="ai-dropdown-item ai-checked" data-value="" role="option" aria-selected="true" type="button">
                <span class="ai-dropdown-check">✓</span>All Collections
              </button>
              <button class="ai-dropdown-item" data-value="Sahih al-Bukhari" role="option" aria-selected="false" type="button">
                <span class="ai-dropdown-check" style="opacity:0">✓</span>Sahih al-Bukhari
              </button>
              <button class="ai-dropdown-item" data-value="Sahih Muslim" role="option" aria-selected="false" type="button">
                <span class="ai-dropdown-check" style="opacity:0">✓</span>Sahih Muslim
              </button>
              <button class="ai-dropdown-item" data-value="Sunan Abu Dawud" role="option" aria-selected="false" type="button">
                <span class="ai-dropdown-check" style="opacity:0">✓</span>Sunan Abu Dawud
              </button>
              <button class="ai-dropdown-item" data-value="Jami at-Tirmidhi" role="option" aria-selected="false" type="button">
                <span class="ai-dropdown-check" style="opacity:0">✓</span>Jami at-Tirmidhi
              </button>
              <button class="ai-dropdown-item" data-value="Sunan an-Nasai" role="option" aria-selected="false" type="button">
                <span class="ai-dropdown-check" style="opacity:0">✓</span>Sunan an-Nasai
              </button>
              <button class="ai-dropdown-item" data-value="Sunan Ibn Majah" role="option" aria-selected="false" type="button">
                <span class="ai-dropdown-check" style="opacity:0">✓</span>Sunan Ibn Majah
              </button>
            </div>
          </div>

          <div class="ai-toolbar-sep"></div>

          <!-- Send -->
          <button class="ai-send-btn" id="ai-send-btn" aria-label="Ask" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24">
              <line x1="12" y1="19" x2="12" y2="5"/>
              <polyline points="5 12 12 5 19 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Example chips -->
      <div id="ai-examples">
        <p class="ai-examples-label">Get started with an example below</p>
        <div class="ai-chips-grid">
          <button class="ai-chip" data-prompt="What did the Prophet say about the importance of intentions?" type="button">
            <span class="ai-chip-text">What did the Prophet say about the importance of intentions?</span>
            <span class="ai-chip-icon">
              <svg width="14" height="14" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </span>
          </button>
          <button class="ai-chip" data-prompt="Show me hadiths about kindness to parents and family" type="button">
            <span class="ai-chip-text">Show me hadiths about kindness to parents and family</span>
            <span class="ai-chip-icon">
              <svg width="14" height="14" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
          </button>
          <button class="ai-chip" data-prompt="What hadiths speak about the virtues of fasting in Ramadan?" type="button">
            <span class="ai-chip-text">What hadiths speak about the virtues of fasting in Ramadan?</span>
            <span class="ai-chip-icon">
              <svg width="14" height="14" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </span>
          </button>
          <button class="ai-chip" data-prompt="How did the Prophet describe the importance of prayer?" type="button">
            <span class="ai-chip-text">How did the Prophet describe the importance of prayer?</span>
            <span class="ai-chip-icon">
              <svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </span>
          </button>
        </div>
      </div>

      <!-- Footer note -->
      <p class="ai-footer-note">
        Searches across 7,277 verified hadiths from the six major collections.<br>
        All answers are grounded in authentic sources only.
      </p>
    `;

    return sec;
  }

  /* ── Show thinking ── */
  function _showThinking(container) {
    container.innerHTML =
      '<div class="ai-thinking">' +
        '<div class="ai-thinking-dots" aria-label="Searching">' +
          '<span></span><span></span><span></span>' +
        '</div>' +
        'Searching 7,277 hadiths…' +
      '</div>';
    container.classList.add('visible');
  }

  /* ── Show error ── */
  function _showError(container, msg) {
    container.innerHTML =
      '<div class="ai-result-card">' +
        '<p class="ai-error-text">' + _esc(msg) + '</p>' +
      '</div>';
    container.classList.add('visible');
  }

  /* ── Render answer + source hadiths ── */
  function _showAnswer(container, data) {
    var html = '<div class="ai-result-card">';

    /* Answer text */
    html += '<p class="ai-answer-text">' + _esc(data.answer) + '</p>';

    /* Source hadith cards */
    if (data.hadiths && data.hadiths.length > 0) {
      data.hadiths.forEach(function (h) {
        html += '<div class="ai-hadith-card">';

        /* Arabic (if provided) */
        if (h.arabic) {
          html += '<div class="ai-hadith-arabic">' + _esc(h.arabic) + '</div>';
        }

        /* English */
        html += '<p class="ai-hadith-english">' + _esc(h.english) + '</p>';

        /* Tags */
        html += '<div class="ai-hadith-meta">';
        if (h.source) {
          html += '<span class="ai-hadith-tag ai-tag-source">' + _esc(h.source) + '</span>';
        }
        if (h.narrator) {
          html += '<span class="ai-hadith-tag">' + _esc(h.narrator) + '</span>';
        }
        if (h.chapter) {
          html += '<span class="ai-hadith-tag">' + _esc(h.chapter) + '</span>';
        }
        html += '</div>';

        html += '</div>'; /* /ai-hadith-card */
      });

      /* Source chips */
      html += '<div class="ai-sources-section">';
      html += '<p class="ai-sources-label">Sources</p>';
      html += '<div class="ai-source-chips">';
      data.hadiths.forEach(function (h) {
        if (h.source) {
          html +=
            '<span class="ai-source-chip">' +
              '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>' +
              _esc(h.source) +
            '</span>';
        }
      });
      html += '</div></div>';
    }

    /* Related questions */
    if (data.related && data.related.length > 0) {
      html += '<div class="ai-related-section">';
      html += '<p class="ai-related-label">Related questions</p>';
      html += '<div class="ai-related-chips">';
      data.related.forEach(function (q) {
        html += '<button class="ai-related-chip" data-related="' + _esc(q) + '" type="button">' + _esc(q) + '</button>';
      });
      html += '</div></div>';
    }

    html += '</div>'; /* /ai-result-card */
    container.innerHTML = html;
    container.classList.add('visible');
  }

  /* ── Submit query ── */
  function _ask(query, collection, sendBtn, results, examples) {
    query = (query || '').trim();
    if (!query) return;

    /* Hide example chips once used */
    if (examples) examples.style.display = 'none';

    sendBtn.disabled = true;
    _showThinking(results);

    fetch('/api/ai-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query, collection: collection || '' })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.error) {
        _showError(results, data.error);
      } else {
        _showAnswer(results, data);

        /* Wire related chips after render */
        var relChips = results.querySelectorAll('.ai-related-chip');
        var input = document.getElementById('ai-input');
        relChips.forEach(function (chip) {
          chip.addEventListener('click', function () {
            var q = chip.getAttribute('data-related');
            if (input) input.value = q;
            _ask(q, collection, sendBtn, results, null);
          });
        });
      }
    })
    .catch(function () {
      _showError(results, 'Network error — please check your connection and try again.');
    })
    .finally(function () {
      sendBtn.disabled = false;
    });
  }

  /* ── Mount ── */
  function _mount() {
    /* Homepage only */
    var path = window.location.pathname;
    if (path !== '/' && !path.endsWith('/index.html') && path !== '/index.html') return;

    _injectStyles();

    var sec = _buildSection();
    var divider = document.createElement('div');
    divider.className = 'section-divider';

    /* Inject before #featured */
    var anchor =
      document.getElementById('featured') ||
      document.querySelector('main') ||
      document.body;

    if (anchor.parentNode && anchor !== document.body && anchor !== document.querySelector('main')) {
      anchor.parentNode.insertBefore(divider.cloneNode(), anchor);
      anchor.parentNode.insertBefore(sec, anchor);
      anchor.parentNode.insertBefore(divider, anchor);
    } else {
      anchor.appendChild(divider.cloneNode());
      anchor.appendChild(sec);
      anchor.appendChild(divider);
    }

    /* Wire elements */
    var input        = document.getElementById('ai-input');
    var sendBtn      = document.getElementById('ai-send-btn');
    var results      = document.getElementById('ai-results');
    var examples     = document.getElementById('ai-examples');
    var collBtn      = document.getElementById('ai-collection-btn');
    var dropdown     = document.getElementById('ai-dropdown');
    var collLabel    = document.getElementById('ai-collection-label');
    var selectedColl = '';

    if (!input || !sendBtn || !results) return;

    /* Auto-grow textarea */
    input.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 180) + 'px';
    });

    /* Send */
    function doSend() {
      _ask(input.value, selectedColl, sendBtn, results, examples);
      input.value = '';
      input.style.height = 'auto';
    }

    sendBtn.addEventListener('click', doSend);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        doSend();
      }
    });

    /* Collection dropdown */
    collBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = dropdown.classList.contains('open');
      dropdown.classList.toggle('open', !open);
      collBtn.setAttribute('aria-expanded', String(!open));
    });

    dropdown.querySelectorAll('.ai-dropdown-item').forEach(function (item) {
      item.addEventListener('click', function () {
        dropdown.querySelectorAll('.ai-dropdown-item').forEach(function (i) {
          i.classList.remove('ai-checked');
          i.setAttribute('aria-selected', 'false');
          i.querySelector('.ai-dropdown-check').style.opacity = '0';
        });
        item.classList.add('ai-checked');
        item.setAttribute('aria-selected', 'true');
        item.querySelector('.ai-dropdown-check').style.opacity = '1';
        selectedColl = item.getAttribute('data-value');
        collLabel.textContent = selectedColl || 'All Collections';
        dropdown.classList.remove('open');
        collBtn.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#ai-collection-btn') && !e.target.closest('#ai-dropdown')) {
        dropdown.classList.remove('open');
        collBtn.setAttribute('aria-expanded', 'false');
      }
    });

    /* Example chips */
    sec.querySelectorAll('.ai-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var prompt = chip.getAttribute('data-prompt');
        input.value = prompt;
        doSend();
      });
    });
  }

  /* ── Boot ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _mount);
  } else {
    _mount();
  }

})();
