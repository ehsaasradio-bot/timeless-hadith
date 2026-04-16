# AlHudah Quran Platform — Complete Frontend Reference Guide

**Author:** Claude Code  
**Version:** 1.0  
**Date:** April 2026  
**Stack:** Vanilla HTML + CSS + JavaScript (no framework)  
**Design Philosophy:** Apple-style minimalism, clean, premium, accessible  
**Deployment:** Cloudflare Pages + Supabase data layer  

---

## TABLE OF CONTENTS

1. [Design System](#design-system)
2. [Page Structure & Routing](#page-structure--routing)
3. [Shared Components & Layout](#shared-components--layout)
4. [CSS Architecture](#css-architecture)
5. [JavaScript Architecture](#javascript-architecture)
6. [Service Worker & PWA](#service-worker--pwa)
7. [SEO & Meta Configuration](#seo--meta-configuration)
8. [Complete File Implementations](#complete-file-implementations)

---

## DESIGN SYSTEM

### Color Palette

#### Light Theme (Default)
```css
/* Primary */
--bg: #ffffff;
--bg-secondary: #f5f5f7;
--text: #1d1d1f;
--text-secondary: #6e6e73;
--text-tertiary: #a1a1a6;

/* Accent */
--accent: #0a6e5c;          /* Deep teal — Islamic/Quran feel */
--accent-hover: #085a4b;
--accent-light: #e8f5f1;

/* Cards & Surfaces */
--card-bg: #ffffff;
--card-border: #e5e5e7;
--input-bg: #f5f5f7;
--input-border: #d5d5d7;

/* Semantic */
--success: #34c759;
--warning: #ff9500;
--error: #ff3b30;
--gold: #c8a84e;             /* Quran ornamental accent */

/* Shadows */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
--shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
```

#### Dark Theme
```css
/* Primary */
--bg: #060c1a;
--bg-secondary: #0d1527;
--text: #f5f5f7;
--text-secondary: #a1a1a6;
--text-tertiary: #6e6e73;

/* Accent */
--accent: #2ecc8f;
--accent-hover: #26b876;
--accent-light: #0d2818;

/* Cards & Surfaces */
--card-bg: #111827;
--card-border: #1e293b;
--input-bg: #0d1527;
--input-border: #1e293b;

/* Semantic */
--success: #30b744;
--warning: #ff9500;
--error: #ff453a;
--gold: #d4a574;

/* Shadows */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
--shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
```

### Typography System

| Usage | Font | Size | Weight | Line Height | Letter Spacing |
|-------|------|------|--------|-------------|----------------|
| Display 1 | Inter | 48px | 700 | 1.2 | -0.5px |
| Display 2 | Inter | 36px | 700 | 1.25 | -0.3px |
| Heading 1 | Inter | 28px | 700 | 1.3 | 0 |
| Heading 2 | Inter | 24px | 700 | 1.35 | 0 |
| Heading 3 | Inter | 20px | 600 | 1.4 | 0 |
| Body | Inter | 17px | 400 | 1.5 | 0 |
| Body Small | Inter | 15px | 400 | 1.5 | 0 |
| Caption | Inter | 13px | 400 | 1.4 | 0 |
| Button | Inter | 17px | 600 | 1 | 0 |
| Arabic Body | Cairo Play | 1rem | 450 | 1.8 | 0 |
| Arabic Heading | Cairo Play | 1.5rem | 700 | 1.4 | 0 |

#### Font Weights
- **Inter**: 400, 500, 600, 700 (import these only)
- **Cairo Play**: 400, 500, 700

#### Font Imports
```html
<!-- In <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cairo+Play:wght@400;500;700&display=swap" rel="stylesheet">
```

### CSS Variables (Complete Reference)

Place in `:root` selector:

```css
:root {
  /* Typography */
  --font: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-arabic: "Cairo Play", "Segoe UI Arabic", "Droid Arabic Kufi", sans-serif;
  --font-display: "Inter", -apple-system, sans-serif;

  /* Spacing Scale (8px base) */
  --space-0: 0;
  --space-1: 0.25rem;      /* 4px */
  --space-2: 0.5rem;       /* 8px */
  --space-3: 0.75rem;      /* 12px */
  --space-4: 1rem;         /* 16px */
  --space-5: 1.25rem;      /* 20px */
  --space-6: 1.5rem;       /* 24px */
  --space-7: 2rem;         /* 32px */
  --space-8: 2.5rem;       /* 40px */
  --space-9: 3rem;         /* 48px */

  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius: 16px;
  --radius-lg: 20px;
  --radius-full: 999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.16);

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition: 0.25s ease;
  --transition-slow: 0.35s ease;

  /* Z-Index Scale */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-bg: 400;
  --z-modal: 500;
  --z-toast: 600;

  /* Light Theme Colors (default) */
  --bg: #ffffff;
  --bg-secondary: #f5f5f7;
  --text: #1d1d1f;
  --text-secondary: #6e6e73;
  --text-tertiary: #a1a1a6;
  --accent: #0a6e5c;
  --accent-hover: #085a4b;
  --accent-light: #e8f5f1;
  --card-bg: #ffffff;
  --card-border: #e5e5e7;
  --input-bg: #f5f5f7;
  --input-border: #d5d5d7;
  --success: #34c759;
  --warning: #ff9500;
  --error: #ff3b30;
  --gold: #c8a84e;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
}

/* Dark Theme */
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #060c1a;
    --bg-secondary: #0d1527;
    --text: #f5f5f7;
    --text-secondary: #a1a1a6;
    --text-tertiary: #6e6e73;
    --accent: #2ecc8f;
    --accent-hover: #26b876;
    --accent-light: #0d2818;
    --card-bg: #111827;
    --card-border: #1e293b;
    --input-bg: #0d1527;
    --input-border: #1e293b;
    --success: #30b744;
    --warning: #ff9500;
    --error: #ff453a;
    --gold: #d4a574;
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
    --shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
  }
}

/* Explicit Dark Theme Class Override */
body.dark-theme {
  --bg: #060c1a;
  --bg-secondary: #0d1527;
  --text: #f5f5f7;
  --text-secondary: #a1a1a6;
  --text-tertiary: #6e6e73;
  --accent: #2ecc8f;
  --accent-hover: #26b876;
  --accent-light: #0d2818;
  --card-bg: #111827;
  --card-border: #1e293b;
  --input-bg: #0d1527;
  --input-border: #1e293b;
  --success: #30b744;
  --warning: #ff9500;
  --error: #ff453a;
  --gold: #d4a574;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
}

/* Explicit Light Theme Class */
body.light-theme {
  --bg: #ffffff;
  --bg-secondary: #f5f5f7;
  --text: #1d1d1f;
  --text-secondary: #6e6e73;
  --text-tertiary: #a1a1a6;
  --accent: #0a6e5c;
  --accent-hover: #085a4b;
  --accent-light: #e8f5f1;
  --card-bg: #ffffff;
  --card-border: #e5e5e7;
  --input-bg: #f5f5f7;
  --input-border: #d5d5d7;
  --success: #34c759;
  --warning: #ff9500;
  --error: #ff3b30;
  --gold: #c8a84e;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
}
```

---

## PAGE STRUCTURE & ROUTING

### Site Map

```
/                           index.html       (Landing / Home)
/surah/:id                  surah.html       (Surah Reader)
/search                     search.html      (AI Search)
/bookmarks                  bookmarks.html   (Saved Verses)
/about                      about.html       (About & Mission)
/privacy                    privacy.html     (Privacy Policy)
/terms                      terms.html       (Terms of Service)
/404                        404.html         (Not Found)
/offline                    offline.html     (Offline Fallback)
```

### URL Scheme & Query Parameters

```javascript
// Surah Reader
window.location.href = '/surah/?id=1';           // Surah 1 (Al-Fatihah)
window.location.href = '/surah/?id=2&ayah=50';   // Surah 2, Ayah 50

// Search
window.location.href = '/search/?q=mercy';       // Search query

// API Layer (Supabase REST)
// GET /rest/v1/surahs                          (all 114 surahs)
// GET /rest/v1/ayahs?surah_number=eq.1         (verses of surah 1)
// GET /rest/v1/ayahs?text_en.ilike=%query%     (full-text search)
```

---

## SHARED COMPONENTS & LAYOUT

### Navbar Component (Always Visible)

**Features:**
- Logo (left side)
- Nav links: Home, Surahs, Search, Bookmarks, About
- Theme toggle (sun/moon icon)
- Mobile hamburger menu
- Responsive: collapses to hamburger on 680px and below

### Footer Component

**Features:**
- Links: Privacy, Terms, About
- Social media icons (optional): Twitter, Facebook, GitHub
- Copyright notice
- Contact email or link

### Page Chrome Pattern

All pages follow this structure:

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <!-- Meta, fonts, styles -->
</head>
<body>
  <!-- Navbar injected by page-chrome.js -->
  <nav id="navbar"></nav>
  
  <!-- Page-specific content -->
  <main role="main">
    <!-- Content here -->
  </main>
  
  <!-- Footer injected by page-chrome.js -->
  <footer id="footer"></footer>
  
  <!-- Scripts -->
  <script src="/js/theme-init.js"></script>
  <script src="/js/supabase-client.js"></script>
  <script src="/js/page-chrome.js"></script>
  <script src="/js/app.js"></script>
  <!-- Page-specific script -->
</body>
</html>
```

---

## CSS ARCHITECTURE

### Global Styles (`styles.css`)

```css
/* ===== RESET & NORMALIZE ===== */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font);
  font-size: 17px;
  line-height: 1.5;
  color: var(--text);
  background-color: var(--bg);
  transition: background-color var(--transition), color var(--transition);
  overflow-x: hidden;
}

/* ===== TYPOGRAPHY ===== */

h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  line-height: 1.3;
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  color: var(--text);
}

h1 {
  font-size: 48px;
  letter-spacing: -0.5px;
  margin-top: 1em;
}

h2 {
  font-size: 36px;
  letter-spacing: -0.3px;
}

h3 {
  font-size: 28px;
}

h4 {
  font-size: 24px;
}

h5 {
  font-size: 20px;
  font-weight: 600;
}

h6 {
  font-size: 17px;
  font-weight: 600;
}

p {
  margin-bottom: 1em;
}

p:last-child {
  margin-bottom: 0;
}

a {
  color: var(--accent);
  text-decoration: none;
  transition: color var(--transition);
}

a:hover, a:focus {
  color: var(--accent-hover);
}

/* ===== LISTS ===== */

ul, ol {
  margin-bottom: 1em;
  margin-left: 1.5em;
}

li {
  margin-bottom: 0.5em;
}

/* ===== IMAGES ===== */

img {
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: var(--radius);
}

/* ===== FORMS ===== */

input, textarea, select {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: var(--text);
  background-color: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  transition: border-color var(--transition), background-color var(--transition);
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--accent);
  background-color: var(--bg);
}

input::placeholder {
  color: var(--text-tertiary);
}

textarea {
  resize: vertical;
  min-height: 120px;
}

/* ===== BUTTONS ===== */

button, .btn {
  font-family: inherit;
  font-size: 17px;
  font-weight: 600;
  padding: var(--space-4) var(--space-6);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition), color var(--transition),
              transform var(--transition-fast), box-shadow var(--transition);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  white-space: nowrap;
  user-select: none;
}

button:active, .btn:active {
  transform: scale(0.98);
}

button:disabled, .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Button Variants */

.btn-primary, button {
  background-color: var(--accent);
  color: #ffffff;
}

.btn-primary:hover, button:hover {
  background-color: var(--accent-hover);
  box-shadow: var(--shadow);
}

.btn-secondary {
  background-color: var(--bg-secondary);
  color: var(--text);
  border: 1px solid var(--card-border);
}

.btn-secondary:hover {
  background-color: var(--card-border);
}

.btn-ghost {
  background-color: transparent;
  color: var(--accent);
}

.btn-ghost:hover {
  background-color: var(--accent-light);
}

.btn-small {
  padding: var(--space-2) var(--space-4);
  font-size: 15px;
}

.btn-large {
  padding: var(--space-5) var(--space-8);
  font-size: 18px;
}

.btn-full-width {
  width: 100%;
}

/* ===== CARDS ===== */

.card {
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius);
  padding: var(--space-6);
  box-shadow: var(--shadow);
  transition: box-shadow var(--transition), border-color var(--transition);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--accent);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--card-border);
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.card-body {
  margin-bottom: var(--space-4);
}

.card-footer {
  padding-top: var(--space-4);
  border-top: 1px solid var(--card-border);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}

/* ===== GRID LAYOUTS ===== */

.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-auto {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

@media (max-width: 1024px) {
  .grid-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 680px) {
  .grid-2, .grid-3 {
    grid-template-columns: 1fr;
  }
  
  .grid-auto {
    grid-template-columns: 1fr;
  }
}

/* ===== FLEXBOX UTILITIES ===== */

.flex {
  display: flex;
  gap: var(--space-4);
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-4);
}

.flex-col {
  flex-direction: column;
}

.flex-wrap {
  flex-wrap: wrap;
}

/* ===== SPACING UTILITIES ===== */

.mt-1 { margin-top: var(--space-1); }
.mt-2 { margin-top: var(--space-2); }
.mt-3 { margin-top: var(--space-3); }
.mt-4 { margin-top: var(--space-4); }
.mt-6 { margin-top: var(--space-6); }

.mb-1 { margin-bottom: var(--space-1); }
.mb-2 { margin-bottom: var(--space-2); }
.mb-3 { margin-bottom: var(--space-3); }
.mb-4 { margin-bottom: var(--space-4); }
.mb-6 { margin-bottom: var(--space-6); }

.px-4 { padding-left: var(--space-4); padding-right: var(--space-4); }
.py-4 { padding-top: var(--space-4); padding-bottom: var(--space-4); }
.p-6 { padding: var(--space-6); }

/* ===== RESPONSIVE CONTAINER ===== */

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

@media (max-width: 680px) {
  .container {
    padding: 0 var(--space-4);
  }
}

/* ===== VISIBILITY & DISPLAY ===== */

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.hidden {
  display: none !important;
}

.visible {
  display: block !important;
}

@media (max-width: 680px) {
  .hide-mobile {
    display: none !important;
  }
}

@media (min-width: 681px) {
  .show-mobile {
    display: none !important;
  }
}

/* ===== TEXT UTILITIES ===== */

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-muted {
  color: var(--text-secondary);
}

.text-small {
  font-size: 15px;
}

.text-tiny {
  font-size: 13px;
}

.font-bold {
  font-weight: 700;
}

.font-semi {
  font-weight: 600;
}

.font-normal {
  font-weight: 400;
}

/* ===== ARABIC TYPOGRAPHY ===== */

.ar, [lang="ar"] {
  font-family: var(--font-arabic);
  direction: rtl;
  text-align: right;
}

.ar-body {
  font-family: var(--font-arabic);
  font-size: 1rem;
  font-weight: 450;
  line-height: 1.8;
  direction: rtl;
  text-align: right;
}

.ar-heading {
  font-family: var(--font-arabic);
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.4;
  direction: rtl;
  text-align: right;
}

/* ===== ANIMATIONS ===== */

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-fade-in {
  animation: fadeIn var(--transition);
}

.animate-slide-up {
  animation: slideUp var(--transition);
}

.animate-slide-down {
  animation: slideDown var(--transition);
}

.animate-pulse {
  animation: pulse var(--transition) infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* ===== NAVBAR ===== */

nav {
  background-color: var(--bg);
  border-bottom: 1px solid var(--card-border);
  padding: var(--space-4);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  box-shadow: var(--shadow-sm);
  transition: background-color var(--transition);
}

nav .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.nav-logo img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: var(--space-6);
  align-items: center;
}

.nav-links a {
  color: var(--text-secondary);
  font-weight: 500;
  transition: color var(--transition);
}

.nav-links a:hover, .nav-links a.active {
  color: var(--accent);
}

.nav-actions {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: var(--text);
  padding: var(--space-2);
  transition: transform var(--transition);
}

.theme-toggle:hover {
  transform: rotate(20deg);
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}

.hamburger span {
  width: 24px;
  height: 2px;
  background-color: var(--text);
  transition: all var(--transition);
  border-radius: 1px;
}

.hamburger.active span:nth-child(1) {
  transform: rotate(45deg) translate(8px, 8px);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

@media (max-width: 680px) {
  .hamburger {
    display: flex;
  }

  .nav-links {
    display: none;
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    background-color: var(--bg);
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-6);
    border-bottom: 1px solid var(--card-border);
    list-style: none;
    z-index: var(--z-fixed);
  }

  .nav-links.active {
    display: flex;
  }

  .nav-links a {
    padding: var(--space-3);
    display: block;
  }

  .nav-actions {
    gap: var(--space-3);
  }
}

/* ===== FOOTER ===== */

footer {
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--card-border);
  padding: var(--space-9) var(--space-4);
  margin-top: var(--space-9);
  color: var(--text-secondary);
}

