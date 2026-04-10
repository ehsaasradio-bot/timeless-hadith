/* Timeless Hadith — bookmarks page wiring. Extracted from inline script. */
(function() {
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

  /* ── Cookie ── */
  var banner  = document.getElementById('cookieBanner');
  var accept  = document.getElementById('cookieAccept');
  var decline = document.getElementById('cookieDecline');
  var store = {
    get: function(k) { try { return localStorage.getItem(k); } catch(e) { return null; } },
    set: function(k,v) { try { localStorage.setItem(k,v); } catch(e) {} }
  };
  if (banner && !store.get('th_cookie_consent')) {
    setTimeout(function() { banner.classList.add('show'); }, 1500);
  }
  if (accept) accept.addEventListener('click', function() {
    store.set('th_cookie_consent','accepted');
    store.set('th_cookie_consent_date', new Date().toISOString());
    banner.classList.remove('show');
  });
  if (decline) decline.addEventListener('click', function() {
    store.set('th_cookie_consent','declined');
    store.set('th_cookie_consent_date', new Date().toISOString());
    banner.classList.remove('show');
  });

  /* ── Helper: Get hadith by ID ── */
  function _getH(id) {
    var r = TH.findHadith(id);
    return r ? r.hadith : null;
  }

  /* Toggle Quick Read / Full Read */
  function toggleFullRead(btn) {
    var wrap = btn.previousElementSibling;
    var quickRead = btn.parentElement.querySelector('.quick-read-text');
    if (wrap.style.display === 'none') {
      wrap.style.display = 'block';
      if (quickRead) quickRead.style.display = 'none';
      btn.textContent = 'Quick Read';
    } else {
      wrap.style.display = 'none';
      if (quickRead) quickRead.style.display = '';
      btn.textContent = 'Full Read';
    }
  }

  /* ── Build hadith card HTML ── */
  function buildCardHTML(h, catSlug, idx) {
    var authClass = (h.authenticity === 'Sahih') ? 'auth-sahih' : 'auth-hasan';
    var authLabel = h.authenticity || 'Hasan';
    var delay = Math.min(idx * 0.05, 0.4);
    var isLiked = typeof TH_LIKES !== 'undefined' && TH_LIKES && TH_LIKES.isLiked(h.id);
    var likeCount = typeof TH_LIKES !== 'undefined' && TH_LIKES ? TH_LIKES.getCount(h.id) : 0;

    return (
      '<div class="hadith-card" style="animation-delay:' + delay + 's">' +
        '<div class="card-actions">' +
          '<button class="card-action like-btn' + (isLiked ? ' liked' : '') + '" data-like-id="' + h.id + '" aria-label="Like" aria-pressed="' + isLiked + '" onclick="TH_LIKES&&TH_LIKES.toggle(\'' + h.id + '\',this)" title="Like"><svg viewBox="0 0 24 24" width="16" height="16" fill="' + (isLiked ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span class="like-count">' + likeCount + '</span></button>' +
          '<button class="card-action bookmarked" onclick="TH_BOOKMARKS&&TH_BOOKMARKS.toggle(\'' + h.id + '\')" title="Remove bookmark" aria-label="Remove bookmark">' +
            '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>' +
          '</button>' +
          '<button class="card-action" onclick="shareHadith(\'' + h.id + '\')" title="Share" aria-label="Share hadith">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="card-meta">' +
          '<a href="category.html?cat=' + catSlug + '" class="card-cat-link">' + (catSlug.replace(/-/g, ' ')) + '</a>' +
          '<span class="card-auth ' + authClass + '">' + authLabel + '</span>' +
        '</div>' +
        (h.quick_read
          ? '<p class="quick-read-text">\u201c' + h.quick_read + '\u201d</p>' +
            '<div class="full-read-wrap" style="display:none">' +
              '<p class="english-text">' + (h.english || '') + '</p>' +
              '<p class="arabic-text">' + (h.arabic || '') + '</p>' +
            '</div>' +
            '<button class="full-read-btn" onclick="toggleFullRead(this)">Full Read</button>'
          : '<p class="english-text">' + (h.english || '') + '</p>' +
            '<p class="arabic-text">' + (h.arabic || '') + '</p>'
        ) +
        '<div class="card-ref">' +
          '<span class="card-narrator">' + (h.narrator || '') + '</span>' +
          '<div class="card-source-pill">' +
            '<span class="card-source">' + (h.source || '') + '</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  /* ── Share hadith (image modal) ── */
  function shareHadith(id) {
    var h = _getH(id);
    if (!h) return;
    var r = TH.findHadith(id);
    var catTitle = r && r.cat ? r.cat.title : '';
    if (typeof TH_SHARE !== 'undefined' && TH_SHARE && TH_SHARE.showModal) {
      TH_SHARE.showModal(h, catTitle);
    } else if (navigator.share) {
      navigator.share({ title: 'Hadith', text: h.english });
    }
  }

  /* ── Render page ── */
  function renderPage(){
    var area = document.getElementById('content-area');
    var sub = document.getElementById('page-sub');
    var clearBtn = document.getElementById('btn-clear');
    var user = (typeof TH_AUTH !== 'undefined' && TH_AUTH) ? TH_AUTH.getUser() : null;

    if(!user){
      if (clearBtn) clearBtn.style.display = 'none';
      if (sub) sub.textContent = 'Sign in to save hadiths';
      area.innerHTML =
        '<div class="state-box" role="status">' +
          '<div class="state-icon"><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>' +
          '<p class="state-title">Sign in to see your bookmarks</p>' +
          '<p class="state-body">Your saved hadiths are linked to your account. Sign in to access them anywhere.</p>' +
          '<button class="btn-primary" onclick="TH_AUTH&&TH_AUTH.showLoginModal(\'Sign in to view your bookmarks.\')">Sign in</button>' +
          '<a href="categories.html" class="btn-secondary-link">Browse categories →</a>' +
        '</div>';
      return;
    }

    var ids = (typeof TH_BOOKMARKS !== 'undefined' && TH_BOOKMARKS) ? TH_BOOKMARKS.getAll() : [];
    var hadiths = ids.map(function(id){
      var r = TH.findHadith(id);
      return r ? r.hadith : null;
    }).filter(Boolean);

    if(!hadiths.length){
      if (clearBtn) clearBtn.style.display = 'none';
      if (sub) sub.textContent = 'No saved hadiths yet';
      area.innerHTML =
        '<div class="state-box" role="status">' +
          '<div class="state-icon"><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></div>' +
          '<p class="state-title">No bookmarks yet</p>' +
          '<p class="state-body">Tap the bookmark icon on any hadith to save it here. Your collection will grow over time.</p>' +
          '<a href="categories.html" class="btn-primary">Browse hadiths</a>' +
        '</div>';
      return;
    }

    if (clearBtn) clearBtn.style.display = 'inline-flex';
    if (sub) sub.textContent = hadiths.length + ' saved hadith' + (hadiths.length === 1 ? '' : 's');

    // Group by category slug
    // Supabase hadiths have numeric IDs — look them up in TH.hadiths cache
    // which is keyed by book slug (book-1, book-2 …).
    var groups = {}, groupOrder = [];
    hadiths.forEach(function(h){
      var matched = null;
      // Search loaded hadiths cache for this id to find its book slug
      var slugs = Object.keys(TH.hadiths);
      for (var i = 0; i < slugs.length; i++) {
        var found = TH.hadiths[slugs[i]].find(function(x){ return x.id === h.id; });
        if (found) { matched = TH.getCat(slugs[i]); break; }
      }
      var key = matched ? matched.slug : 'other';
      var label = matched ? matched.title : 'Other';
      if(!groups[key]){ groups[key] = {label:label, slug:key, items:[]}; groupOrder.push(key); }
      groups[key].items.push(h);
    });

    var html = '';
    var globalIdx = 0;
    groupOrder.forEach(function(key){
      var g = groups[key];
      html += '<p class="group-label">' + g.label + '</p>';
      html += '<div class="hadith-grid">';
      g.items.forEach(function(h){
        html += buildCardHTML(h, key, globalIdx++);
      });
      html += '</div>';
    });
    area.innerHTML = html;
    if(typeof TH_BOOKMARKS !== 'undefined' && TH_BOOKMARKS) TH_BOOKMARKS.syncPage();
  }

  /* ── Confirm clear all ── */
  function confirmClearAll(){
    if(!confirm('Remove all bookmarks? This cannot be undone.')) return;
    localStorage.removeItem('th_bookmarks');
    renderPage();
  }

  /* expose for inline onclick handlers */
  window.toggleFullRead = toggleFullRead;
  window.shareHadith = shareHadith;
  window.confirmClearAll = confirmClearAll;
  window._getH = _getH;

  /* ── Event listeners ── */
  document.addEventListener('th:login', renderPage);
  document.addEventListener('th:logout', renderPage);
  document.addEventListener('th:bookmark', renderPage);

  /* ── Initial render ── */
  renderPage();
})();
