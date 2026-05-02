/*
 * Timeless Hadith — Service Worker
 * Strategy:
 *  - Precache: core shell (HTML, CSS, manifest, icons, offline page)
 *  - Runtime: stale-while-revalidate for same-origin GETs
 *  - Skip: Supabase API calls, Cloudflare Insights (let browser handle)
 *  - Fonts: self-hosted woff2 files precached with core assets
 */

const VERSION = 'th-v14-2026-04-25'; // SEO: GA4 + meta tags + schema updates
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
  '/css/styles.min.css',
  '/js/supabase-data.js?v=2',
  '/js/app.js',
  '/js/supabase-auth.js',
  '/manifest.json',
  '/favicon-16.png',
  '/favicon-32.png',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/timelesshadith-logo.png',
  '/og-image.png',
  '/fonts/inter-latin.woff2',
  '/fonts/inter-latin-ext.woff2',
  '/fonts/gulzar-arabic.woff2',
  '/fonts/gulzar-latin.woff2',
  '/fonts/noto-kufi-arabic.woff2',
  '/fonts/Inter-Variable.woff2',
  '/blog.html',
  '/prayer-times.html'
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

  // Skip cross-origin requests — let the browser handle them directly
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('cloudflareinsights.com') ||
    url.hostname.includes('accounts.google.com') ||
    url.hostname.includes('googletagmanager.com') ||
    url.hostname.includes('google-analytics.com') ||
    url.hostname.includes('analytics.google.com')
  ) {
    return;
  }

  // Skip analytics.js itself — always fetch fresh so GA ID updates propagate immediately
  if (url.pathname === '/js/analytics.js') {
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

  // All other cross-origin requests: let browser handle

});