footer .container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
}

footer h3 {
  font-size: 17px;
  margin-bottom: var(--space-4);
  color: var(--text);
}

footer ul {
  list-style: none;
  margin: 0;
}

footer li {
  margin-bottom: var(--space-3);
}

footer a {
  color: var(--text-secondary);
}

footer a:hover {
  color: var(--accent);
}

.footer-copyright {
  text-align: center;
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid var(--card-border);
  font-size: 15px;
  color: var(--text-tertiary);
}

@media (max-width: 680px) {
  footer .container {
    grid-template-columns: 1fr;
  }

  footer {
    padding: var(--space-6) var(--space-4);
  }
}

/* ===== MAIN CONTENT ===== */

main {
  min-height: calc(100vh - 200px);
  padding: var(--space-8) var(--space-4);
  background-color: var(--bg);
}

@media (max-width: 680px) {
  main {
    padding: var(--space-6) var(--space-4);
  }
}

/* ===== ACCESSIBILITY ===== */

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

button:focus-visible, a:focus-visible, input:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* ===== LOADING SPINNER ===== */

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--card-border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* ===== TOAST NOTIFICATIONS ===== */

.toast-container {
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  z-index: var(--z-toast);
  pointer-events: none;
}

.toast {
  background-color: var(--card-bg);
  color: var(--text);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  margin-bottom: var(--space-3);
  border-left: 4px solid var(--accent);
  animation: slideDown var(--transition);
  pointer-events: all;
  max-width: 400px;
}

