/* Timeless Hadith — category detail page wiring. Extracted from inline script. */
(function() {
  /* ── Theme & Nav ── */
  var html = document.documentElement;
  function setTheme(t) { html.setAttribute('data-theme',t); localStorage.setItem('th_theme',t); }
  document.getElementById('themeToggle').addEventListener('click', function(){ setTheme(html.getAttribute('data-theme')==='dark'?'light':'dark'); });
  if(document.getElementById('themeToggleDrawer')) document.getElementById('themeToggleDrawer').addEventListener('click', function(){ setTheme(html.getAttribute('data-theme')==='dark'?'light':'dark'); });
  var burger=document.getElementById('hamburger'), drawer=document.getElementById('navDrawer');
  burger.addEventListener('click',function(){ drawer.classList.toggle('open'); burger.setAttribute('aria-expanded',drawer.classList.contains('open')); });

  /* ── Page state ── */
  var PER_PAGE=9, currentPage=0, _authFilter='', _narFilter='', _query='';
  var _slug='', _cat=null, _hadiths=[], _filtered=[];

  function initPage() {
    var params = new URLSearchParams(window.location.search);
    _slug = params.get('cat') || '';

    /* Show loading state */
    var content = document.getElementById('main-content');
    if (content) {
      content.innerHTML =
        '<div class="no-results" role="status" aria-live="polite" style="padding:60px 0">' +
          '<h3 style="font-size:17px;font-weight:500;color:var(--ink-tertiary)">Loading hadiths…</h3>' +
        '</div>';
    }

    /* Load categories + hadiths async, then render */
    TH.init().then(function() {
      _cat = TH.getCat(_slug);
      if (!_cat) {
        document.getElementById('cat-title').textContent = 'Category not found';
        if (content) content.innerHTML =
          '<div class="no-results" role="alert"><h3>Category not found</h3>' +
          '<p><a href="categories.html">Browse all categories</a></p></div>';
        return;
      }
      /* Apply enriched SEO fields if present */
      document.title = _cat.seoTitle || (_cat.title + ' \u2014 Timeless Hadith');
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && _cat.metaDescription) metaDesc.setAttribute('content', _cat.metaDescription);
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', _cat.seoTitle || _cat.title);
      var ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc && _cat.metaDescription) ogDesc.setAttribute('content', _cat.metaDescription);

      document.getElementById('cat-title').textContent = _cat.h1 || _cat.title;
      document.getElementById('cat-desc').textContent  = _cat.contentBlock || _cat.desc;
      document.getElementById('breadcrumb-cat').textContent = _cat.title;

      return TH.loadHadiths(_slug);
    }).then(function() {
      if (!_cat) return;
      _hadiths = TH.getHadiths(_slug);
      document.getElementById('cat-count').textContent   = _hadiths.length || _cat.count || '0';
      document.getElementById('total-count').textContent = _hadiths.length;
      buildNarratorChips();
      applyFilters();
    }).catch(function(err) {
      console.error('[TH] initPage error:', err);
      if (content) content.innerHTML =
        '<div class="no-results" role="alert"><h3>Could not load hadiths</h3>' +
        '<p>Please check your connection and refresh.</p></div>';
    });
  }

  /* Only show these five narrators as filter chips */
  var ALLOWED_NARRATORS = [
    'Abu Huraira',
    'Abdullah ibn Umar',
    'Anas ibn Malik',
    'Aisha bint Abu Bakr',
    'Abdullah ibn Abbas'
  ];

  function buildNarratorChips() {
    var wrap=document.getElementById('narrator-chips');
    wrap.innerHTML='';
    var allBtn=document.createElement('button');
    allBtn.className='filter-pill active'; allBtn.dataset.nar=''; allBtn.textContent='All';
    allBtn.onclick=function(){setNarFilter(allBtn,'');};
    wrap.appendChild(allBtn);
    ALLOWED_NARRATORS.forEach(function(nar){
      /* Only show chip if this narrator exists in the current hadiths */
      var exists=_hadiths.some(function(h){ return h.narrator===nar; });
      if(!exists) return;
      var btn=document.createElement('button');
      btn.className='filter-pill'; btn.dataset.nar=nar;
      btn.textContent=nar; btn.title=nar;
      btn.onclick=function(){setNarFilter(btn,nar);};
      wrap.appendChild(btn);
    });
  }

  function setAuthFilter(btn,val) {
    _authFilter=val; currentPage=0;
    document.querySelectorAll('[data-auth]').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active'); applyFilters();
  }
  function setNarFilter(btn,val) {
    _narFilter=val; currentPage=0;
    document.querySelectorAll('[data-nar]').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active'); applyFilters();
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

  document.addEventListener('DOMContentLoaded',function(){
    var hs = document.getElementById('hadith-search');
    if (hs) hs.addEventListener('input',function(){
      _query=this.value.trim().toLowerCase(); currentPage=0; applyFilters();
    });
  });

  function applyFilters() {
    _filtered=_hadiths.filter(function(h){
      if(_authFilter && h.authenticity!==_authFilter) return false;
      if(_narFilter  && h.narrator!==_narFilter)      return false;
      if(_query){ var hay=[h.english,h.arabic,h.narrator,h.source,h.subcategory].join(' ').toLowerCase(); if(hay.indexOf(_query)===-1) return false; }
      return true;
    });
    /* Honour deep-link ?h=<id> — jump to the page that contains it */
    var deepId = new URLSearchParams(window.location.search).get('h');
    if (deepId) {
      for (var i=0;i<_filtered.length;i++) {
        if (_filtered[i].id === deepId) {
          currentPage = Math.floor(i / PER_PAGE);
          break;
        }
      }
    }
    renderPage();
    if (deepId) {
      /* Wait for card DOM to exist, then scroll + highlight */
      setTimeout(function(){
        var target = document.getElementById('h-' + deepId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          target.classList.add('hadith-card-flash');
          setTimeout(function(){ target.classList.remove('hadith-card-flash'); }, 2400);
        }
      }, 260);
    }
  }

  function authCls(a){ return a==='Sahih'?'auth-sahih':a==='Hasan'?'auth-hasan':''; }
  /* Helper: get raw hadith object by id (unwrap findHadith wrapper) */
  function _getH(id){ var r=TH.findHadith(id); return r?r.hadith:null; }

  function buildCard(h, i) {
    var card=document.createElement('article');
    card.className='hadith-card';
    card.id='h-'+h.id;
    card.setAttribute('data-hadith-id', h.id);
    card.style.animationDelay=Math.min(i*0.06,0.5)+'s';
    var isBm=typeof TH_BOOKMARKS!=='undefined' && TH_BOOKMARKS && TH_BOOKMARKS.has(h.id);
    var catTitle=_cat?_cat.title:'';
    var isLiked=typeof TH_LIKES!=='undefined' && TH_LIKES && TH_LIKES.isLiked(h.id);
    var likeCount=typeof TH_LIKES!=='undefined' && TH_LIKES ? TH_LIKES.getCount(h.id) : 0;
    card.innerHTML=
      '<div class="card-actions" role="group" aria-label="Actions">'+
        '<button class="card-action like-btn'+(isLiked?' liked':'')+'" data-like-id="'+h.id+'" aria-label="Like" aria-pressed="'+isLiked+'" onclick="TH_LIKES&&TH_LIKES.toggle(\''+h.id+'\',this)" title="Like"><svg viewBox="0 0 24 24" width="16" height="16" fill="'+(isLiked?'currentColor':'none')+'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span class="like-count">'+likeCount+'</span></button>'+
        '<button class="card-action'+(isBm?' bookmarked':'')+'" data-bookmark-id="'+h.id+'" aria-label="'+(isBm?'Remove bookmark':'Bookmark')+'" aria-pressed="'+isBm+'" onclick="TH_BOOKMARKS&&TH_BOOKMARKS.toggle(\''+h.id+'\',this)" title="Bookmark"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>'+
        '<button class="card-action" aria-label="Share as image" title="Share" onclick="TH_SHARE&&TH_SHARE.showModal(_getH(\''+h.id+'\'),\''+catTitle.replace(/\'/g,"\\\'")+'\')"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button>'+
      '</div>'+
      '<div class="card-meta">'+
        (h.subcategory?'<span class="card-subcat">'+h.subcategory+'</span>':'')+
        (h.authenticity&&authCls(h.authenticity)?'<span class="card-auth '+authCls(h.authenticity)+'">'+h.authenticity+'</span>':'')+
      '</div>'+
      (h.quick_read
        ? '<p class="quick-read-text">&#8220;'+h.quick_read+'&#8221;</p>'+
          '<div class="full-read-wrap" style="display:none">'+
            '<p class="english-text">&#8220;'+(h.english||'')+'&#8221;</p>'+
            '<p class="arabic-text" lang="ar" dir="rtl">'+(h.arabic||'')+'</p>'+
          '</div>'+
          '<button class="full-read-btn" onclick="toggleFullRead(this)">Full Read</button>'
        : '<p class="english-text">&#8220;'+(h.english||'')+'&#8221;</p>'+
          '<p class="arabic-text" lang="ar" dir="rtl">'+(h.arabic||'')+'</p>'
      )+
      '<div class="card-ref">'+
        '<span class="card-narrator">'+(h.narrator?'Narrated by <strong>'+h.narrator+'</strong>':''  )+'</span>'+
        '<div class="card-source-pill">'+
          '<span class="card-source">'+(h.source||'')+(h.number?' #'+h.number:'')+'</span>'+
          '<button class="share-text-btn" onclick="TH_SHARE_TEXT&&TH_SHARE_TEXT.share(_getH(\''+h.id+'\'),\''+catTitle.replace(/\'/g,"\\\'")+'\')">↗ Share</button>'+
        '</div>'+
      '</div>'+
      '<button class="urdu-trans-btn" aria-label="Urdu translation">اردو ترجمہ</button>'+
      '<div class="urdu-inline-body">'+
        '<div class="urdu-inline-inner">'+
          '<div class="urdu-inline-label">اردو ترجمہ</div>'+
          (h.urdu
            ? '<p class="urdu-inline-text">'+h.urdu+'</p>'
            : '<p class="urdu-inline-empty">اردو ترجمہ جلد دستیاب ہوگا</p>'
          )+
        '</div>'+
      '</div>';
    return card;
  }

  function renderPage() {
    var list=document.getElementById('main-content');
    list.classList.add('fading');
    setTimeout(function(){
      list.innerHTML='';
      var start=currentPage*PER_PAGE, slice=_filtered.slice(start,start+PER_PAGE);
      if(!slice.length){
        var d=document.createElement('div'); d.className='no-results'; d.setAttribute('role','status');
        d.innerHTML='<h3>No hadiths found</h3><p>Try adjusting your search or filters.</p>';
        list.appendChild(d);
      } else {
        slice.forEach(function(h,i){ list.appendChild(buildCard(h,i)); });
      }
      list.classList.remove('fading');
      updatePagination();
      renderInternalLinks();
      if(typeof TH_BOOKMARKS!=='undefined' && TH_BOOKMARKS) TH_BOOKMARKS.syncPage();
    },180);
  }

  /* ── Internal link block: render every hadith in the category
     as a crawlable <a href="?cat=X&h=ID">...</a> so search engines
     can discover every permalink. Only shown when no filters are
     active, to keep filtered views clean. ── */
  function renderInternalLinks() {
    var host = document.getElementById('hadith-index-block');
    if (!host) return;
    if (_authFilter || _narFilter || _query) { host.style.display = 'none'; return; }
    if (!_hadiths || !_hadiths.length) { host.style.display = 'none'; return; }
    host.style.display = '';
    var parts = ['<h2 class="hadith-index-title">All hadiths in ' + (_cat ? _cat.title : '') + '</h2>',
                 '<p class="hadith-index-sub">Jump to any hadith. Each link is a stable permalink.</p>',
                 '<ul class="hadith-index-list">'];
    for (var i=0;i<_hadiths.length;i++) {
      var h = _hadiths[i];
      var label = h.number ? ('#' + h.number + ' \u00b7 ' + (h.source || '')) :
                  ('Hadith ' + (i+1));
      var href = 'category.html?cat=' + encodeURIComponent(_slug) + '&h=' + encodeURIComponent(h.id);
      parts.push('<li><a href="' + href + '" rel="bookmark">' + label + '</a></li>');
    }
    parts.push('</ul>');
    host.innerHTML = parts.join('');
  }

  function updatePagination() {
    var total=_filtered.length, pages=Math.max(1,Math.ceil(total/PER_PAGE));
    var start=currentPage*PER_PAGE+1, end=Math.min((currentPage+1)*PER_PAGE,total);
    document.getElementById('showing-range').textContent=total?start+'\u2013'+end:'0';
    document.getElementById('total-count').textContent=total;
    document.getElementById('btn-prev').disabled=(currentPage===0);
    document.getElementById('btn-next').disabled=(currentPage>=pages-1);
    var dots=document.getElementById('pagination-dots');
    dots.innerHTML='';
    for(var i=0;i<pages;i++){
      (function(idx){
        var dot=document.createElement('button');
        dot.className='p-dot'+(idx===currentPage?' active':'');
        dot.setAttribute('role','listitem');
        dot.setAttribute('aria-label','Page '+(idx+1));
        if(idx===currentPage) dot.setAttribute('aria-current','page');
        dot.onclick=function(){ if(idx!==currentPage){ currentPage=idx; renderPage(); } };
        dots.appendChild(dot);
      })(i);
    }
    var pag=document.getElementById('pagination');
    pag.style.display=(pages<=1&&total<=PER_PAGE)?'none':'flex';
  }

  function changePage(dir) {
    var pages=Math.max(1,Math.ceil(_filtered.length/PER_PAGE));
    var next=currentPage+dir;
    if(next>=0&&next<pages){ currentPage=next; renderPage(); window.scrollTo({top:0,behavior:'smooth'}); }
  }

  /* expose for inline event handlers and nav controls */
  window.setAuthFilter = setAuthFilter;
  window.setNarFilter  = setNarFilter;
  window.toggleFullRead = toggleFullRead;
  window.changePage = changePage;
  window._getH = _getH;

  initPage();
})();
