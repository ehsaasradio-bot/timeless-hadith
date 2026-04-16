# Timeless Hadith 📿

> Authentic, searchable hadiths from Prophet Muhammad ﷺ — beautifully organised, beautifully presented.

[![Deploy Status](https://img.shields.io/badge/deploy-live-brightgreen)](https://timelesshadith.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![HTML](https://img.shields.io/badge/HTML5-pure%20static-orange)](index.html)
[![PDPL](https://img.shields.io/badge/PDPL-compliant-green)](privacy.html)

---

## Overview

**Timeless Hadith** is a pure-static, zero-dependency website that makes the Prophetic tradition accessible, searchable, and shareable for everyone. Built with Apple-inspired design principles — clean typography, fluid dark/light mode, and smooth interactions — all in a single HTML file with no build step required.

**Live site:** [timelesshadith.com](https://timelesshadith.com)

---

## Features

| Feature | Description |
|---|---|
| 🌗 Dark / Light mode | Persistent theme toggle, respects system preference |
| 🔍 Live search | Searches categories, titles, descriptions & subcategories as you type |
| 📂 6 per page | Paginated category grid with animated prev/next navigation |
| 🏷 Subcategories | Every topic card has 3–4 subcategory pills |
| 🖼 Share as Image | Canvas API renders a 1200×630 branded share card (PNG download) |
| 📋 Share as Text | Native Web Share API with clipboard fallback |
| 🍪 Cookie banner | PDPL-compliant consent box (Saudi Arabia Regulation No. M/19, 2021) |
| 📱 Fully responsive | Mobile-first, tested down to 320 px |
| ♿ Accessible | Semantic HTML, ARIA labels, skip nav, focus-visible, reduced-motion |
| ⚡ Zero dependencies | No npm, no bundler, no frameworks — pure HTML/CSS/JS |

---

## Project Structure

```
timeless-hadith/
├── .github/
│   ├── workflows/
│   │   └── pages.yml              # GitHub Pages auto-deploy
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
│
├── index.html                     # Homepage — hero, search, categories
├── category.html                  # Individual topic / hadith listing page
├── about.html                     # About the project
├── privacy.html                   # Privacy Policy (PDPL-compliant)
├── terms.html                     # Terms of Use
├── 404.html                       # Custom 404 error page
│
├── manifest.json                  # PWA web app manifest
├── robots.txt                     # Crawl directives
├── sitemap.xml                    # XML sitemap for search engines
├── _headers                       # Security headers (Netlify / Cloudflare Pages)
│
├── timelesshadith-logo.png        # Main logo (light + dark via CSS filter)
├── favicon-16.png                 # ← Add your favicons
├── favicon-32.png                 # ← Add your favicons
├── icon-192.png                   # ← PWA icon
├── icon-512.png                   # ← PWA icon
├── apple-touch-icon.png           # ← iOS icon
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## Getting Started

### Local development

No build step needed. Just open `index.html` in your browser:

```bash
git clone https://github.com/YOUR_USERNAME/timeless-hadith.git
cd timeless-hadith

# Option A — open directly
open index.html

# Option B — serve locally (recommended to avoid CORS on icons)
npx serve .
# or
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

---

## Deployment

### GitHub Pages (recommended — free)

1. Push to GitHub
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch** → `main` → `/ (root)`
4. Your site will be live at `https://YOUR_USERNAME.github.io/timeless-hadith/`

The included `.github/workflows/pages.yml` handles this automatically on every push to `main`.

### Cloudflare Pages

1. Connect your GitHub repo in the Cloudflare Pages dashboard
2. Build command: *(leave empty — static site)*
3. Output directory: `/` (root)
4. The `_headers` file is picked up automatically for security headers

### Netlify

1. Drag the project folder onto [netlify.com/drop](https://netlify.com/drop), or
2. Connect via GitHub in the Netlify dashboard
3. Build command: *(leave empty)*
4. Publish directory: `.`

The `_headers` file is picked up automatically.

---

## Adding Favicons

The site references these icon files — generate them from your logo at [realfavicongenerator.net](https://realfavicongenerator.net) and place them in the root:

```
favicon-16.png
favicon-32.png
icon-192.png
icon-512.png
apple-touch-icon.png
```

---

## Categories

The site currently includes 21 hadith topic categories:

Faith & Belief · Character & Conduct · Prayer & Worship · Family & Relations · Knowledge & Learning · Patience & Gratitude · Charity & Generosity · Honesty & Truthfulness · Repentance & Forgiveness · Health & Body · Neighbours & Community · Death & Afterlife · Remembrance of Allah · Wealth & Livelihood · Justice & Fairness · Intentions & Actions · Fasting & Ramadan · Humility & Pride · Love & Brotherhood · Supplication & Dua · Trust & Reliance on Allah

Each category links to `category.html?cat=<slug>` and includes 3–4 subcategory tags.

---

## Legal & Compliance

| Document | Path | Notes |
|---|---|---|
| Privacy Policy | `/privacy.html` | PDPL-compliant (Saudi Arabia Regulation M/19, 2021) |
| Terms of Use | `/terms.html` | Covers content use, sharing, and limitations |
| Cookie consent | Built into `index.html` | Stores `cookieConsent` in `localStorage` |
| License | `/LICENSE` | MIT (code) + Hadith content notice |

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-improvement`
3. Commit your changes: `git commit -m 'Add: description of change'`
4. Push: `git push origin feature/my-improvement`
5. Open a Pull Request

Please follow the existing code style (no external dependencies, semantic HTML, accessible markup).

---

## Commit Message Convention

```
Add:    new feature or file
Fix:    bug fix
Update: change to existing feature
Remove: deleted file or feature
Docs:   README or comment update
Style:  CSS / design change (no logic change)
```

---

## Browser Support

| Browser | Supported |
|---|---|
| Chrome / Edge (last 2) | ✅ |
| Firefox (last 2) | ✅ |
| Safari 15+ | ✅ |
| iOS Safari 15+ | ✅ |
| Samsung Internet | ✅ |

`backdrop-filter` blur degrades gracefully in unsupported browsers (solid background fallback).

---

## Acknowledgements

- Hadith content sourced from canonical collections: *Sahih al-Bukhari*, *Sahih Muslim*, *Sunan an-Nasa'i*, *Sunan Abi Dawud*, *Jami' at-Tirmidhi*, *Sunan Ibn Majah*
- Design inspired by Apple's Human Interface Guidelines
- Icons: inline SVG (no external icon library required)

---

*"Actions are but by intentions, and every person will get what they intended."* — Sahih al-Bukhari 1