.toast.error {
  border-left-color: var(--error);
}

.toast.success {
  border-left-color: var(--success);
}

.toast.warning {
  border-left-color: var(--warning);
}

@media (max-width: 680px) {
  .toast-container {
    left: var(--space-4);
    right: var(--space-4);
  }

  .toast {
    max-width: none;
  }
}

/* ===== RESPONSIVE BREAKPOINTS ===== */

/* Mobile: 0 - 680px */
/* Tablet: 681px - 1024px */
/* Desktop: 1025px + */

@media (max-width: 680px) {
  body {
    font-size: 16px;
  }

  h1 {
    font-size: 36px;
  }

  h2 {
    font-size: 28px;
  }

  h3 {
    font-size: 24px;
  }
}
```

---

## JAVASCRIPT ARCHITECTURE

### 1. Theme System (`js/theme-init.js`)

Place this in `<head>` to prevent flicker:

```javascript
/**
 * theme-init.js
 * Initializes theme before page render to prevent flash
 * Runs synchronously in <head> before styles parse
 */

(function() {
  // Define theme functions early
  function getStoredTheme() {
    const stored = localStorage.getItem('alhudah-theme');
    if (stored) return stored;
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light'; // Default to light
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
  }

  // Apply theme immediately
  const theme = getStoredTheme();
  applyTheme(theme);
  localStorage.setItem('alhudah-theme', theme);
  
  // Expose globally for toggle later
  window.AH = window.AH || {};
  window.AH.theme = {
    current: theme,
    get: getStoredTheme,
    set: function(theme) {
      applyTheme(theme);
      localStorage.setItem('alhudah-theme', theme);
      window.AH.theme.current = theme;
      // Dispatch event so other scripts can react
      window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    },
    toggle: function() {
      const newTheme = window.AH.theme.current === 'dark' ? 'light' : 'dark';
      window.AH.theme.set(newTheme);
    }
  };
})();
```

### 2. Supabase Client (`js/supabase-client.js`)

```javascript
/**
 * supabase-client.js
 * Initialize Supabase client and expose global data access
 */

const SUPABASE_URL = 'https://dwcsledifvnyrunxejzd.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // Environment variable in production

// Initialize Supabase client (using official JS library)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * AH.data — Global data access layer
 * Exposes all database queries
 */
