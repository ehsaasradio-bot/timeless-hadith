/* Timeless Hadith — early theme bootstrap.
 * Must run synchronously before first paint to prevent a flash of the
 * wrong theme. Dark is the default.
 *
 * A one-time migration (th_theme_default_v2) resets legacy "light"
 * preferences from the previous light-default era so returning visitors
 * land on the new dark default. After that, the user's explicit toggle
 * choice is fully respected.
 *
 * Do not defer this script.
 */
(function () {
  try {
    var MIGRATION_KEY = 'th_theme_default_v2';
    var migrated = localStorage.getItem(MIGRATION_KEY);
    if (!migrated) {
      // One-time: clear any prior "light" choice so the new dark default applies.
      try { localStorage.removeItem('th_theme'); } catch (_) {}
      localStorage.setItem(MIGRATION_KEY, '1');
    }
    var saved = localStorage.getItem('th_theme');
    document.documentElement.setAttribute('data-theme', saved || 'dark');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
