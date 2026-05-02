# AlHudah Quran — Comprehensive SEO & Performance Optimization Guide

**Last Updated:** April 2026  
**Platform:** AlHudah Quran (alhudah.com)  
**Target Lighthouse Score:** 90+ (Performance, Accessibility, Best Practices, SEO)

---

## 1. META TAGS & HEAD CONFIGURATION

### 1.1 Global Base Head Template

Every page must include this baseline:

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#1F2937" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="AlHudah Quran" />
  
  <!-- Language Declarations -->
  <html lang="en" />
  <!-- For Arabic-only sections, use: <section lang="ar" dir="rtl"> -->
  
  <!-- Favicon Suite (Multiple Sizes) -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  
  <!-- Preconnect to Critical Third-Party Domains -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="dns-prefetch" href="https://YOUR-PROJECT.supabase.co" />
  
  <!-- Critical Fonts (Preload) -->
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" as="style" />
  
  <!-- Page-Specific Meta Tags (populated per route) -->
  <!-- See section 1.2 for per-page templates -->
</head>
```

### 1.2 Per-Page Meta Tag Templates

#### Homepage (alhudah.com)
```html
<title>AlHudah Quran — Authentic Islamic Learning Platform</title>
<meta name="description" content="Explore the complete Quran with tafsir, translations, and explanations. AlHudah brings authentic Islamic knowledge to your fingertips with clean, beautiful design." />
<meta name="keywords" content="Quran, Islamic learning, tafsir, translations, Quranic studies, Islamic education" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="AlHudah Quran — Learn from the Quran" />
<meta property="og:description" content="Explore the complete Quran with authentic translations and scholarly explanations." />
<meta property="og:image" content="https://alhudah.com/og-image.png" />
<meta property="og:url" content="https://alhudah.com" />
<meta property="og:site_name" content="AlHudah Quran" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="AlHudah Quran — Authentic Islamic Learning" />
<meta name="twitter:description" content="Learn from the Quran with authentic translations and scholarly tafsir." />
<meta name="twitter:image" content="https://alhudah.com/og-image.png" />
<meta name="twitter:site" content="@alhudah" />

<!-- Canonical URL -->
<link rel="canonical" href="https://alhudah.com" />
```

#### Surah Page Template (e.g., /surah/al-fatihah)
```html
<title>Surah Al-Fatihah (The Opening) — Chapter 1 — AlHudah Quran</title>
<meta name="description" content="Read Surah Al-Fatihah with English translation, Arabic text, and detailed tafsir. Learn the meaning and significance of the first chapter of the Quran." />
<meta name="keywords" content="Surah Al-Fatihah, Chapter 1, Quran translation, Islamic tafsir, Al-Fatiha" />

<!-- Open Graph -->
<meta property="og:type" content="article" />
<meta property="og:title" content="Surah Al-Fatihah (The Opening) — AlHudah Quran" />
<meta property="og:description" content="Read and understand Surah Al-Fatihah with English translation and scholarly tafsir." />
<meta property="og:image" content="https://alhudah.com/images/surahs/al-fatihah.jpg" />
<meta property="og:url" content="https://alhudah.com/surah/al-fatihah" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Surah Al-Fatihah — AlHudah Quran" />
<meta name="twitter:description" content="Learn the meaning of Surah Al-Fatihah with authentic English translation and tafsir." />
<meta name="twitter:image" content="https://alhudah.com/images/surahs/al-fatihah.jpg" />

<!-- Article Metadata -->
<meta property="article:published_time" content="2026-01-01T00:00:00Z" />
<meta property="article:modified_time" content="2026-04-13T00:00:00Z" />
<meta property="article:author" content="AlHudah Team" />

<!-- Canonical URL -->
<link rel="canonical" href="https://alhudah.com/surah/al-fatihah" />
```

#### About Page Template
```html
<title>About AlHudah — Our Mission to Bring Quranic Knowledge</title>
<meta name="description" content="Learn about AlHudah's mission to make authentic Quranic learning accessible to everyone through modern technology and scholarly expertise." />
<meta name="keywords" content="about AlHudah, Quranic learning, Islamic education mission, Islamic platform" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="About AlHudah — Quranic Learning Platform" />
<meta property="og:description" content="Our mission is to make authentic Quranic knowledge accessible to all seekers of Islamic wisdom." />
<meta property="og:image" content="https://alhudah.com/og-about.png" />
<meta property="og:url" content="https://alhudah.com/about" />