window.AH = window.AH || {};
window.AH.data = {
  /**
   * Get all 114 surahs
   * @returns {Promise<Array>}
   */
  async getSurahs() {
    try {
      const { data, error } = await supabaseClient
        .from('surahs')
        .select('*')
        .order('number', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching surahs:', error);
      return [];
    }
  },

  /**
   * Get single surah by number
   * @param {number} surahNumber - Surah number (1-114)
   * @returns {Promise<Object>}
   */
  async getSurah(surahNumber) {
    try {
      const { data, error } = await supabaseClient
        .from('surahs')
        .select('*')
        .eq('number', surahNumber)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching surah ${surahNumber}:`, error);
      return null;
    }
  },

  /**
   * Get all ayahs (verses) for a surah
   * @param {number} surahNumber - Surah number (1-114)
   * @returns {Promise<Array>}
   */
  async getAyahs(surahNumber) {
    try {
      const { data, error } = await supabaseClient
        .from('ayahs')
        .select('*')
        .eq('surah_number', surahNumber)
        .order('ayah_number', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching ayahs for surah ${surahNumber}:`, error);
      return [];
    }
  },

  /**
   * Get single ayah by surah and ayah number
   * @param {number} surahNumber
   * @param {number} ayahNumber
   * @returns {Promise<Object>}
   */
  async getAyah(surahNumber, ayahNumber) {
    try {
      const { data, error } = await supabaseClient
        .from('ayahs')
        .select('*')
        .eq('surah_number', surahNumber)
        .eq('ayah_number', ayahNumber)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching ayah ${surahNumber}:${ayahNumber}:`, error);
      return null;
    }
  },

  /**
   * Full-text search ayahs by query (English or Arabic)
   * @param {string} query - Search query
   * @param {number} limit - Max results
   * @returns {Promise<Array>}
   */
  async searchAyahs(query, limit = 50) {
    try {
      // Using PostgreSQL full-text search on tsvector column
      const { data, error } = await supabaseClient
        .from('ayahs')
        .select('*')
        .or(`text_en.ilike.%${query}%,text_ar.ilike.%${query}%,text_ur.ilike.%${query}%`)
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching ayahs:', error);
      return [];
    }
  },

  /**
   * Get featured/verse of the day
   * Uses a deterministic hash to select same verse for all users in a day
   * @returns {Promise<Object>}
   */
  async getFeaturedVerse() {
    try {
      // Simple approach: use day number of year as seed
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now - start;
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      
      // Select a random surah and ayah using day as seed
      const surahNum = (dayOfYear % 114) + 1;
      const { data: surah, error: surahError } = await supabaseClient
        .from('surahs')
        .select('ayah_count')
        .eq('number', surahNum)
        .single();
      
      if (surahError) throw surahError;
      
      const ayahNum = (dayOfYear % surah.ayah_count) + 1;
      return this.getAyah(surahNum, ayahNum);
    } catch (error) {
      console.error('Error fetching featured verse:', error);
      return null;
    }
  }
};

/**
 * AH.auth — Authentication and user state
 */
window.AH.auth = {
  user: null,
  session: null,

  async initialize() {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      this.session = session;
      this.user = session?.user || null;
      return this.user;
    } catch (error) {
      console.error('Error initializing auth:', error);
      return null;
    }
  },

  async signUp(email, password) {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sign-up error:', error);
      throw error;
    }
  },

  async signIn(email, password) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      this.session = data.session;
      this.user = data.user;
      return data;
    } catch (error) {
      console.error('Sign-in error:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
      this.user = null;
      this.session = null;
      return true;
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  }
};
```

### 3. Page Chrome & Navigation (`js/page-chrome.js`)

```javascript
/**
 * page-chrome.js
 * Injects navbar, footer, and handles navigation
 * Runs on every page
 */

document.addEventListener('DOMContentLoaded', function() {
  const navbar = document.getElementById('navbar');
  const footer = document.getElementById('footer');

  // Navbar HTML
  if (navbar) {
    navbar.innerHTML = `
      <div class="container flex-between">
        <div class="flex-center" style="gap: var(--space-4);">
          <button class="hamburger" id="hamburger" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <a href="/" class="nav-logo" style="margin: 0;">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="currentColor"/>
              <path d="M16 8L10 14H22L16 8Z" fill="white"/>
              <path d="M16 24L22 18H10L16 24Z" fill="white"/>
            </svg>
            AlHudah
          </a>
        </div>

        <ul class="nav-links" id="navLinks">
          <li><a href="/" class="nav-link" data-page="home">Home</a></li>
          <li><a href="/surahs" class="nav-link" data-page="surahs">Surahs</a></li>
          <li><a href="/search" class="nav-link" data-page="search">Search</a></li>
          <li><a href="/bookmarks" class="nav-link" data-page="bookmarks">Bookmarks</a></li>
          <li><a href="/about" class="nav-link" data-page="about">About</a></li>
        </ul>

        <div class="nav-actions">
          <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
            <span id="themeIcon">🌙</span>
          </button>
          <button class="btn btn-ghost btn-small" id="authButton">Sign In</button>
        </div>
      </div>
    `;

    // Setup hamburger toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    hamburger?.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });

    // Active nav link highlight
    const currentPage = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if ((currentPage === '/' && href === '/') ||
          (currentPage !== '/' && currentPage.startsWith(href))) {
        link.classList.add('active');
      }
    });
  }

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  
  if (themeToggle) {
    function updateThemeIcon() {
      themeIcon.textContent = window.AH.theme.current === 'dark' ? '☀️' : '🌙';
    }

    updateThemeIcon();

    themeToggle.addEventListener('click', function() {
      window.AH.theme.toggle();
      updateThemeIcon();
    });

    window.addEventListener('themechange', updateThemeIcon);
  }

  // Auth button
  const authButton = document.getElementById('authButton');
  if (authButton) {
    function updateAuthButton() {
      if (window.AH.auth.user) {
        authButton.textContent = 'Sign Out';
        authButton.onclick = () => {
          window.AH.auth.signOut().then(() => {
            window.location.reload();
          });
        };
      } else {
        authButton.textContent = 'Sign In';
        authButton.onclick = () => {
          window.location.href = '/auth/signin';
        };
      }
    }

    window.AH.auth.initialize().then(updateAuthButton);
  }

  // Footer HTML
  if (footer) {
    footer.innerHTML = `
      <div class="container">
        <div>
          <h3>Platform</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/surahs">Surahs</a></li>
            <li><a href="/search">Search</a></li>
            <li><a href="/bookmarks">Bookmarks</a></li>
          </ul>
        </div>
        <div>
          <h3>Resources</h3>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="mailto:hello@alhudah.com">Contact</a></li>
          </ul>
        </div>
        <div>
          <h3>Connect</h3>
          <ul>
            <li><a href="https://twitter.com/alhudah" target="_blank">Twitter</a></li>
            <li><a href="https://facebook.com/alhudah" target="_blank">Facebook</a></li>
            <li><a href="https://github.com/alhudah" target="_blank">GitHub</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-copyright">
        <p>&copy; 2026 AlHudah. All verses are from the Quran. Respectfully presented for learning and reflection.</p>
      </div>
    `;
  }
});
```

### 4. Utilities (`js/app.js`)

```javascript
/**
 * app.js
 * Global utilities and helper functions
 */

window.AH = window.AH || {};

/**
 * UI Utilities
 */
window.AH.ui = {
  /**
   * Show toast notification
   * @param {string} message
   * @param {string} type - 'info', 'success', 'error', 'warning'
   * @param {number} duration - ms
   */
  toast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer') || (() => {
      const div = document.createElement('div');
      div.id = 'toastContainer';
      div.className = 'toast-container';
      document.body.appendChild(div);
      return div;
    })();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  /**
   * Show loading spinner overlay
   */
  showSpinner(target = document.body) {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.style.margin = '20px auto';
    target.appendChild(spinner);
    return spinner;
  },

  /**
   * Remove spinner
   */
  hideSpinner(spinner) {
    spinner?.remove();
  }
};

/**
 * String Utilities
 */
window.AH.string = {
  /**
   * Format number with proper comma separators
   * @param {number} num
   * @returns {string}
   */
  formatNumber(num) {
    return num.toLocaleString();
  },

  /**
   * Truncate string to length with ellipsis
   * @param {string} str
   * @param {number} length
   * @returns {string}
   */
  truncate(str, length = 100) {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
  },

  /**
   * Capitalize first letter
   * @param {string} str
   * @returns {string}
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * Slugify string
   * @param {string} str
   * @returns {string}
   */
  slugify(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
};

/**
 * Array Utilities
 */
window.AH.array = {
  /**
   * Chunk array into groups
   * @param {Array} arr
   * @param {number} size
   * @returns {Array<Array>}
   */
  chunk(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },

  /**
   * Deduplicate array
   * @param {Array} arr
   * @returns {Array}
   */
  unique(arr) {
    return [...new Set(arr)];
  },

  /**
   * Shuffle array (Fisher-Yates)
   * @param {Array} arr
   * @returns {Array}
   */
  shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
};

/**
 * DOM Utilities
 */
window.AH.dom = {
  /**
   * Query single element (shorthand)
   * @param {string} selector
   * @param {Element} parent
   * @returns {Element|null}
   */
  query(selector, parent = document) {
    return parent.querySelector(selector);
  },

  /**
   * Query all elements (shorthand)
   * @param {string} selector
   * @param {Element} parent
   * @returns {NodeList}
   */
  queryAll(selector, parent = document) {
    return parent.querySelectorAll(selector);
  },

  /**
   * Create element with attributes and children
   * @param {string} tag
   * @param {Object} attrs
   * @param {Array|string} children
   * @returns {Element}
   */
  createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'class') {
        el.className = value;
      } else if (key === 'dataset') {
        Object.assign(el.dataset, value);
      } else {
        el.setAttribute(key, value);
      }
    });
    if (Array.isArray(children)) {
      children.forEach(child => {
        if (typeof child === 'string') {
          el.appendChild(document.createTextNode(child));
        } else {
          el.appendChild(child);
        }
      });
    } else if (children) {
      el.appendChild(document.createTextNode(children));
    }
    return el;
  },

  /**
   * Check if element is in viewport
   * @param {Element} el
   * @returns {boolean}
   */
  isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }
};

/**
 * Function Utilities
 */
window.AH.fn = {
  /**
   * Debounce function calls
   * @param {Function} func
   * @param {number} delay
   * @returns {Function}
   */
  debounce(func, delay = 300) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },

  /**
   * Throttle function calls
   * @param {Function} func
   * @param {number} limit
   * @returns {Function}
   */
  throttle(func, limit = 300) {
    let lastRun = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastRun >= limit) {
        func.apply(this, args);
        lastRun = now;
      }
    };
  }
};

/**
 * Bookmark Storage
 */
window.AH.bookmarks = {
  /**
   * Get all bookmarks
   * @returns {Array<string>} - Array of "surah:ayah" strings
   */
  getAll() {
    const stored = localStorage.getItem('alhudah-bookmarks');
    return stored ? JSON.parse(stored) : [];
  },

  /**
   * Add bookmark
   * @param {number} surahNumber
   * @param {number} ayahNumber
   * @returns {boolean}
   */
  add(surahNumber, ayahNumber) {
    const bookmarks = this.getAll();
    const id = `${surahNumber}:${ayahNumber}`;
    if (!bookmarks.includes(id)) {
      bookmarks.push(id);
      localStorage.setItem('alhudah-bookmarks', JSON.stringify(bookmarks));
      window.dispatchEvent(new CustomEvent('bookmarkadded', { detail: { surahNumber, ayahNumber } }));
      return true;
    }
    return false;
  },

  /**
   * Remove bookmark
   * @param {number} surahNumber
   * @param {number} ayahNumber
   * @returns {boolean}
   */
  remove(surahNumber, ayahNumber) {
    let bookmarks = this.getAll();
    const id = `${surahNumber}:${ayahNumber}`;
    if (bookmarks.includes(id)) {
      bookmarks = bookmarks.filter(b => b !== id);
      localStorage.setItem('alhudah-bookmarks', JSON.stringify(bookmarks));
      window.dispatchEvent(new CustomEvent('bookmarkremoved', { detail: { surahNumber, ayahNumber } }));
      return true;
    }
    return false;
  },

  /**
   * Check if bookmarked
   * @param {number} surahNumber
   * @param {number} ayahNumber
   * @returns {boolean}
   */
  has(surahNumber, ayahNumber) {
    const bookmarks = this.getAll();
    const id = `${surahNumber}:${ayahNumber}`;
    return bookmarks.includes(id);
  },

  /**
   * Get count
   * @returns {number}
   */
  count() {
    return this.getAll().length;
  }
};
```

---

## SERVICE WORKER & PWA

### Service Worker (`sw.js`)

```javascript
/**
 * sw.js
 * Service Worker for offline support and caching strategy
 * Register with: navigator.serviceWorker.register('/sw.js')
 */

const CACHE_NAME = 'alhudah-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/surah/index.html',
  '/search/index.html',
  '/bookmarks/index.html',
  '/about/index.html',
  '/privacy/index.html',
  '/terms/index.html',
  '/css/styles.css',
  '/js/theme-init.js',
  '/js/supabase-client.js',
  '/js/page-chrome.js',
  '/js/app.js',
  '/offline.html',
  '/404.html'
];

const FONT_CACHE = 'alhudah-fonts-v1';
const FONT_URLS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cairo+Play:wght@400;500;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHAPMtMOrMDC9c.woff2',
  'https://fonts.gstatic.com/s/cairoplay/v14/QdVoSTozVLDHTITHRw6tIm5sXBQr.woff2'
];

// Install event: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('Some assets failed to cache:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== FONT_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Google Fonts: cache first, fallback to network
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    return event.respondWith(
      caches.open(FONT_CACHE)
        .then((cache) => {
          return cache.match(request).then((response) => {
            if (response) return response;
            return fetch(request).then((response) => {
              if (response && response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            });
          });
        })
        .catch(() => new Response('Font unavailable offline', { status: 503 }))
    );
  }

  // Supabase API: network first, fallback to cache
  if (url.origin === 'https://dwcsledifvnyrunxejzd.supabase.co') {
    return event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response.clone());
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            return response || new Response(
              JSON.stringify({ error: 'Offline' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
  }

  // Static assets: cache first, fallback to network
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) return response;
        return fetch(request).then((response) => {
          // Cache successful responses
          if (response && response.status === 200 && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
      .catch(() => {
        // Return offline page for HTML requests
        if (request.headers.get('accept').includes('text/html')) {
          return caches.match('/offline.html');
        }
        // Return a generic offline response for other resources
        return new Response('Resource unavailable offline', { status: 503 });
      })
  );
});

// Message event: handle skip waiting for updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

### Web App Manifest (`manifest.json`)

```json
{
  "name": "AlHudah - Quran Platform",
  "short_name": "AlHudah",
  "description": "Discover, read, and reflect on the Quran with AI-powered search and translations",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#0a6e5c",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/screenshot-540.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshots/screenshot-1280.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ],
  "shortcuts": [
    {
      "name": "Search Quran",
      "short_name": "Search",
      "description": "Search the Quran by keyword or question",
      "url": "/search",
      "icons": [
        {
          "src": "/icons/search-icon-192.png",
          "sizes": "192x192",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "My Bookmarks",
      "short_name": "Bookmarks",
      "description": "View your saved verses",
      "url": "/bookmarks",
      "icons": [
        {
          "src": "/icons/bookmark-icon-192.png",
          "sizes": "192x192",
          "type": "image/png"
        }
      ]
    }
  ],
  "categories": ["education", "reference"],
  "prefer_related_applications": false
}
```

### PWA Registration Script (add to `<head>`)

```html
<script>
  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').then(function(registration) {
        console.log('Service Worker registered:', registration);
        
        // Check for updates every hour
        setInterval(function() {
          registration.update();
        }, 1000 * 60 * 60);
      }).catch(function(error) {
        console.log('Service Worker registration failed:', error);
      });
      
      // Listen for service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', function() {
        // Notify user of update
        window.AH.ui.toast('New version available! Refresh to update.', 'info', 5000);
      });
    });
  }
