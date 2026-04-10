/* Timeless Hadith — service worker registration.
 * Loaded with defer on every page. Fails silently if unsupported.
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
}