<!-- Canonical URL -->
<link rel="canonical" href="https://alhudah.com/about" />
```

---

## 2. JSON-LD STRUCTURED DATA

### 2.1 WebSite Schema (Homepage)

Add this to the `<head>` of every page, especially homepage:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AlHudah Quran",
  "url": "https://alhudah.com",
  "description": "Authentic Quranic learning platform with translations, tafsir, and Islamic education",
  "image": "https://alhudah.com/og-image.png",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://alhudah.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
</script>
```

### 2.2 Organization Schema (Footer or About Page)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AlHudah",
  "url": "https://alhudah.com",
  "logo": "https://alhudah.com/logo.png",
  "description": "Authentic Quranic learning platform",
  "sameAs": [
    "https://twitter.com/alhudah",
    "https://facebook.com/alhudah",
    "https://instagram.com/alhudah"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "email": "hello@alhudah.com",
    "url": "https://alhudah.com/contact"
  }
}
</script>
```

### 2.3 Book Schema (for the Quran)

Add to every surah page:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Book",
  "name": "The Quran",
  "author": {
    "@type": "Person",
    "name": "Revelation from Allah (Revealed to Prophet Muhammad)"
  },
  "datePublished": "610-632 CE",
  "language": "ar",
  "inLanguage": ["ar", "en"],
  "description": "The holy book of Islam, believed by Muslims to be the word of God revealed to the Prophet Muhammad.",
  "image": "https://alhudah.com/images/quran-cover.jpg",
  "url": "https://alhudah.com"
}
</script>
```

### 2.4 BreadcrumbList Schema (Surah Pages)

Add to each surah page to improve navigation clarity:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://alhudah.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Surahs",
      "item": "https://alhudah.com/surahs"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Al-Fatihah",
      "item": "https://alhudah.com/surah/al-fatihah"
    }
  ]
}
</script>
```

### 2.5 FAQPage Schema (About or Help Pages)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is AlHudah Quran?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AlHudah is an authentic Quranic learning platform providing the complete Quran with scholarly translations, tafsir, and Islamic education resources."
      }
    },
    {
      "@type": "Question",
      "name": "Is the content free to access?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, all content on AlHudah is freely accessible to all learners worldwide."
      }
    },
    {
      "@type": "Question",
      "name": "What languages are supported?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AlHudah provides the Quran in Arabic (original) with English and other language translations."
      }
    }
  ]
}
</script>
```

### 2.6 Article Schema (Blog Posts, if applicable)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Understanding Surah Al-Fatihah: The Opening Chapter",
  "description": "A comprehensive guide to understanding the first chapter of the Quran.",
  "image": "https://alhudah.com/images/articles/al-fatihah-guide.jpg",
  "datePublished": "2026-01-15T10:00:00Z",
  "dateModified": "2026-04-13T14:30:00Z",
  "author": {
    "@type": "Person",
    "name": "Islamic Scholar Name",
    "url": "https://alhudah.com/authors/scholar-name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "AlHudah",
    "logo": {
      "@type": "ImageObject",
      "url": "https://alhudah.com/logo.png"
    }
  }
}
</script>
```

---

## 3. SEMANTIC HTML STRUCTURE

### 3.1 Proper Heading Hierarchy

Every page must follow H1 → H2 → H3 → H4 hierarchy. Never skip levels.

```html
<!-- CORRECT -->
<main>
  <h1>Surah Al-Fatihah</h1>
  
  <section>
    <h2>Arabic Text</h2>
    <p>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ...</p>
  </section>
  
  <section>
    <h2>English Translation</h2>
    <p>In the name of Allah, the Most Gracious, the Most Merciful...</p>
  </section>
  
  <section>
    <h2>Tafsir (Explanation)</h2>
    <article>
      <h3>Overview</h3>
      <p>...</p>
    </article>
    <article>
      <h3>Detailed Analysis</h3>
      <p>...</p>
    </article>
  </section>
