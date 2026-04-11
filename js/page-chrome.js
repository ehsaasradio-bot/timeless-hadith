/* Timeless Hadith — shared page chrome wiring (theme toggle, hamburger).
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
})();
