/* Timeless Hadith — category page canonical + OG URL rewrites.
 * Must run in <head> synchronously so meta tags carry the selected topic
 * before crawlers parse the DOM.
 */
(function () {
  var cat = new URLSearchParams(window.location.search).get('cat');
  var base = 'https://timelesshadith.com/category.html';

  var canonical = document.getElementById('canonical-tag');
  if (canonical) {
    canonical.setAttribute('href', cat ? base + '?cat=' + encodeURIComponent(cat) : base);
  }

  var ogUrl = document.getElementById('og-url-tag');
  if (ogUrl && cat) {
    ogUrl.setAttribute('content', base + '?cat=' + encodeURIComponent(cat));
  }
})();