</main>

<!-- INCORRECT (skip from h1 to h3) -->
<h1>Surah Al-Fatihah</h1>
<h3>Arabic Text</h3>
```

### 3.2 Semantic HTML Elements

Use semantic tags for better SEO and accessibility:

```html
<!-- Page Structure -->
<header role="banner">
  <nav role="navigation" aria-label="Main Navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/surahs">Surahs</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>

<main role="main">
  <article>
    <header>
      <h1>Surah Al-Fatihah</h1>
      <p class="metadata">Chapter 1 • 7 Verses • Makkah Period</p>
    </header>
    
    <section aria-labelledby="heading-text">
      <h2 id="heading-text">Arabic Text</h2>
      <div lang="ar" dir="rtl">
        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </div>
    </section>
    
    <section aria-labelledby="heading-translation">
      <h2 id="heading-translation">English Translation</h2>
      <p>In the name of Allah, the Most Gracious, the Most Merciful...</p>
    </section>
    
    <aside aria-label="Related Surahs">
      <h3>Related Chapters</h3>
      <ul>
        <li><a href="/surah/al-baqarah">Al-Baqarah</a></li>
      </ul>
    </aside>
  </article>
</main>

<footer role="contentinfo">
  <p>&copy; 2026 AlHudah. All rights reserved.</p>
</footer>
```

### 3.3 ARIA Landmarks (Accessibility)

Every page must include these landmarks:

```html
<!-- Navigation landmark -->
<nav role="navigation" aria-label="Main Navigation">...</nav>

<!-- Main content landmark -->
<main role="main">...</main>

<!-- Complementary sidebar landmark (if applicable) -->
<aside role="complementary" aria-label="Sidebar">...</aside>

<!-- Content info landmark -->
<footer role="contentinfo">...</footer>

<!-- Search landmark -->
<div role="search" aria-label="Surah Search">...</div>
```

### 3.4 Language Attributes for Bilingual Content

```html
<!-- English content -->
<html lang="en">
  <body>
    <h1>Al-Fatihah</h1>
    
    <!-- Arabic text section with proper lang attribute -->
    <section lang="ar" dir="rtl">
      <p>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
    </section>
  </body>
</html>
```

---

## 4. IMAGE OPTIMIZATION

### 4.1 Modern Image Format Strategy

Use WebP with PNG fallback:

```html
<!-- Primary format: WebP (smaller, modern) -->
<!-- Fallback: PNG (wider browser support) -->
<picture>
  <source srcset="/images/surah-al-fatihah.webp" type="image/webp" />
  <source srcset="/images/surah-al-fatihah.png" type="image/png" />
  <img
    src="/images/surah-al-fatihah.png"
    alt="Surah Al-Fatihah header with Arabic calligraphy"
    width="1200"
    height="630"
    loading="lazy"
    decoding="async"
  />
</picture>
```

### 4.2 Lazy Loading

All off-screen images must use `loading="lazy"`:

```html
<!-- For all images below the fold -->
<img
  src="/images/tafsir-background.jpg"
  alt="Islamic geometric pattern background"
  width="400"
  height="300"
  loading="lazy"
  decoding="async"
/>

<!-- Hero/above-fold images should NOT use lazy loading -->
<img
  src="/images/hero-banner.jpg"
  alt="AlHudah Quran platform hero banner"
  width="1920"
  height="1080"
  decoding="async"
  fetchpriority="high"
/>
```

### 4.3 Proper Alt Text

Every image must have descriptive alt text:

```html
<!-- GOOD: Descriptive, concise -->
<img
  src="/logo.png"
  alt="AlHudah Quran logo"
  width="200"
  height="60"
/>

<!-- GOOD: Contextual description -->
<img
  src="/surah-decorations/al-fatihah.svg"
  alt="Islamic geometric border decorating Surah Al-Fatihah title"
  width="300"
  height="100"
/>

<!-- POOR: Too generic -->
<img src="/logo.png" alt="logo" />

