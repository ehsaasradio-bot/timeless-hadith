/* ─────────────────────────────────────────────────────────────────
 * Timeless Hadith — Google Analytics 4
 *
 * SETUP: Replace G-XXXXXXXXXX with your GA4 Measurement ID.
 *   1. Go to https://analytics.google.com
 *   2. Admin → Create Property → Web
 *   3. Copy your Measurement ID (format: G-XXXXXXXXXX)
 *   4. Replace the placeholder below in both places
 *
 * Google Search Console:
 *   1. Go to https://search.google.com/search-console
 *   2. Add property → URL prefix → https://timelesshadith.com
 *   3. Verify via Google Analytics (easiest method once GA4 is live)
 * ───────────────────────────────────────────────────────────────── */

var GA_ID = 'G-6JL045YKG3';

(function () {
  // Load the gtag.js library
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());

  // Core config — anonymize IP for privacy compliance
  gtag('config', GA_ID, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure'
  });

  // ── Custom event: hadith bookmark ──────────────────────────────
  // Call window.gaEvent('bookmark_add', { hadith_id: '123' }) from your code
  window.gaEvent = function (eventName, params) {
    gtag('event', eventName, params || {});
  };
})();
