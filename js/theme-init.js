/* Timeless Hadith — early theme bootstrap.
 * Must run synchronously before first paint to prevent a flash of the
 * wrong theme. Reads the saved preference from localStorage, falls back
 * to dark. Do not defer this script.
 */
(function () {
  try {
    var saved = localStorage.getItem('th_theme');
    document.documentElement.setAttribute('data-theme', saved || 'dark');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