<!-- POOR: Image is decorative but lacks alt="" -->
<img src="/pattern.svg" />
<!-- CORRECT for decorative images: -->
<img src="/pattern.svg" alt="" aria-hidden="true" />
```

### 4.4 Favicon Suite

Create and place these files in the root `/public` directory:

```
favicon.ico (16x16 and 32x32 ico format)
favicon-16x16.png
favicon-32x32.png
apple-touch-icon.png (180x180)
favicon-192x192.png (for Android)
favicon-512x512.png (for Android)
```

Reference in HTML:

```html
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
<link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />
```

### 4.5 WebP Conversion Command

Use ImageMagick or online converter:

```bash
# Convert PNG to WebP (80% quality, good balance)
convert input.png -quality 80 output.webp

# Batch convert all PNGs
for file in *.png; do convert "$file" -quality 80 "${file%.png}.webp"; done
```

---

## 5. CORE WEB VITALS OPTIMIZATION

### 5.1 Core Web Vitals Targets

| Metric | Target | Range |
|--------|--------|-------|
| **LCP (Largest Contentful Paint)** | < 2.5s | Good: 0-2.5s, Fair: 2.5-4.0s, Poor: > 4.0s |
| **CLS (Cumulative Layout Shift)** | < 0.1 | Good: 0-0.1, Fair: 0.1-0.25, Poor: > 0.25 |
| **INP (Interaction to Next Paint)** | < 200ms | Good: 0-200ms, Fair: 200-500ms, Poor: > 500ms |

### 5.2 LCP Optimization Strategy

**Largest Contentful Paint** is usually text, an image, or a video element. Optimize the critical path:

```html
<!-- 1. Preload the hero image or critical font -->
<link
  rel="preload"
  href="/images/hero-banner.jpg"
  as="image"
  media="(min-width: 1024px)"
/>

<!-- 2. Inline critical CSS (first ~14KB) -->
<style>
  /* Critical styles for above-the-fold content */
  body {
    font-family: 'Inter', sans-serif;
    background: #fff;
  }
  
  h1 {
    font-size: 2.5rem;
    line-height: 1.2;
    color: #1f2937;
  }
</style>

<!-- 3. Defer non-critical CSS -->
<link rel="stylesheet" href="/css/non-critical.css" media="print" onload="this.media='all'" />
<noscript><link rel="stylesheet" href="/css/non-critical.css" /></noscript>

<!-- 4. Load JavaScript asynchronously -->
<script src="/js/app.js" async defer></script>
```

### 5.3 CLS Prevention

Prevent layout shifts with explicit dimensions:

```html
<!-- GOOD: Image has explicit width/height -->
<img
  src="/images/surah-banner.jpg"
  alt="Surah header"
  width="1200"
  height="630"
  loading="lazy"
/>

<!-- GOOD: Video/iframe has aspect-ratio -->
<iframe
  width="560"
  height="315"
  src="https://example.com/video"
  style="aspect-ratio: 16/9; width: 100%; height: auto;"
  loading="lazy"
  title="Quran recitation video"
></iframe>

<!-- GOOD: Reserve space for dynamic content -->
<div style="min-height: 60px;">
  <!-- Loading skeleton or actual content -->
</div>

<!-- BAD: No dimensions, causes shift when image loads -->
<img src="/image.jpg" alt="..." />

<!-- BAD: Dynamic height content without min-height -->
<div id="dynamic-content"></div>
```

### 5.4 INP Optimization (Interaction Response)

Minimize JavaScript execution during user interactions:

```javascript
// BAD: Long task blocks main thread
function handleSearchInput(event) {
  const results = searchAllData(); // 500ms operation
  renderResults(results);
}

// GOOD: Break into smaller chunks
async function handleSearchInput(event) {
  // Immediate visual feedback
  showLoadingSpinner();
  
  // Yield to browser for paint
  await new Promise(resolve => setTimeout(resolve, 0));
  
  const results = await searchAllData(); // Happens in background
  renderResults(results);
  hideLoadingSpinner();
}