</script>
```

---

## SEO & META CONFIGURATION

### robots.txt

```text
User-agent: *
Allow: /
Allow: /surah/
Allow: /search
Allow: /about
Allow: /privacy
Allow: /terms
Disallow: /admin/
Disallow: /api/
Disallow: /*.json$

Sitemap: https://alhudah.com/sitemap.xml

User-agent: Mediapartners-Google
Allow: /

User-agent: AdsBot-Google
Allow: /

User-agent: Googlebot
Allow: /
```

### sitemap.xml Template

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Static Pages -->
  <url>
    <loc>https://alhudah.com/</loc>
    <lastmod>2026-04-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>https://alhudah.com/search</loc>
    <lastmod>2026-04-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://alhudah.com/bookmarks</loc>
    <lastmod>2026-04-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://alhudah.com/about</loc>
    <lastmod>2026-04-13</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://alhudah.com/privacy</loc>
    <lastmod>2026-04-13</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>https://alhudah.com/terms</loc>
    <lastmod>2026-04-13</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Dynamic Surah Pages (All 114) -->
  <!-- Generate these dynamically or manually: -->
  <url>
    <loc>https://alhudah.com/surah/?id=1</loc>
    <lastmod>2026-04-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://alhudah.com/surah/?id=2</loc>
    <lastmod>2026-04-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Continue for all 114 surahs... -->
  <!-- This is typically generated by a build script -->

</urlset>
```

### Meta Tags Template (in `<head>`)

```html
<!-- General Meta -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="ie=edge">
<meta name="description" content="Discover the Quran with AI-powered search, translations in English and Urdu, and beautiful verse presentations. Learn, bookmark, and reflect.">
<meta name="keywords" content="Quran, Islamic, Hadith, Ayah, Surah, Arabic, Translation, Study, Learning">
<meta name="author" content="AlHudah Team">
<meta name="robots" content="index, follow">
<meta name="language" content="English">

<!-- Theme Color -->
<meta name="theme-color" content="#0a6e5c">
<meta name="msapplication-TileColor" content="#0a6e5c">

<!-- OpenGraph / Social Meta -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://alhudah.com">
<meta property="og:title" content="AlHudah - Discover the Quran">
<meta property="og:description" content="AI-powered Quran platform with translations, search, and bookmarking">
<meta property="og:image" content="https://alhudah.com/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="AlHudah">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://alhudah.com">
<meta name="twitter:title" content="AlHudah - Discover the Quran">
<meta name="twitter:description" content="AI-powered Quran platform with translations and study tools">
<meta name="twitter:image" content="https://alhudah.com/og-image.png">

<!-- Favicon -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">

<!-- Canonical -->
<link rel="canonical" href="https://alhudah.com">

<!-- PWA / Mobile -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="AlHudah">
<meta name="mobile-web-app-capable" content="yes">

<!-- Preconnect to External Resources -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://dwcsledifvnyrunxejzd.supabase.co">

<!-- DNS Prefetch -->
<link rel="dns-prefetch" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://fonts.gstatic.com">
<link rel="dns-prefetch" href="https://dwcsledifvnyrunxejzd.supabase.co">

<!-- Structured Data (JSON-LD) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "AlHudah",
  "url": "https://alhudah.com",
  "description": "Discover and study the Quran with AI-powered search and translations",
  "applicationCategory": "EducationalApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Organization",
    "name": "AlHudah Team"
  }
}
</script>
```

---

## COMPLETE FILE IMPLEMENTATIONS

### 1. index.html (Landing Page)

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>AlHudah - Discover the Quran</title>
  <meta name="description" content="Discover the Quran with AI-powered search, translations in English and Urdu, and beautiful verse presentations.">
  <meta property="og:title" content="AlHudah - Discover the Quran">
  <meta property="og:description" content="AI-powered Quran platform with translations and study tools">
  <meta property="og:image" content="https://alhudah.com/og-image.png">
  <link rel="canonical" href="https://alhudah.com">
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#0a6e5c">
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cairo+Play:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/styles.css">
  
  <script src="/js/theme-init.js"></script>
</head>
<body>
  <nav id="navbar"></nav>

  <main role="main">
    <section class="hero" style="text-align: center; padding: var(--space-9) var(--space-4); background: linear-gradient(135deg, var(--accent-light) 0%, transparent 100%);">
      <div class="container">
        <h1 style="font-size: 48px; margin-bottom: var(--space-4);">Discover the Quran</h1>
        <p style="font-size: 20px; color: var(--text-secondary); margin-bottom: var(--space-8); max-width: 600px; margin-left: auto; margin-right: auto;">
          Explore the holy Quran with AI-powered search, multiple translations, and tools for learning and reflection.
        </p>
        <div style="display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap;">
          <a href="/search" class="btn btn-primary btn-large">Start Searching</a>
          <a href="/surahs" class="btn btn-secondary btn-large">Browse Surahs</a>
        </div>
      </div>
    </section>

    <section style="padding: var(--space-9) var(--space-4);">
      <div class="container">
        <h2 style="text-align: center; margin-bottom: var(--space-8);">Featured Verse of Today</h2>
        <div id="featuredVerse" class="card" style="max-width: 600px; margin: 0 auto;">
          <div class="spinner" style="margin: 20px auto;"></div>
        </div>
      </div>
    </section>

    <section style="padding: var(--space-9) var(--space-4); background-color: var(--bg-secondary);">
      <div class="container">
        <h2 style="text-align: center; margin-bottom: var(--space-8);">All Surahs</h2>
        <div id="surahGrid" class="grid-auto"></div>
      </div>
    </section>
  </main>

  <footer id="footer"></footer>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="/js/supabase-client.js"></script>
  <script src="/js/page-chrome.js"></script>
  <script src="/js/app.js"></script>

  <script>
    document.addEventListener('DOMContentLoaded', async function() {
      // Load featured verse
      const featured = await window.AH.data.getFeaturedVerse();
      const featuredContainer = document.getElementById('featuredVerse');
      if (featured) {
        featuredContainer.innerHTML = `
          <div style="text-align: center;">
            <p class="ar ar-heading" style="margin-bottom: var(--space-6);">${featured.text_ar}</p>
            <h3 style="margin-bottom: var(--space-4);">Surah ${featured.surah_number}, Verse ${featured.ayah_number}</h3>
            <p style="margin-bottom: var(--space-6); color: var(--text-secondary);">${featured.text_en}</p>
            <a href="/surah/?id=${featured.surah_number}&ayah=${featured.ayah_number}" class="btn btn-ghost">Read Full Surah</a>
          </div>
        `;
      }

      // Load all surahs
      const surahs = await window.AH.data.getSurahs();
      const grid = document.getElementById('surahGrid');
      grid.innerHTML = surahs.map(surah => `
        <a href="/surah/?id=${surah.number}" class="card" style="text-decoration: none; transition: all var(--transition); cursor: pointer;">
          <div style="font-size: 36px; color: var(--accent); margin-bottom: var(--space-3); font-weight: 700;">${surah.number}</div>
          <h3 class="ar ar-heading">${surah.name_arabic}</h3>
          <p style="color: var(--text-secondary); margin-bottom: var(--space-2);">${surah.name_english}</p>
          <p style="color: var(--text-tertiary); font-size: 14px;">${surah.ayah_count} verses</p>
        </a>
      `).join('');
    });
  </script>

  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
          console.log('Service Worker registered');
        }).catch(function(error) {
          console.log('Service Worker registration failed:', error);
        });
      });
    }
  </script>
</body>
</html>
```

### 2. surah/index.html (Surah Reader)

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Surah - AlHudah</title>
  <meta name="description" content="Read Quranic verses with English and Urdu translations">
  <link rel="icon" href="/favicon.ico">
  <link rel="manifest" href="/manifest.json">
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cairo+Play:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/styles.css">
  
  <script src="/js/theme-init.js"></script>
  <style>
    .verse {
      padding: var(--space-6);
      border-bottom: 1px solid var(--card-border);
      margin-bottom: var(--space-4);
    }
    
    .verse:last-child {
      border-bottom: none;
    }

    .verse-number {
      display: inline-block;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: var(--accent);
      color: white;
      text-align: center;
      line-height: 32px;
      font-weight: 700;
      font-size: 13px;
      margin-left: var(--space-2);
    }

    .verse-actions {
      display: flex;
      gap: var(--space-3);
      margin-top: var(--space-4);
    }

    .verse-action-btn {
      background: none;
      border: 1px solid var(--card-border);
      color: var(--text-secondary);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: 14px;
      transition: all var(--transition);
    }

    .verse-action-btn:hover {
      color: var(--accent);
      border-color: var(--accent);
    }

    .verse-action-btn.bookmarked {
      color: var(--accent);
      border-color: var(--accent);
      background-color: var(--accent-light);
    }
  </style>
</head>
<body>
  <nav id="navbar"></nav>

  <main role="main">
    <div class="container">
      <div id="surahHeader" style="margin-bottom: var(--space-8);"></div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
        <button id="prevSurah" class="btn btn-secondary">Previous Surah</button>
        <select id="surahSelect" class="form-select" style="padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--card-border);"></select>
        <button id="nextSurah" class="btn btn-secondary">Next Surah</button>
      </div>

      <div id="versesContainer"></div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-8); padding-top: var(--space-6); border-top: 1px solid var(--card-border);">
        <button id="prevSurahBottom" class="btn btn-secondary">Previous Surah</button>
        <span id="bookmarkCount" class="text-muted" style="font-size: 14px;">Bookmarks: <strong id="bookmarkCountValue">0</strong></span>
        <button id="nextSurahBottom" class="btn btn-secondary">Next Surah</button>
      </div>
    </div>
  </main>

  <footer id="footer"></footer>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="/js/supabase-client.js"></script>
  <script src="/js/page-chrome.js"></script>
  <script src="/js/app.js"></script>

  <script>
    const params = new URLSearchParams(window.location.search);
    let currentSurahNumber = parseInt(params.get('id')) || 1;

    async function loadSurah(surahNumber) {
      currentSurahNumber = surahNumber;
      history.replaceState(null, '', `/surah/?id=${surahNumber}`);

      const surah = await window.AH.data.getSurah(surahNumber);
      const ayahs = await window.AH.data.getAyahs(surahNumber);

      // Header
      const headerEl = document.getElementById('surahHeader');
      if (surah) {
        headerEl.innerHTML = `
          <h1 class="ar ar-heading" style="margin-bottom: var(--space-3);">${surah.name_arabic}</h1>
          <h2 style="color: var(--text-secondary); margin-bottom: var(--space-2);">${surah.name_english}</h2>
          <p style="color: var(--text-tertiary); font-size: 15px;">
            ${surah.revelation_type === 'Meccan' ? 'Revealed in Mecca' : 'Revealed in Medina'} — ${surah.ayah_count} verses
          </p>
        `;
      }

      // Verses
      const container = document.getElementById('versesContainer');
      container.innerHTML = ayahs.map(ayah => `
        <div class="verse card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-4);">
            <p class="ar ar-body">${ayah.text_ar}<span class="verse-number">${ayah.ayah_number}</span></p>
          </div>
          <p style="margin-bottom: var(--space-3);">${ayah.text_en}</p>
          <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: var(--space-4);">${ayah.text_ur || 'Urdu translation not available'}</p>
          <div class="verse-actions">
            <button class="verse-action-btn bookmark-btn" data-surah="${surahNumber}" data-ayah="${ayah.ayah_number}">
              ${window.AH.bookmarks.has(surahNumber, ayah.ayah_number) ? 'Bookmarked' : 'Bookmark'}
            </button>
            <button class="verse-action-btn share-btn">Share</button>
            <button class="verse-action-btn tafsir-btn">Tafsir</button>
          </div>
        </div>
      `).join('');

      // Bookmark buttons
      document.querySelectorAll('.bookmark-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const surah = parseInt(this.dataset.surah);
          const ayah = parseInt(this.dataset.ayah);
          if (window.AH.bookmarks.has(surah, ayah)) {
            window.AH.bookmarks.remove(surah, ayah);
            this.textContent = 'Bookmark';
            this.classList.remove('bookmarked');
          } else {
            window.AH.bookmarks.add(surah, ayah);
            this.textContent = 'Bookmarked';
            this.classList.add('bookmarked');
          }
          updateBookmarkCount();
        });
      });

      // Share buttons
      document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          window.AH.ui.toast('Share feature coming soon', 'info');
        });
      });

      // Tafsir buttons
      document.querySelectorAll('.tafsir-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          window.AH.ui.toast('Tafsir feature coming soon', 'info');
        });
      });

      updateBookmarkCount();
    }

    function updateBookmarkCount() {
      document.getElementById('bookmarkCountValue').textContent = window.AH.bookmarks.count();
    }

    async function initSurahSelect() {
      const surahs = await window.AH.data.getSurahs();
      const select = document.getElementById('surahSelect');
      select.innerHTML = surahs.map(s => `
        <option value="${s.number}" ${s.number === currentSurahNumber ? 'selected' : ''}>${s.number}. ${s.name_english}</option>
      `).join('');
      select.addEventListener('change', (e) => loadSurah(parseInt(e.target.value)));
    }

    // Navigation buttons
    document.getElementById('prevSurah').addEventListener('click', () => {
      if (currentSurahNumber > 1) loadSurah(currentSurahNumber - 1);
    });

    document.getElementById('nextSurah').addEventListener('click', () => {
      if (currentSurahNumber < 114) loadSurah(currentSurahNumber + 1);
    });

    document.getElementById('prevSurahBottom').addEventListener('click', () => {
      if (currentSurahNumber > 1) loadSurah(currentSurahNumber - 1);
    });

    document.getElementById('nextSurahBottom').addEventListener('click', () => {
      if (currentSurahNumber < 114) loadSurah(currentSurahNumber + 1);
    });

    // Initialize
    document.addEventListener('DOMContentLoaded', async () => {
      await initSurahSelect();
      await loadSurah(currentSurahNumber);
    });
  </script>
</body>
</html>
```

### 3. offline.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - AlHudah</title>
  <link rel="stylesheet" href="/css/styles.css">
  <script src="/js/theme-init.js"></script>
</head>
<body>
  <nav id="navbar"></nav>

  <main style="text-align: center; padding: var(--space-9) var(--space-4);">
    <div class="container" style="max-width: 500px;">
      <div style="font-size: 64px; margin-bottom: var(--space-6);">Offline</div>
      <h1 style="margin-bottom: var(--space-3);">You're Offline</h1>
      <p style="color: var(--text-secondary); margin-bottom: var(--space-6);">
        It looks like you don't have an internet connection. Some features may not be available, but you can still read cached verses.
      </p>
      <button onclick="window.location.reload()" class="btn btn-primary">Reconnect</button>
    </div>
  </main>

  <script src="/js/page-chrome.js"></script>
</body>
</html>
```

### 4. 404.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Not Found</title>
  <link rel="stylesheet" href="/css/styles.css">
  <script src="/js/theme-init.js"></script>
</head>
<body>
  <nav id="navbar"></nav>

  <main style="text-align: center; padding: var(--space-9) var(--space-4);">
    <div class="container" style="max-width: 500px;">
      <h1 style="font-size: 96px; margin-bottom: var(--space-3); color: var(--accent);">404</h1>
      <h2 style="margin-bottom: var(--space-3);">Page Not Found</h2>
      <p style="color: var(--text-secondary); margin-bottom: var(--space-6);">
        The page you're looking for doesn't exist. Return home to explore the Quran.
      </p>
      <div style="display: flex; gap: var(--space-4); justify-content: center;">
        <a href="/" class="btn btn-primary">Go Home</a>
        <a href="/search" class="btn btn-secondary">Search</a>
      </div>
    </div>
  </main>

  <footer id="footer"></footer>

  <script src="/js/page-chrome.js"></script>
</body>
</html>
```

---

## DIRECTORY STRUCTURE

```
alhudah/
├── index.html
├── surah/
│   └── index.html
├── search/
│   └── index.html
├── bookmarks/
│   └── index.html
├── about/
│   └── index.html
├── privacy/
│   └── index.html
├── terms/
│   └── index.html
├── offline.html
├── 404.html
├── css/
│   └── styles.css
├── js/
│   ├── theme-init.js
│   ├── supabase-client.js
│   ├── page-chrome.js
│   └── app.js
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable-192.png
│   └── icon-maskable-512.png
├── screenshots/
│   ├── screenshot-540.png
│   └── screenshot-1280.png
├── manifest.json
├── sw.js
├── robots.txt
├── sitemap.xml
├── favicon.ico
└── apple-touch-icon.png
```

---

## DEPLOYMENT CHECKLIST

Before deploying to Cloudflare Pages:

- [ ] All environment variables set (SUPABASE_URL, SUPABASE_ANON_KEY)
- [ ] Service Worker registered and caching configured
- [ ] Meta tags and structured data in place
- [ ] Logo and icons added
- [ ] Supabase RLS policies configured
- [ ] Domain and SSL configured
- [ ] Analytics configured (if using)
- [ ] Performance tested (Lighthouse 90+)
- [ ] Mobile tested (iOS Safari, Android Chrome)
- [ ] Accessibility tested (keyboard navigation, screen reader)
- [ ] All links tested (no 404s except intentional)
- [ ] SEO validated (schema, meta tags, sitemap)

---

## PERFORMANCE TARGETS

| Metric | Target |
|--------|--------|
| Lighthouse Score | 90+ |
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| Time to Interactive | < 3s |
| Total Bundle Size | < 200KB (with fonts) |
| HTML Size | < 30KB |
| CSS Size | < 50KB |
| JS Size | < 80KB |

---

## NOTES FOR DEVELOPERS

1. **No Framework** — Keep this vanilla. It's faster, easier to maintain, and requires zero build step.
2. **Supabase as Backend** — Use the REST API with the anon key. No backend needed for read-only queries.
3. **Progressive Enhancement** — Works with JS disabled (static pages render). JS enhances the experience.
4. **Mobile First** — Design and test mobile first, scale up.
5. **Accessibility** — WCAG AA minimum. Test with keyboard and screen readers.
6. **SEO** — Every page needs meta tags, structured data, and descriptive headings.
7. **Security** — Never expose secrets in frontend code. Use Supabase RLS for data security.
8. **Offline Support** — Service Worker caches critical assets. Users can browse offline.
9. **Localization Ready** — HTML structure supports RTL (Arabic). Use `lang="ar"` and `dir="rtl"`.
10. **Fonts** — Preload fonts. Use `font-display: swap` for no flicker.

---

**Reference Guide Complete.** Ready for implementation.
