/* Timeless Hadith — early theme bootstrap.
 * Must run synchronously before first paint to prevent a flash of the
 * wrong theme. Light is the default for first-time visitors.
 *
 * A one-time migration (th_theme_default_v3) resets any legacy forced-dark
 * preference so returning visitors land on the new light default.
 * After that, the user's explicit toggle choice is fully respected.
 *
 * Do not defer this script.
 */
(function () {
  try {
    var MIGRATION_KEY = 'th_theme_default_v3';
    var migrated = localStorage.getItem(MIGRATION_KEY);
    if (!migrated) {
      // One-time: clear any forced dark preference from the previous era.
      try { localStorage.removeItem('th_theme'); } catch (_) {}
      localStorage.setItem(MIGRATION_KEY, '1');
    }
    var saved = localStorage.getItem('th_theme');
    document.documentElement.setAttribute('data-theme', saved || 'light');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