// EVEN BETTER: Use requestIdleCallback for non-urgent work
document.addEventListener('input', (event) => {
  if (event.target.id === 'search-input') {
    requestIdleCallback(() => {
      updateSearchSuggestions(event.target.value);
    });
  }
});
```

### 5.5 Font Loading Strategy

Critical fonts should load fast and not block rendering:

```html
<!-- 1. Preconnect to Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- 2. Preload critical font weights/styles -->
<link
  rel="preload"
  href="https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3i6t4kDjbQY.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>

<!-- 3. Use font-display: swap to prevent invisible text -->
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>

<!-- 4. System fonts as fallback (no FOUT) -->
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
  }
</style>
```

### 5.6 CSS Critical Path Optimization

Inline critical CSS, defer the rest:

```html
<head>
  <!-- INLINE critical CSS (< 14KB uncompressed) -->
  <style>
    /* Reset and base styles */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; }
    
    /* Above-the-fold layouts */
    header { padding: 1rem; }
    main { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 2.5rem; line-height: 1.2; margin-bottom: 1rem; }
  </style>
  
  <!-- DEFER non-critical CSS -->
  <link
    rel="stylesheet"
    href="/css/components.css"
    media="print"
    onload="this.media='all'; this.onload=null;"
  />
  <noscript>
    <link rel="stylesheet" href="/css/components.css" />
  </noscript>
</head>
```

---

## 6. SERVICE WORKER & CACHING STRATEGY

### 6.1 Service Worker Registration

Add to your main app JavaScript:

```javascript
// Register service worker on page load
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(err => {
        console.log('SW registration failed:', err);
      });
  });
}

// Optional: Check for updates periodically
setInterval(() => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
  }
}, 60000); // Every 60 seconds
```

### 6.2 Complete Service Worker Implementation

Save as `/public/sw.js`:

```javascript
const CACHE_NAME = 'alhudah-v1';
const RUNTIME_CACHE = 'alhudah-runtime-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/app.js',
  '/offline.html', // Fallback offline page
  '/logo.png',
  '/favicon.ico'
];

// Install event: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // STRATEGY 1: Cache-first for static assets (JS, CSS, images)
  if (request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) return response;
        return fetch(request).then((response) => {
          // Clone response before caching
          if (response.ok) {
            const cache = caches.open(CACHE_NAME);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        });
      }).catch(() => {
        // Return offline fallback if needed
        if (request.destination === 'image') {
          return caches.match('/offline-image.svg');
        }
      })
    );
    return;
  }

  // STRATEGY 2: Network-first for API calls (Supabase data)
  if (url.origin === 'YOUR-PROJECT.supabase.co' ||
      url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          // Return cached version if network fails
          return caches.match(request).then((response) => {
            if (response) return response;
            return new Response(
              JSON.stringify({ error: 'Offline - cached data unavailable' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // STRATEGY 3: Stale-while-revalidate for Google Fonts
  if (url.origin === 'fonts.googleapis.com' || url.origin === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(request).then((response) => {
        const fetchPromise = fetch(request).then((response) => {
          // Cache successful responses
          if (response.ok) {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        });
        return response || fetchPromise;
      })
    );
    return;
  }

  // STRATEGY 4: Network-first for HTML pages
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            return response || caches.match('/offline.html');
          });
        })
    );
    return;
  }
});

