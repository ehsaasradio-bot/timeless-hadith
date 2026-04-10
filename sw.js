/**
 * Timeless Hadith — Service Worker (M-08)
 *
 * Strategy:
 *   • App shell (HTML, CSS, JS, fonts, icons) → Cache-first, update in background
 *   • /api/* and Supabase → Network-only (live data must always be fresh)
 *   • Offline fallback → serve /offline.html if a navigation fails
 *
 * Cache names are versioned; old caches are purged on activate.
 */

var CACHE_VERSION = 'th-v1';
var SHELL_CACHE   = CACHE_VERSION + '-shell';
var FONT_CACHE    = CACHE_VERSION + '-fonts';

/* App shell — files to pre-cache on install */
var SHELL_URLS = [
  '/',
  '/index.html',
  '/categories.html',
  '/category.html',
  '/bookmarks.html',
  '/about.html',
  '/privacy.html',
  '/terms.html',
  '/404.html',
  '/offline.html',
  '/css/styles.css',
  '/dist/js/supabase-data.js',
  '/dist/js/app.js',
  '/dist/js/supabase-auth.js',
  '/dist/js/ai-search.js',
  '/manifest.json',
  '/favicon-32.png',
  '/favicon-16.png',
  '/apple-touch-icon.png',
  '/images/Hadith_Logo.webp'
];

/* ── Install: pre-cache shell ── */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function(cache) {
      return cache.addAll(SHELL_URLS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

/* ── Activate: purge old caches ── */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          /* Remove any cache not from the current version */
          return key.startsWith('th-') &&
                 key !== SHELL_CACHE &&
                 key !== FONT_CACHE;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* ── Fetch ── */
self.addEventListener('fetch', function(event) {
  var req = event.request;
  var url = new URL(req.url);

  /* Skip non-GET requests */
  if (req.method !== 'GET') return;

  /* Skip API calls and Supabase — always network */
  if (url.pathname.startsWith('/api/') ||
      url.hostname.includes('supabase.co') ||
      url.hostname.includes('openai.com')) {
    return;
  }

  /* Google Fonts — cache-first with font cache */
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(FONT_CACHE).then(function(cache) {
        return cache.match(req).then(function(cached) {
          if (cached) return cached;
          return fetch(req).then(function(response) {
            cache.put(req, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  /* Everything else — stale-while-revalidate */
  event.respondWith(
    caches.open(SHELL_CACHE).then(function(cache) {
      return cache.match(req).then(function(cached) {
        var fetchPromise = fetch(req).then(function(response) {
          /* Only cache valid responses */
          if (response && response.status === 200 && response.type !== 'opaque') {
            cache.put(req, response.clone());
          }
          return response;
        }).catch(function() {
          /* Network failed — serve offline fallback for navigation requests */
          if (req.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          return null;
        });

        return cached || fetchPromise;
      });
    })
  );
});
