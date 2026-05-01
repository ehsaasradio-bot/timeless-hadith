/* Timeless Hadith — categories page wiring. Extracted from inline script. */
(function() {
  'use strict';

  /* ── Theme toggle ── */
  var html = document.documentElement;
  function setTheme(t) {
    html.setAttribute('data-theme', t);
    localStorage.setItem('th_theme', t);
  }
  function toggleTheme() {
    setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  }
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  if (document.getElementById('themeToggleDrawer'))
    document.getElementById('themeToggleDrawer').addEventListener('click', toggleTheme);

  /* ── Hamburger ── */
  var burger = document.getElementById('hamburger');
  var drawer = document.getElementById('navDrawer');
  burger.addEventListener('click', function() {
    drawer.classList.toggle('open');
    burger.setAttribute('aria-expanded', drawer.classList.contains('open'));
  });

  /* ── Pagination state ── */
  var PER_PAGE = 9;
  var currentPage = 0;
  var allCats = [];
  var filteredCats = [];

  /* ══════════════════════════════════════════════════════
     CATEGORY DATA — load from th_cat_data, migrate from
     th_cat_descriptions if present (backward compat).
  ══════════════════════════════════════════════════════ */
  var catData = {};

  function loadCatData() {
    try {
      var newRaw = localStorage.getItem('th_cat_data');
      if (newRaw) {
        catData = JSON.parse(newRaw);
        return;
      }
      /* Migrate from old schema */
      var oldRaw = localStorage.getItem('th_cat_descriptions');
      if (oldRaw) {
        var oldParsed = JSON.parse(oldRaw);
        var migrated = {};
        Object.keys(oldParsed).forEach(function(slug) {
          migrated[slug] = { description: oldParsed[slug] };
        });
        catData = migrated;
        localStorage.setItem('th_cat_data', JSON.stringify(migrated));
      }
    } catch (e) {}
  }
  loadCatData();

  /* ── Helpers ── */
  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function hexToRgba(hex, alpha) {
    if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return null;
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  /* Default icon map — keyed by slug keywords */
  var ICON_MAP = {
    prayer: '\uD83E\uDD32', salat: '\uD83E\uDD32', dua: '\uD83E\uDD32',
    faith: '\u262A', iman: '\u262A', tawheed: '\u262A', belief: '\u262A',
    purification: '\uD83D\uDCA7', tahara: '\uD83D\uDCA7', wudu: '\uD83D\uDCA7',
    zakat: '\uD83D\uDCB0', charity: '\uD83D\uDCB0', sadaqah: '\uD83D\uDCB0',
    fasting: '\uD83C\uDF19', ramadan: '\uD83C\uDF19', sawm: '\uD83C\uDF19',
    hajj: '\uD83D\uDD4B', pilgrimage: '\uD83D\uDD4B', mecca: '\uD83D\uDD4B',
    quran: '\uD83D\uDCD6', recitation: '\uD83D\uDCD6',
    knowledge: '\uD83D\uDCDA', learning: '\uD83D\uDCDA', education: '\uD83D\uDCDA',
    character: '\u2B50', manners: '\u2B50', akhlaq: '\u2B50', etiquette: '\u2B50',
    family: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67', marriage: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67', children: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67',
    business: '\uD83E\uDD1D', trade: '\uD83E\uDD1D', finance: '\uD83E\uDD1D',
    governance: '\u2696', justice: '\u2696', leadership: '\u2696',
    jihad: '\uD83D\uDEE1', striving: '\uD83D\uDEE1',
    paradise: '\u2728', heaven: '\u2728', jannah: '\u2728',
    death: '\uD83C\uDF3F', afterlife: '\uD83C\uDF3F', grave: '\uD83C\uDF3F',
    food: '\uD83C\uDF7D', drink: '\uD83C\uDF7D', eating: '\uD83C\uDF7D',
    medicine: '\uD83C\uDF3F', health: '\uD83C\uDF3F', healing: '\uD83C\uDF3F',
    dream: '\uD83C\uDF19', travel: '\uD83E\uDDED', journey: '\uD83E\uDDED',
    remembrance: '\uD83D\uDCAB', dhikr: '\uD83D\uDCAB', tasbih: '\uD83D\uDCAB'
  };

  function defaultIcon(slug) {
    var s = (slug || '').toLowerCase();
    for (var k in ICON_MAP) {
      if (s.indexOf(k) !== -1) return ICON_MAP[k];
    }
    return '\uD83D\uDCFF';
  }

  /* ── Sort categories: sort_order ASC (nulls last) → featured → alpha ── */
  function sortCats(cats) {
    return cats.slice().sort(function(a, b) {
      var da = catData[a.slug] || {};
      var db = catData[b.slug] || {};

      var soA = (da.sort_order !== undefined && da.sort_order !== '')
        ? Number(da.sort_order) : Infinity;
      var soB = (db.sort_order !== undefined && db.sort_order !== '')
        ? Number(db.sort_order) : Infinity;
      if (soA !== soB) return soA - soB;

      var featA = (da.is_featured === true || da.is_featured === 'true') ? 0 : 1;
      var featB = (db.is_featured === true || db.is_featured === 'true') ? 0 : 1;
      if (featA !== featB) return featA - featB;

      var tA = ((da.title || a.title || '')).toLowerCase();
      var tB = ((db.title || b.title || '')).toLowerCase();
      return tA < tB ? -1 : tA > tB ? 1 : 0;
    });
  }

  /* ── Build a category card element (glassmorphism redesign) ── */
  function buildCard(cat, index) {
    var d         = catData[cat.slug] || {};
    var delay     = Math.min(index * 0.06, 0.5);

    var title      = d.title || cat.title || '';
    var count      = (d.hadith_count !== undefined && d.hadith_count !== '')
                       ? Number(d.hadith_count) : (cat.count || 0);
    var desc       = d.description || cat.desc || 'Explore authentic hadith in this category.';
    var arabic     = cat.arabicTitle || '';
    var isFeatured = (d.is_featured === true || d.is_featured === 'true');
    var ctaText    = d.cta_text || 'Explore';

    var el = document.createElement('a');
    el.className = 'cat-card' + (isFeatured ? ' is-featured' : '');
    el.href      = 'category.html?cat=' + encodeURIComponent(cat.slug);
    el.setAttribute('role', 'listitem');
    el.setAttribute('aria-label', title + ' — ' + count + ' hadith');
    el.style.animationDelay = delay + 's';

    /* Count pill HTML */
    var countPillHtml =
      '<span class="cat-card-count-pill">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>' +
          '<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' +
        '</svg>' +
        count + ' Hadith' +
      '</span>';

    /* Arabic badge (only if non-empty and different from title) */
    var arabicHtml = (arabic && arabic !== title)
      ? '<span class="cat-card-arabic">' + escHtml(arabic) + '</span>'
      : (isFeatured
          ? '<span class="cat-card-feat-pill">Featured</span>'
          : '');

    el.innerHTML =
      '<div class="cat-card-inner">' +

        /* Top row */
        '<div class="cat-card-top">' +
          countPillHtml +
          arabicHtml +
        '</div>' +

        /* Title */
        '<h3 class="cat-card-title">' + escHtml(title) + '</h3>' +

        /* Description */
        '<p class="cat-card-desc">' + escHtml(desc) + '</p>' +

        /* Footer */
        '<div class="cat-card-footer">' +
          '<span class="cat-card-explore">' + escHtml(ctaText) + '</span>' +
          '<div class="cat-card-arrow" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24">' +
              '<line x1="5" y1="12" x2="19" y2="12"/>' +
              '<polyline points="12 5 19 12 12 19"/>' +
            '</svg>' +
          '</div>' +
        '</div>' +

      '</div>';

    return el;
  }

  /* ── Render current page ── */
  function renderPage() {
    var track = document.getElementById('cards-track');
    track.classList.add('fading');
    setTimeout(function() {
      track.innerHTML = '';
      var start = currentPage * PER_PAGE;
      var slice = filteredCats.slice(start, start + PER_PAGE);

      if (!slice.length) {
        track.innerHTML =
          '<div class="no-results" role="status">' +
            '<div class="no-results-icon"></div>' +
            '<h3>No topics found</h3>' +
            '<p>Try a different search term.</p>' +
          '</div>';
      } else {
        slice.forEach(function(cat, i) { track.appendChild(buildCard(cat, i)); });
      }

      track.classList.remove('fading');
      updatePagination();
    }, 200);
  }

  function updatePagination() {
    var total = filteredCats.length;
    var pages = Math.max(1, Math.ceil(total / PER_PAGE));
    var dotsWrap = document.getElementById('pagination-dots');
    var prev = document.getElementById('btn-prev');
    var next = document.getElementById('btn-next');
    var start = currentPage * PER_PAGE + 1;
    var end   = Math.min((currentPage + 1) * PER_PAGE, total);

    document.getElementById('results-note').innerHTML =
      'Showing <strong>' + (total ? start + '\u2013' + end : 0) + '</strong> of ' + total + ' topics';

    prev.disabled = (currentPage === 0);
    next.disabled = (currentPage >= pages - 1);

    dotsWrap.innerHTML = '';
    for (var i = 0; i < pages; i++) {
      (function(idx) {
        var dot = document.createElement('button');
        dot.className = 'p-dot' + (idx === currentPage ? ' active' : '');
        dot.setAttribute('role', 'listitem');
        dot.setAttribute('aria-label', 'Page ' + (idx + 1));
        if (idx === currentPage) dot.setAttribute('aria-current', 'page');
        dot.onclick = function() {
          if (idx !== currentPage) { currentPage = idx; renderPage(); }
        };
        dotsWrap.appendChild(dot);
      })(i);
    }

    var pag = document.getElementById('pagination');
    pag.style.display = (pages <= 1 && total <= PER_PAGE) ? 'none' : 'flex';
  }

  function applySearch(q) {
    q = q.trim().toLowerCase();
    if (!q) {
      filteredCats = sortCats(allCats);
    } else {
      filteredCats = allCats.filter(function(cat) {
        var d = catData[cat.slug] || {};
        return (cat.title || '').toLowerCase().indexOf(q) !== -1 ||
               cat.slug.replace(/-/g, ' ').toLowerCase().indexOf(q) !== -1 ||
               (cat.arabicTitle || '').indexOf(q) !== -1 ||
               (cat.keywords || []).join(' ').toLowerCase().indexOf(q) !== -1 ||
               (d.description || '').toLowerCase().indexOf(q) !== -1 ||
               (d.tag || '').toLowerCase().indexOf(q) !== -1 ||
               (typeof PILLS !== 'undefined' && PILLS[cat.slug] || []).join(' ').toLowerCase().indexOf(q) !== -1;
      });
    }
    currentPage = 0;
    renderPage();
  }

  function changePage(dir) {
    var pages = Math.ceil(filteredCats.length / PER_PAGE);
    var next = currentPage + dir;
    if (next >= 0 && next < pages) {
      currentPage = next;
      renderPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /* expose for inline nav buttons */
  window.changePage = changePage;

  document.addEventListener('DOMContentLoaded', function() {
    var track = document.getElementById('cards-track');
    if (track) {
      track.innerHTML =
        '<div class="no-results" role="status" aria-live="polite">' +
          '<h3 style="font-size:17px;font-weight:500">Loading categories\u2026</h3>' +
        '</div>';
    }

    TH.init().then(function() {
      allCats = Object.values(TH.categories);
      filteredCats = sortCats(allCats);
      renderPage();
    }).catch(function() {
      if (track) track.innerHTML =
        '<div class="no-results" role="alert"><h3>Could not load categories</h3>' +
        '<p>Please check your connection and refresh.</p></div>';
    });

    document.getElementById('cat-search').addEventListener('input', function() {
      applySearch(this.value);
    });
    document.getElementById('cat-search').addEventListener('search', function() {
      applySearch(this.value);
    });
  });
})();
