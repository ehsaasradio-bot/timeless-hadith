/*
 * Timeless Hadith — Service Worker
 * Strategy:
 *  - Precache: core shell (HTML, CSS, manifest, icons, offline page)
 *  - Runtime: stale-while-revalidate for same-origin GETs
 *  - Skip: Supabase API calls, Cloudflare Insights, Google Fonts CSS (let browser handle)
 */

const VERSION = 'th-v1-2026-04-10';
const CORE_CACHE = `${VERSION}-core`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/categories.html',
  '/category.html',
  '/bookmarks.html',
  '/privacy.html',
  '/terms.html',
  '/offline.html',
  '/css/styles.css',
  '/js/supabase-data.js?v=2',
  '/js/app.js',
  '/js/supabase-auth.js',
  '/js/ai-search.js',
  '/manifest.json',
  '/favicon-16.png',
  '/favicon-32.png',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/timelesshadith-logo.png',
  '/og-image.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION))
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Skip cross-origin APIs we don't want to cache
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('cloudflareinsights.com') ||
    url.hostname.includes('accounts.google.com')
  ) {
    return;
  }

  // Navigation requests: network first, fall back to cache, fall back to offline page
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/offline.html')))
    );
    return;
  }

  // Same-origin static assets: stale-while-revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.status === 200 && res.type === 'basic') {
              const copy = res.clone();
              caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Cross-origin fonts (Google): cache-first
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
        return res;
      }))
    );
  }
});
