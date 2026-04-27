/* Timeless Hadith — homepage wiring.
 * Extracted from inline <script> blocks so CSP can drop 'unsafe-inline'.
 * Loaded with defer at the end of index.html.
 */
(function() {

  /* ────────────────────────────────────────────
     THEME
  ──────────────────────────────────────────── */
  const html   = document.documentElement;
  const store  = {
    get(k)    { try { return localStorage.getItem(k); }    catch(e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); }        catch(e) {} }
  };

  const saved = store.get('th_theme');
  if (saved === 'light' || saved === 'dark') html.setAttribute('data-theme', saved);

  function applyTheme() {
    const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    store.set('th_theme', next);
  }

  document.getElementById('themeToggle').addEventListener('click', applyTheme);
  const td = document.getElementById('themeToggleDrawer');
  if (td) td.addEventListener('click', applyTheme);

  /* ── Mobile nav ── */
  const burger = document.getElementById('hamburger');
  const drawer = document.getElementById('navDrawer');
  burger.addEventListener('click', () => drawer.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!e.target.closest('nav')) drawer.classList.remove('open');
  });

  /* ────────────────────────────────────────────
     FEATURED HADITHS — Two-Card Glass Layout
     Card 1: Hadith of the Day (date-deterministic rotation)
     Card 2: Most Read (highest reads count)
  ──────────────────────────────────────────── */
  const FEATURED = [
    {
      arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
      text: '"Actions are but by intentions, and every person will get what they intended."',
      meta: 'Narrated by Umar ibn al-Khattab (RA) — ',
      source: 'Sahih al-Bukhari 1',
      category: 'Intentions & Actions',
      title: 'The Foundation of Every Deed',
      reads: 1247
    },
    {
      arabic: 'لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
      text: '"None of you will have faith until he loves for his brother what he loves for himself."',
      meta: 'Narrated by Anas ibn Malik (RA) — ',
      source: 'Sahih al-Bukhari 13',
      category: 'Love & Brotherhood',
      title: 'The Measure of True Faith',
      reads: 983
    },
    {
      arabic: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
      text: '"A Muslim is the one from whose tongue and hands the Muslims are safe."',
      meta: 'Narrated by Abdullah ibn Amr (RA) — ',
      source: 'Sahih al-Bukhari 10',
      category: 'Character & Conduct',
      title: 'The Mark of a True Muslim',
      reads: 762
    },
    {
      arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
      text: '"The best of you are those who learn the Quran and teach it."',
      meta: 'Narrated by Uthman ibn Affan (RA) — ',
      source: 'Sahih al-Bukhari 5027',
      category: 'Knowledge & Learning',
      title: 'The Noblest Pursuit of Knowledge',
      reads: 891
    },
    {
      arabic: 'الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ',
      text: '"This world is a prison for the believer and a paradise for the disbeliever."',
      meta: 'Narrated by Abu Huraira (RA) — ',
      source: 'Sahih Muslim 2956',
      category: 'Faith & Belief',
      title: 'Perspective on This World',
      reads: 654
    }
  ];

  /* ── Hadith of the Day — pick by day-of-year so it changes daily ── */
  (function renderDailyCard() {
    var now   = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var doy   = Math.floor((now - start) / 86400000);
    var h     = FEATURED[doy % FEATURED.length];

    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    document.getElementById('fcDailyDate').textContent   = now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
    document.getElementById('fcDailyTitle').textContent  = h.title || '';
    document.getElementById('fcDailyText').textContent   = h.text;
    document.getElementById('fcDailyArabic').textContent = h.arabic;
    document.getElementById('fcDailyMeta').textContent   = h.meta;
    document.getElementById('fcDailySource').textContent = h.source;
    document.getElementById('fcDailyCat').textContent    = h.category;
  })();

  /* ── Most Read — highest reads count ── */
  (function renderPopularCard() {
    var popular = FEATURED.slice().sort(function(a, b) { return (b.reads || 0) - (a.reads || 0); })[0];

    document.getElementById('fcPopularText').textContent   = popular.text;
    document.getElementById('fcPopularArabic').textContent = popular.arabic;
    document.getElementById('fcPopularMeta').textContent   = popular.meta;
    document.getElementById('fcPopularSource').textContent = popular.source;
    document.getElementById('fcPopularCat').textContent    = popular.category;

    // Animate read count counter
    var target  = popular.reads || 0;
    var el      = document.getElementById('fcReadsNum');
    var current = 0;
    var step    = Math.max(1, Math.floor(target / 60));
    var timer   = setInterval(function() {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = current.toLocaleString();
    }, 20);
  })();

  /* ────────────────────────────────────────────
     SEARCH & FILTER
  ──────────────────────────────────────────── */
  const CATEGORIES = [
    'Faith & Belief', 'Character & Conduct', 'Prayer & Worship',
    'Family & Relations', 'Knowledge & Learning', 'Patience & Gratitude',
    'Charity & Generosity', 'Honesty & Truthfulness', 'Repentance & Forgiveness',
    'Health & Body', 'Neighbours & Community', 'Death & Afterlife',
    'Remembrance of Allah', 'Wealth & Livelihood', 'Justice & Fairness',
    'Intentions & Actions', 'Fasting & Ramadan', 'Humility & Pride',
    'Love & Brotherhood', 'Supplication & Dua', 'Trust & Reliance on Allah'
  ];

  const searchInput    = document.getElementById('searchInput');
  const searchDropdown = document.getElementById('searchDropdown');
  const searchBtn      = document.getElementById('searchBtn');
  const allTags        = document.querySelectorAll('.most-viewed-tags .tag');
  const allCards       = document.querySelectorAll('.card');
  let   activeIndex    = -1;

  function filterCategories(query) {
    const q = query.trim().toLowerCase();
    return q === '' ? CATEGORIES : CATEGORIES.filter(c => c.toLowerCase().includes(q));
  }

  function renderDropdown(matches) {
    searchDropdown.innerHTML = matches.length === 0
      ? '<p class="dropdown-empty">No categories found</p>'
      : matches.map((m, i) =>
          `<button class="dropdown-item" data-value="${m}" data-index="${i}" role="option">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            ${m}
          </button>`
        ).join('');
    activeIndex = -1;
  }

  function openDropdown(query) {
    renderDropdown(filterCategories(query));
    searchDropdown.classList.add('open');
  }

  function closeDropdown() {
    searchDropdown.classList.remove('open');
    activeIndex = -1;
  }

  function applyFilter(value) {
    const q = value.trim().toLowerCase();
    // Filter tags
    allTags.forEach(tag => {
      const match = q === '' || tag.textContent.trim().toLowerCase().includes(q);
      tag.style.display     = match ? '' : 'none';
      tag.classList.toggle('active', match && q !== '');
    });
    // Filter cards
    allCards.forEach(card => {
      const catEl  = card.querySelector('.card-category');
      const titleEl = card.querySelector('h3');
      const descEl  = card.querySelector('.card-desc');
      const subcats = Array.from(card.querySelectorAll('.subcat')).map(s => s.textContent.toLowerCase());
      const catText = catEl ? catEl.textContent.toLowerCase() : '';
      const titleText = titleEl ? titleEl.textContent.toLowerCase() : '';
      const descText  = descEl  ? descEl.textContent.toLowerCase()  : '';
      const match = q === '' ||
        catText.includes(q) ||
        titleText.includes(q) ||
        descText.includes(q) ||
        subcats.some(s => s.includes(q));
      card.style.display = match ? '' : 'none';
    });
  }

  searchInput.addEventListener('input', () => {
    const val = searchInput.value;
    applyFilter(val);
    val.trim() === '' ? closeDropdown() : openDropdown(val);
  });

  searchInput.addEventListener('keydown', e => {
    const items = searchDropdown.querySelectorAll('.dropdown-item');
    if (!items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, items.length - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) { searchInput.value = items[activeIndex].dataset.value; applyFilter(searchInput.value); }
      else applyFilter(searchInput.value);
      closeDropdown(); return;
    } else if (e.key === 'Escape') { closeDropdown(); return; }
    items.forEach((item, i) => item.classList.toggle('active', i === activeIndex));
    if (activeIndex >= 0) items[activeIndex].scrollIntoView({ block: 'nearest' });
  });

  searchDropdown.addEventListener('mousedown', e => {
    const item = e.target.closest('.dropdown-item');
    if (!item) return;
    e.preventDefault();
    searchInput.value = item.dataset.value;
    applyFilter(searchInput.value);
    closeDropdown();
  });

  searchBtn.addEventListener('click', () => { applyFilter(searchInput.value); closeDropdown(); });

  document.addEventListener('click', e => {
    if (!e.target.closest('.search-wrap')) closeDropdown();
  });

  /* ── Most Viewed Scroll ── */
  const mvTags = document.getElementById('mvTags');
  const mvPrev = document.getElementById('mvPrev');
  const mvNext = document.getElementById('mvNext');
  const MV_STEP = 200;

  function updateMvArrows() {
    mvPrev.disabled = mvTags.scrollLeft <= 0;
    mvNext.disabled = mvTags.scrollLeft + mvTags.clientWidth >= mvTags.scrollWidth - 1;
  }

  mvPrev.addEventListener('click', () => { mvTags.scrollBy({ left: -MV_STEP, behavior: 'smooth' }); });
  mvNext.addEventListener('click', () => { mvTags.scrollBy({ left:  MV_STEP, behavior: 'smooth' }); });
  mvTags.addEventListener('scroll', updateMvArrows);
  updateMvArrows();

  /* ── Rehydrate Most Viewed pills from live Supabase categories ──
     The hardcoded pills (book-2, book-3, book-8, book-30, book-78,
     tawheed) are a safe fallback. Once TH.init() resolves we replace
     them with the full real category list so every pill links to an
     actual book and displays the real title. If Supabase is down,
     the hardcoded fallback pills stay on screen. */
  if (window.TH && typeof TH.init === 'function') {
    TH.init().then(() => {
      if (!Array.isArray(TH.categories) || TH.categories.length === 0) return;

      /* Prefer meaningful pills: skip books with zero hadiths, cap at 18
         so the pill bar doesn't overflow on mobile. */
      const pool = TH.categories
        .filter(c => (c.count == null) || c.count > 0)
        .slice(0, 18);

      if (pool.length === 0) return;

      mvTags.innerHTML = pool.map(c => {
        const slug = c.slug || ('book-' + c.bookNumber);
        const title = (c.title || c.h1 || ('Book ' + c.bookNumber))
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return '<a href="category.html?cat=' + encodeURIComponent(slug) +
               '" class="tag" data-book="' + c.bookNumber + '">' + title + '</a>';
      }).join('');

      /* Recalculate arrow state now that content changed */
      updateMvArrows();
    }).catch(() => { /* silent: keep fallback pills */ });
  }

  /* ────────────────────────────────────────────
     CATEGORIES CAROUSEL — dynamic from Supabase
  ──────────────────────────────────────────── */
  const track    = document.getElementById('cardsTrack');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('carouselDots');
  const PER_PAGE = 6;
  let   cardEls  = [];
  let   current  = 0;

  function buildDots(total) {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const d = document.createElement('span');
      d.className = 'carousel-dot' + (i === current ? ' active' : '');
      d.setAttribute('aria-label', 'Page ' + (i + 1));
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  function goTo(page) {
    const total = Math.ceil(cardEls.length / PER_PAGE);
    track.classList.add('fading');
    setTimeout(() => {
      current = Math.max(0, Math.min(page, total - 1));
      const start = current * PER_PAGE;
      cardEls.forEach((c, i) => {
        c.style.display = (i >= start && i < start + PER_PAGE) ? '' : 'none';
      });
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === total - 1;
      dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) =>
        d.classList.toggle('active', i === current)
      );
      track.classList.remove('fading');
    }, 150);
  }

  function buildCategoryCards(cats) {
    track.innerHTML = '';
    cats.forEach((cat, i) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.animationDelay = Math.min(i * 0.06, 0.5) + 's';

      const arabic  = (cat.arabicTitle && cat.arabicTitle !== cat.title)
        ? '<span class="card-arabic">' + cat.arabicTitle + '</span>' : '';
      const desc    = cat.desc || 'Explore authentic hadith in this category.';
      const slug    = cat.slug;

      card.innerHTML =
        '<div class="card-inner">' +
          '<div class="card-top">' +
            '<span class="card-count-pill">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true">' +
                '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>' +
                '<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' +
              '</svg>' +
              cat.count + ' Hadith' +
            '</span>' +
            arabic +
          '</div>' +
          '<h3>' + cat.title + '</h3>' +
          '<p class="card-desc">' + desc + '</p>' +
          '<div class="card-footer">' +
            '<span class="card-explore">Explore</span>' +
            '<div class="card-arrow" aria-hidden="true">' +
              '<svg viewBox="0 0 24 24">' +
                '<line x1="5" y1="12" x2="19" y2="12"/>' +
                '<polyline points="12 5 19 12 12 19"/>' +
              '</svg>' +
            '</div>' +
          '</div>' +
        '</div>';

      card.addEventListener('click', () => { window.location.href = 'category.html?cat=' + slug; });
      track.appendChild(card);
    });
    cardEls = Array.from(track.querySelectorAll('.card'));
    buildDots(Math.ceil(cardEls.length / PER_PAGE));
    current = 0;
    goTo(0);
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  if (window.TH && typeof TH.init === 'function') {
    TH.init().then(function() {
      if (TH.categories && TH.categories.length > 0) {
        buildCategoryCards(TH.categories);
      }
    }).catch(function() {
      track.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px 0;grid-column:1/-1">Could not load categories. Please refresh.</p>';
    });
  }

  /* ────────────────────────────────────────────
     SHARE MODAL
  ──────────────────────────────────────────── */
  const shareModal  = document.getElementById('shareModal');
  const modalClose  = document.getElementById('modalClose');
  const shareCanvas = document.getElementById('shareCanvas');

  let currentHadith = null;

  function openShareModal(hadith) {
    currentHadith = hadith;
    document.getElementById('modalArabic').textContent = hadith.arabic;
    document.getElementById('modalText').textContent   = hadith.text;
    const meta = document.getElementById('modalMeta');
    meta.innerHTML = hadith.meta + '<strong>' + hadith.source + '</strong>';
    shareModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeShareModal() {
    shareModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeShareModal);
  shareModal.addEventListener('click', e => { if (e.target === shareModal) closeShareModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeShareModal(); });

  // Share as text
  function doShareText(hadith) {
    const text =
      hadith.arabic + '\n\n' +
      hadith.text + '\n\n' +
      hadith.meta + hadith.source + '\n\n' +
      '— Shared via Timeless Hadith | timelesshadith.com';
    if (navigator.share) {
      navigator.share({ title: 'Timeless Hadith', text: text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert('Hadith copied to clipboard!');
      }).catch(() => {
        prompt('Copy this hadith:', text);
      });
    } else {
      prompt('Copy this hadith:', text);
    }
  }

  // Share as image using Canvas
  function doShareImage(hadith) {
    const isDark = html.getAttribute('data-theme') === 'dark';
    const W = 1200, H = 630;
    shareCanvas.width  = W;
    shareCanvas.height = H;
    const ctx = shareCanvas.getContext('2d');

    // Background
    ctx.fillStyle = isDark ? '#000000' : '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Left accent bar
    ctx.fillStyle = isDark ? '#4f72f8' : '#4f72f8';
    ctx.fillRect(0, 0, 8, H);

    // Decorative top-right gradient
    const grad = ctx.createRadialGradient(W, 0, 0, W, 0, 500);
    grad.addColorStop(0, isDark ? 'rgba(var(--accent-raw),0.08)' : 'rgba(var(--accent-raw),0.06)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Brand mark
    ctx.fillStyle = isDark ? '#4f72f8' : '#4f72f8';
    ctx.font      = 'bold 14px -apple-system, Helvetica, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('TIMELESS HADITH', 64, 60);

    // Category badge
    ctx.fillStyle = isDark ? 'rgba(var(--accent-raw),0.15)' : 'rgba(var(--accent-raw),0.08)';
    const badgeW = ctx.measureText(hadith.category).width + 32;
    roundRect(ctx, 64, 80, badgeW, 28, 14);
    ctx.fill();
    ctx.fillStyle = isDark ? '#4f72f8' : '#4f72f8';
    ctx.font      = '500 13px -apple-system, Helvetica, Arial, sans-serif';
    ctx.fillText(hadith.category, 80, 99);

    // Arabic text (RTL)
    ctx.fillStyle = isDark ? '#f5f5f7' : '#1d1d1f';
    ctx.font      = 'bold 32px serif';
    ctx.textAlign = 'right';
    const arabicLines = wrapText(ctx, hadith.arabic, W - 120, 'bold 32px serif');
    arabicLines.forEach((line, i) => {
      ctx.fillText(line, W - 64, 160 + i * 50);
    });

    // English text
    ctx.fillStyle = isDark ? '#e0e0e0' : '#3d3d3f';
    ctx.font      = 'normal 24px -apple-system, Helvetica, Arial, sans-serif';
    ctx.textAlign = 'left';
    const textLines = wrapText(ctx, hadith.text, W - 128, 'normal 24px -apple-system, Helvetica, Arial, sans-serif');
    const startY    = 160 + arabicLines.length * 50 + 40;
    textLines.forEach((line, i) => {
      ctx.fillText(line, 64, startY + i * 40);
    });

    // Source
    ctx.fillStyle = isDark ? '#98989d' : '#6e6e73';
    ctx.font      = '500 17px -apple-system, Helvetica, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(hadith.meta + hadith.source, 64, H - 80);

    // Bottom URL
    ctx.fillStyle = isDark ? '#3a3a3c' : '#d2d2d7';
    ctx.fillRect(64, H - 56, W - 128, 1);
    ctx.fillStyle = isDark ? '#6e6e73' : '#8a8a8e';
    ctx.font      = '13px -apple-system, Helvetica, Arial, sans-serif';
    ctx.fillText('timelesshadith.com', 64, H - 32);

    // Download
    const dataURL = shareCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href     = dataURL;
    a.download = 'hadith-' + Date.now() + '.png';
    a.click();
  }

  // Canvas helpers
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function wrapText(ctx, text, maxW, font) {
    ctx.font = font;
    const words = text.split(' ');
    const lines = [];
    let current = '';
    for (const word of words) {
      const test = current ? current + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  // Featured share buttons — removed with old carousel UI

  // Modal share buttons
  document.getElementById('shareAsText').addEventListener('click', () => {
    doShareText(currentHadith);
  });
  document.getElementById('shareAsImage').addEventListener('click', () => {
    doShareImage(currentHadith);
  });

})();

/* ────────────────────────────────────────────
   AI SEARCH CARD WIRING (front-end only)
──────────────────────────────────────────── */
(function () {
  var input   = document.getElementById('aiSearchInput');
  var chips   = document.querySelectorAll('.ai-example');
  var sendBtn = document.getElementById('aiSendBtn');
  var toast   = document.getElementById('aiToast');
  if (!input || !sendBtn) return;

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      input.value = chip.textContent.trim();
      input.focus();
      handleSubmit();
    });
  });

  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('visible');
    }, 4200);
  }

  function handleSubmit() {
    var q = (input.value || '').trim();
    if (!q) { input.focus(); return; }

    if (window.TH_AI && typeof window.TH_AI.ask === 'function') {
      window.TH_AI.ask(q);
      input.value = '';
    } else {
      showToast('AI search is not ready yet — please try again in a moment.');
    }
  }

  sendBtn.addEventListener('click', handleSubmit);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
  });
})();