// Handle cache update messages from the page
self.addEventListener('message', (event) => {
  if (event.data.type === 'CHECK_UPDATE') {
    // Implement update check logic if needed
  }
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

### 6.3 Offline Fallback Page

Create `/public/offline.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Offline — AlHudah Quran</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #fff;
      color: #1f2937;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 400px;
    }
    h1 {
      font-size: 1.875rem;
      margin-bottom: 1rem;
    }
    p {
      margin-bottom: 1.5rem;
      color: #6b7280;
    }
    a {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #3b82f6;
      color: white;
      text-decoration: none;
      border-radius: 0.5rem;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>You're Offline</h1>
    <p>It looks like your internet connection is unavailable. Check your connection and try again.</p>
    <a href="/">Return to AlHudah</a>
  </div>
</body>
</html>
```

---

## 7. ROBOTS.TXT & SITEMAP.XML

### 7.1 robots.txt

Create `/public/robots.txt`:

```
# AlHudah Quran — robots.txt
User-agent: *
Allow: /
Disallow: /admin
Disallow: /private
Disallow: /api/
Disallow: /temp

# Crawl delay to respect server
Crawl-delay: 1

# Sitemap location
Sitemap: https://alhudah.com/sitemap.xml
Sitemap: https://alhudah.com/sitemap-surahs.xml

# Specific rules for major search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1
```

### 7.2 Dynamic Sitemap Generation (Node.js/JavaScript)

Create a script to generate `/public/sitemap.xml` and `/public/sitemap-surahs.xml`:

```javascript
// scripts/generate-sitemaps.js
const fs = require('fs');
const path = require('path');

// All 114 Surahs with slug format
const SURAHS = [
  { id: 1, name: 'Al-Fatihah', slug: 'al-fatihah' },
  { id: 2, name: 'Al-Baqarah', slug: 'al-baqarah' },
  { id: 3, name: 'Al-Imran', slug: 'al-imran' },
  // ... all 114 surahs
  { id: 114, name: 'An-Nas', slug: 'an-nas' }
];

const baseUrl = 'https://alhudah.com';

// Generate main sitemap
const mainSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>2026-04-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>2026-04-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/surahs</loc>
    <lastmod>2026-04-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

// Generate surahs sitemap
const surahSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${SURAHS.map(surah => `
  <url>
    <loc>${baseUrl}/surah/${surah.slug}</loc>
    <lastmod>2026-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

// Write sitemaps
fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), mainSitemap);
fs.writeFileSync(path.join(__dirname, '../public/sitemap-surahs.xml'), surahSitemap);

console.log('✓ Sitemaps generated');
```

Run this script during your build process or manually after updating content.

---

## 8. ACCESSIBILITY (WCAG 2.1 AA)

### 8.1 Accessibility Checklist

| Item | Status | Notes |
|------|--------|-------|
| **Proper lang attribute** | [ ] | `<html lang="en">` on root |
| **Heading hierarchy** | [ ] | H1 → H2 → H3, no skips |
| **Image alt text** | [ ] | All images have descriptive alt text |
| **ARIA landmarks** | [ ] | `<main>`, `<nav>`, `<footer>`, `<aside>` |
| **Color contrast** | [ ] | Min 4.5:1 for text, 3:1 for graphics |
| **Focus indicators** | [ ] | Visible `:focus` style on keyboard navigation |
| **Keyboard navigation** | [ ] | All interactive elements accessible via Tab |
| **Form labels** | [ ] | All inputs have `<label>` with `for` attribute |
| **Video captions** | [ ] | All videos have captions for hearing-impaired |
| **ARIA live regions** | [ ] | Dynamic content updates announced to screen readers |

### 8.2 Color Contrast Verification

Use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

Required minimums:
- **Normal text:** 4.5:1 contrast ratio
- **Large text (18pt+):** 3:1 contrast ratio
- **Graphics/icons:** 3:1 contrast ratio

Example compliant color palette:

```css
/* Text colors for light theme */
:root {
  --text-primary: #1f2937;     /* Dark gray → 8.6:1 contrast on white */
  --text-secondary: #6b7280;   /* Medium gray → 7.2:1 contrast on white */
  --text-accent: #0ea5e9;      /* Blue → 4.5:1 contrast on white */
  
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  
  --border: #e5e7eb;
}

/* Verify contrast in high-priority areas */
a {
  color: var(--text-accent);     /* Minimum 4.5:1 */
  text-decoration: underline;    /* Underline for color-blind users */
}

button:focus {
  outline: 3px solid var(--text-accent);  /* Visible focus */
  outline-offset: 2px;
}
```

### 8.3 Focus Indicator Best Practices

```css
/* Remove default outline only if providing custom focus */
a, button, input, select, textarea {
  outline: none; /* ONLY if custom focus is provided below */
}

/* Always provide visible focus indicator */
a:focus-visible,
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 3px solid #0ea5e9;     /* Bright, visible outline */
  outline-offset: 2px;
  border-radius: 2px;
}

