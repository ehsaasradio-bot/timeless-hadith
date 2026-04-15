---
name: alhudah-quran-builder
description: "Build the AlHudah Quran platform (alhudah.com) — a full AI-powered Quran reading, translation, tafsir, and intelligent search website. Use this skill whenever the user mentions alhudah, Quran website, Quran platform, Quran app, building a Quran reader, Quran search, tafsir viewer, or any task related to developing, deploying, or maintaining alhudah.com. Also trigger when the user asks about Supabase Quran schema, quran.com API integration, Quran SEO, or Cloudflare Pages deployment for a Quran project. This skill contains the complete blueprint — from database schema to frontend code to deployment pipeline."
---

# AlHudah Quran Platform — Complete Build Skill

## Overview

AlHudah (alhudah.com) is a premium Quran reading, translation, tafsir, and AI-powered search platform. It uses the **exact same tech stack** as Timeless Hadith (timelesshadith.com), proven in production.

**Read the relevant reference file before starting each phase:**

| Phase | Reference File | What It Covers |
|-------|---------------|----------------|
| Setup & Infrastructure | `references/01-setup.md` | Domain, GitHub, Cloudflare, Supabase project creation |
| Database & Data | `references/02-database.md` | Schema design, Quran data population, quran.com API |
| Frontend Core | `references/03-frontend.md` | HTML pages, CSS, JS architecture, navigation |
| Quran Reader | `references/04-quran-reader.md` | Surah browsing, verse display, translations |
| Tafsir System | `references/05-tafsir.md` | Commentary integration, scholar sources |
| AI Search | `references/06-ai-search.md` | OpenAI embeddings, hybrid search, chat UI |
| SEO & Performance | `references/07-seo-performance.md` | Meta tags, JSON-LD, CSP, Core Web Vitals |
| Deployment & CI/CD | `references/08-deployment.md` | Cloudflare Pages, GitHub Actions, _headers |

## Tech Stack (Identical to Timeless Hadith)

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Vanilla HTML + CSS + JS | Zero build step, fast, simple |
| Database | Supabase PostgreSQL | Free tier, REST API, RLS, full-text search |
| External API | quran.com API v4 | 50+ translations, tafsir, word-by-word |
| AI | OpenAI GPT-4o-mini + Embeddings | Semantic search, natural language Q&A |
| Hosting | Cloudflare Pages | Free, global CDN, auto-deploy from GitHub |
| DNS/CDN | Cloudflare | Free SSL, caching, WAF |
| Auth | Supabase Auth | Email/password + Google OAuth |
| Edge Logic | Cloudflare Worker | API proxy, rate limiting, key protection |

## Architecture Diagram

```
User Browser
    │
    ├── Static HTML/CSS/JS ──→ Cloudflare Pages CDN
    │
    ├── Quran Data (read) ───→ Supabase REST API (anon key)
    │       └── PostgreSQL: surahs, ayahs, translations, tafsir
    │
    ├── Extended Data ───────→ quran.com API v4 (on-demand)
    │       └── Additional translations, tafsir, word-by-word
    │
    ├── AI Search ───────────→ Cloudflare Worker (proxy)
    │       └── OpenAI API: embeddings + chat completions
    │
    └── Auth ────────────────→ Supabase Auth
            └── Google OAuth + email/password
```

## Execution Rules

Follow these rules exactly (same as Timeless Hadith):

1. **Analyze** the repository before making changes
2. **Implement** the requested changes fully — do not stop at planning
3. **Validate** each change works correctly
4. **Commit** locally with conventional commit messages after each validated phase
5. **Stop before push** — always ask for approval before pushing
6. **Never commit** secrets, tokens, `.env` files, or credentials
7. **Never force-push** without explicit approval

## Commit Message Standard

