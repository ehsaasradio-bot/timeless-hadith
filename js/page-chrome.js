/* Timeless Hadith — shared page chrome wiring (theme toggle, hamburger, cookie banner).
 * Used by static pages: about, privacy, terms.
 */
(function () {
  var html = document.documentElement;

  /* ── Theme toggle ── */
  function setTheme(t) {
    html.setAttribute('data-theme', t);
    try { localStorage.setItem('th_theme', t); } catch (e) {}
  }
  function toggleTheme() {
    setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  }
  var t1 = document.getElementById('themeToggle');
  if (t1) t1.addEventListener('click', toggleTheme);
  var t2 = document.getElementById('themeToggleDrawer');
  if (t2) t2.addEventListener('click', toggleTheme);

  /* ── Hamburger ── */
  var burger = document.getElementById('hamburger');
  var drawer = document.getElementById('navDrawer');
  if (burger && drawer) {
    burger.addEventListener('click', function () {
      drawer.classList.toggle('open');
      burger.setAttribute('aria-expanded', drawer.classList.contains('open'));
    });
  }

  /* ── Cookie banner ── */
  var banner  = document.getElementById('cookieBanner');
  var accept  = document.getElementById('cookieAccept');
  var decline = document.getElementById('cookieDecline');
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  if (banner && !store.get('th_cookie_consent')) {
    setTimeout(function () { banner.classList.add('show'); }, 1500);
  }
  if (accept) accept.addEventListener('click', function () {
    store.set('th_cookie_consent', 'accepted');
    store.set('th_cookie_consent_date', new Date().toISOString());
    if (banner) banner.classList.remove('show');
  });
  if (decline) decline.addEventListener('click', function () {
    store.set('th_cookie_consent', 'declined');
    if (banner) banner.classList.remove('show');
  });
})();