/* Skip link for keyboard users to jump to main content */
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 0;
  background: #0ea5e9;
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-to-content:focus {
  top: 0;
}
```

Add skip link to every page `<body>`:

```html
<a href="#main-content" class="skip-to-content">Skip to main content</a>
<main id="main-content">...</main>
```

### 8.4 ARIA Live Regions for Dynamic Content

When bookmark count updates dynamically:

```html
<!-- Announce updates to screen readers -->
<div aria-live="polite" aria-atomic="true" class="bookmark-badge">
  <span id="bookmark-count">0</span> Bookmarked
</div>

<script>
function updateBookmarkCount(newCount) {
  document.getElementById('bookmark-count').textContent = newCount;
  // Screen reader will announce: "0 Bookmarked" → "1 Bookmarked"
}
</script>
```

---

## 9. PERFORMANCE OPTIMIZATION CHECKLIST

### 9.1 Lighthouse 90+ Target Scorecard

Run at: https://pagespeed.web.dev

| Category | Target | Current |
|----------|--------|---------|
| **Performance** | 90+ | __ |
| **Accessibility** | 90+ | __ |
| **Best Practices** | 90+ | __ |
| **SEO** | 90+ | __ |

### 9.2 Resource Hints (Preload/Prefetch)

```html
<!-- DNS Prefetch: Resolve domain early -->
<link rel="dns-prefetch" href="https://YOUR-PROJECT.supabase.co" />

<!-- Preconnect: Establish full connection (TCP + TLS) -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- Preload: High-priority critical resources -->
<link rel="preload" href="/css/critical.css" as="style" />
<link rel="preload" href="/js/app.js" as="script" />
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />

<!-- Prefetch: Resources likely needed on next page -->
<link rel="prefetch" href="/surah/al-baqarah" />
<link rel="prefetch" href="/images/next-page-hero.webp" />
```

### 9.3 Minification & Compression

All assets must be minified:

```bash
# CSS minification
npm install -g csso-cli
csso input.css -o input.min.css

# JavaScript minification
npm install -g terser
terser input.js -o input.min.js

# HTML minification
npm install -g html-minifier
html-minifier --input-dir . --output-dir dist/
```

Cloudflare Pages automatically handles Gzip/Brotli compression—no action needed.

### 9.4 Lazy Load Strategy

```html
<!-- Images below the fold -->
<img src="..." loading="lazy" />

<!-- Heavy iframes (maps, videos) -->
<iframe src="..." loading="lazy"></iframe>

<!-- For older browsers, use library -->
<img src="..." loading="lazy" data-src="image.jpg" class="lazyload" />
<script src="https://cdn.jsdelivr.net/npm/lazysizes"></script>
```

### 9.5 Code Splitting

For JavaScript:

```javascript
// Instead of loading all JS at once, split by route
import('/pages/surah-detail.js')
  .then(module => module.init())
  .catch(err => console.error('Failed to load:', err));

// Use dynamic imports for heavy libraries
const OpenAI = await import('openai');
```

---

## 10. TESTING & VALIDATION

### 10.1 SEO Audit Tools

- **Google PageSpeed Insights:** https://pagespeed.web.dev
- **Google Search Console:** https://search.google.com/search-console
- **Semrush SEO Audit:** https://www.semrush.com/seo-audit/
- **Ahrefs Site Audit:** https://ahrefs.com/

### 10.2 Accessibility Testing

- **WAVE Accessibility Tool:** https://wave.webaim.org/
- **Axe DevTools:** https://www.deque.com/axe/devtools/
- **Lighthouse Accessibility Audit:** Built into DevTools
- **Manual keyboard testing:** Tab through entire site

### 10.3 Structured Data Validation

- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Schema.org Validator:** https://validator.schema.org/

### 10.4 Performance Testing

- **Lighthouse CI:** https://github.com/GoogleChrome/lighthouse-ci
- **WebPageTest:** https://www.webpagetest.org/
- **Pingdom:** https://tools.pingdom.com/

---

## Summary

Follow this guide to ensure AlHudah ranks highly in search engines, loads instantly for users, and provides excellent accessibility for all visitors. Update this document as best practices evolve.

**Next Step:** Proceed to `08-deployment.md` for hosting and CI/CD configuration.