```
feat(quran-reader): add surah browsing with verse display
feat(tafsir): integrate Ibn Kathir commentary panel
feat(ai-search): implement hybrid semantic + full-text search
feat(seo): add JSON-LD schema and meta optimization
feat(auth): implement Supabase Auth with Google OAuth
refactor(data): migrate from static JSON to Supabase REST
style(ui): apply Cairo Play font and premium dark theme
chore(deploy): configure Cloudflare Pages auto-deploy
docs(report): add implementation report
```

## Content & Research Rules

- Every Quranic reference must be verified against quran.com or tanzil.net
- Never invent ayah numbers, surah names, or scholarly attributions
- Tafsir content must cite the original scholar (Ibn Kathir, Jalalayn, etc.)
- All content must be respectful, accurate, and free of sectarian bias
- Arabic text must use proper Unicode with correct diacritics (tashkeel)

## Phase Execution Order

Execute phases in this order. Read the corresponding reference file before each phase.

### Phase 0 — Repository Analysis
- Inspect repo structure, detect existing files
- Review git status and branch
- Create implementation plan
- **No commit** in this phase

### Phase 1 — Infrastructure Setup
- Read `references/01-setup.md`
- Initialize GitHub repo, configure Cloudflare Pages
- Create Supabase project, set up tables
- Configure `_headers` with CSP
- **Commit:** `chore(setup): initialize project with Cloudflare + Supabase`

### Phase 2 — Database & Data Population
- Read `references/02-database.md`
- Create full Quran schema (surahs, ayahs, translations, tafsir)
- Populate from tanzil.net XML or quran.com API
- Set up full-text search indexes
- **Commit:** `feat(data): populate Quran database with 6,236 ayahs`

### Phase 3 — Frontend Foundation
- Read `references/03-frontend.md`
- Build: index.html, surah.html, about.html, bookmarks.html, search.html
- Create CSS with theme system (light/dark)
- Build shared JS modules (data layer, theme, nav)
- **Commit:** `feat(frontend): build core pages and theme system`

### Phase 4 — Quran Reader
- Read `references/04-quran-reader.md`
- Surah list with Arabic names and English translations
- Verse-by-verse display with Arabic, English, Urdu
- Juz navigation, verse bookmarking
- **Commit:** `feat(quran-reader): implement full surah and verse browsing`

### Phase 5 — Tafsir System
- Read `references/05-tafsir.md`
- Inline tafsir panel per verse
- Multiple scholar sources (Ibn Kathir, Jalalayn)
- Lazy-load from quran.com API
- **Commit:** `feat(tafsir): add multi-scholar commentary system`

### Phase 6 — AI Search & Chat
- Read `references/06-ai-search.md`
- OpenAI embeddings for semantic search
- Hybrid search: Supabase full-text + vector similarity
- Chat interface for natural language Quran questions
- **Commit:** `feat(ai-search): implement hybrid AI-powered search`

### Phase 7 — SEO & Performance
- Read `references/07-seo-performance.md`
- Meta tags, OG tags, Twitter cards per page
- JSON-LD structured data (WebSite, Book, FAQPage)
- Image optimization, lazy loading, service worker
- **Commit:** `feat(seo): optimize metadata, schema, and performance`

### Phase 8 — Deployment & CI/CD
- Read `references/08-deployment.md`
- Cloudflare Pages configuration
- GitHub Actions for validation
- Environment variables setup
- **Commit:** `chore(deploy): finalize CI/CD and deployment config`

### Phase 9 — Final QA
- Cross-device testing (mobile, tablet, desktop)
- Theme consistency check
- Broken links, images, console errors
- Performance audit (target Lighthouse 90+)
- **Commit:** `chore(qa): final polish and responsiveness fixes`

### Phase 10 — Final Report
- Create `reports/alhudah-implementation-report.md`
- Summary of all work, improvements, and recommendations
- **Commit:** `docs(report): add implementation report`

## Stop Point

After all phases, present:
- Branch name and status
- List of all commits
- List of changed files
- Report location
- Ask: "All changes implemented. Push to remote?"
