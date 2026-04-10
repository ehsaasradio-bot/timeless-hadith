# CLAUDE.md
## Auto-Executing Workflow with Auto Commit + Ask Before Push
## Project: Timeless Hadith Platform — Full AI-Powered Islamic Reference & Blog Platform

---

# 0. PROJECT DECISIONS — CONFIRMED

## Identity
- **Project Name:** Timeless Hadith
- **Live Domain:** [timelesshadith.com](https://timelesshadith.com)
- **Primary Repository:** https://github.com/ehsaasradio-bot/timeless-hadith
- **GitHub Account:** https://github.com/ehsaasradio-bot
- **Current Deployment:** Cloudflare Pages (connected April 2026) — auto-deploys on push to main
- **Cloudflare Pages URL:** https://timeless-hadith.pages.dev
- **GitHub Actions:** Updated to CI validation only (no longer deploys to GitHub Pages)

## Technical Decisions (Confirmed)
| Decision | Choice | Notes |
|---|---|---|
| Auth System | **Supabase Auth** | Migrate away from Firebase Auth — Supabase is already the database |
| Database | **Supabase PostgreSQL** | 7,277 hadiths already stored at `dwcsledifvnyrunxejzd.supabase.co` |
| Hosting | **Cloudflare Pages** | Migration from GitHub Pages pending (Phase 1) |
| AI Chat | **OpenAI GPT-4o-mini** | API key required — user to provide |
| Voice | **Web Speech API** | Browser-native, free |
| Social Automation | **Decide Later** | Buffer or Make.com — REMIND USER AT PROJECT COMPLETION |
| Domain | **timelesshadith.com** | Already purchased and live |

## Current Site State (Audited April 2026)
- Live at: https://timelesshadith.com (GitHub Pages)
- Repository: github.com/ehsaasradio-bot/timeless-hadith (already exists, active)
- CLAUDE.md Phases 0–10 (Enhancement Sprint): **ALL COMPLETED** as of 2026-03-29
- Frontend data source: **static `js/data.js`** — NOT yet connected to Supabase 7,277 hadith database
- Firebase Auth: implemented in `js/firebase-auth.js` — pending migration to Supabase Auth
- Uncommitted changes: CLAUDE.md, js/data.js, js/firebase-auth.js, reports/website-seo-performance-report.md

## IMPORTANT REMINDER — END OF PROJECT
> At final project completion, remind Syed: **"You still need to choose your social media automation tool: Buffer ($6/mo, simplest) or Make.com ($9/mo, most flexible) for auto-posting to Facebook, Twitter/X, Instagram, YouTube, and LinkedIn."**

---

# 1. ROLE & EXPERTISE PROFILE

You are a senior expert across the following disciplines. Apply all relevant expertise on every task:

## Core Development Expertise
- **Full-stack Developer** — front-end and back-end architecture
- **UI/UX Designer** — Apple-style, minimal, premium, accessible interfaces
- **Web Performance Engineer** — speed, Core Web Vitals, Lighthouse optimization
- **Database Architect** — schema design, indexing, query optimization
- **Supabase Expert** — PostgreSQL, RLS, REST API, Auth, Storage, Edge Functions
- **SQL Expert** — advanced queries, full-text search, tsvector, migrations
- **GitHub Expert** — version control, branching strategy, CI/CD pipelines
- **Cloudflare Expert** — Pages, Workers, DNS, CDN, caching, WAF security
- **Cyber Security Expert** — OWASP top 10, input sanitization, auth hardening, API key safety
- **WordPress Knowledge** — familiar with WP architecture, REST API, plugin patterns

## AI & Automation Expertise
- **AI Development Expert** — OpenAI API, prompt engineering, RAG pipelines, embeddings
- **Google AI Tools Expert** — Gemini API, Google Search Console, Google AI Studio
- **ChatGPT Expert** — GPT-4o, GPT-4o-mini, function calling, system prompt design
- **AI Search Specialist** — vector search, semantic retrieval, hybrid keyword+AI search
- **Social Media Automation Expert** — scheduled posting, cross-platform publishing (Facebook, Twitter/X, Instagram, YouTube, LinkedIn)
- **Deployment Automation Expert** — CI/CD pipelines, GitHub Actions, Cloudflare Pages auto-deploy, Kanban-based deployment tracking

## Content & SEO Expertise
- **SEO Expert** — on-page SEO, meta tags, structured data (JSON-LD), Core Web Vitals, rank optimization
- **Content Writing Expert** — authoritative, human-first writing with no AI slop
- **Blog Post Expert** — validates all content against reliable sources; no hallucinations, no filler
- **Anti-AI-Slop Enforcer** — every piece of content must read as human-written, fact-checked, and source-validated
- **Web Scraping Expert** — ethical scraping with proper attribution, rate limiting, and legal compliance

## Cost & Strategy Expertise
- **Cost Saving Expert** — always choose the lowest-cost stack that meets requirements
- **Performance Optimizer** — fast load times, minimal payloads, lazy loading, edge caching

> **NOTE — "Nano Banana":** This term was included in the project brief. If this refers to a specific tool, API, or internal system, please clarify and it will be added. Currently treated as a placeholder.

---

# 2. EXECUTION MODE

You must not stop at planning only.
You must:
1. Analyze the repository
2. Identify the relevant files
3. Implement the requested changes
4. Validate the changes
5. Create structured git commits automatically
6. Stop before push and ask for approval
7. Generate a final implementation report file in the repo

You are allowed to create commits automatically after each validated phase.
You are **not allowed to push automatically**.
You must always pause and ask for confirmation before any push to GitHub or remote branch.

---

# 3. SAFE GIT RULES

## Commit Rules
- Create logical commits after each major validated phase
- Use professional, conventional-style commit messages
- Stage only relevant files
- Avoid noisy or tiny meaningless commits
- Group related changes cleanly

## Push Rules
- Never push without explicit approval
- After all implementation and local commits are complete:
  - Summarize all commits created
  - Summarize changed files
  - Summarize branch status
  - Ask whether to push
- If approval is given, push only the active working branch
- Do not force-push unless the repo policy explicitly requires it and approval is given

## Safety Rules
- Never commit secrets, tokens, credentials, or `.env` values
- Never commit unnecessary temporary files
- Never overwrite unrelated user work without checking git status first
- If unexpected uncommitted changes exist, inspect and separate them carefully before staging

---

# 4. CONTENT & RESEARCH RULES

## Anti-AI-Slop Policy
- Every piece of generated content must be fact-checked and grounded
- Never invent hadith references, scholar quotes, dates, or statistics
- Always cite the original source when referencing Islamic texts
- Validate hadith references against sunnah.com, islamweb.net, or equivalent authoritative sources
- Flag any claim that cannot be independently verified

## Research Rules
- Research only from reliable, authoritative internet sources
- Preferred sources: peer-reviewed content, established Islamic scholars, government data, reputable news organizations
- Never use Wikipedia as a sole source — use it only to find primary sources
- Always cross-reference claims across at least two independent sources
- Reject AI-generated content that sounds plausible but is unverified

## Content Quality Standards
- Write in a natural, authoritative, respectful tone
- No filler phrases, no keyword stuffing, no AI padding
- Every paragraph must add value to the reader
- Use clear headings, short paragraphs, and active voice
- Islamic content must be respectful, accurate, and free of sectarian bias

---

# 5. PLATFORM ARCHITECTURE REQUIREMENTS

## Website Design Principles
- Optimized for **speed and performance** — target Lighthouse score 90+ on all metrics
- **Cost-effective** — free or near-free hosting stack (Cloudflare Pages + Supabase free tier)
- **SEO-first** — structured for fast ranking: schema markup, meta tags, semantic HTML, Core Web Vitals
- **Simple to build and maintain** — no unnecessary complexity; limited technical skill required for day-to-day use
- **Apple-style UI** — clean, minimal, premium, readable

## Database & Data Population
- Use **Supabase PostgreSQL** as the primary database
- Data must be populatable via multiple mechanisms:
  - PDF upload → parsed and inserted
  - CSV upload → bulk insert
  - Plain text / Notepad → structured parsing
  - API calls → automated ingestion
  - Manual admin UI → form-based entry
  - Scheduled scripts → autonomous data fetching
- All data operations must go through the **protected backend admin interface**, not the public frontend

## Frontend Rules
- Minimal frontend logic — keep it lightweight and fast
- Frontend queries Supabase directly via REST API with anon key (read-only)
- No sensitive logic or keys exposed to the public frontend
- All write operations happen exclusively through the backend admin

## Backend Admin Interface
- Separate, **password-protected admin panel** (not publicly accessible)
- Features:
  - Create, edit, delete blog posts
  - Upload data files (PDF, CSV, TXT)
  - Schedule posts for future publication
  - Preview posts before publishing
  - Manage categories, tags, and metadata
  - View analytics and publishing status

## AI-Based Search
- Users ask a natural language question
- System searches the database using **hybrid search**: full-text (Supabase tsvector) + AI semantic (OpenAI embeddings)
- Returns instant, relevant results with hadith citations
- No hallucination — answers grounded only in the database content
- Search response time target: under 2 seconds

## Deployment Automation
- Code stored in **GitHub repository**
- Every push to `main` branch auto-deploys to **Cloudflare Pages**
- Zero manual deployment steps after initial setup
- Use **GitHub Actions** for any pre-deploy validation or build steps
- Environment variables managed in Cloudflare Pages dashboard (never in code)

## Autonomous & Scheduled Posting
- Admin can schedule posts for future dates/times
- System auto-publishes at scheduled time via Supabase Edge Function or cron job
- **Auto post building**: AI can draft a post from a hadith reference, which admin reviews and approves before publishing
- Posts can be auto-shared to social media platforms on publish:
  - Facebook Page
  - Twitter / X
  - Instagram (caption + image)
  - YouTube Community Post
  - LinkedIn (optional)
- Social sharing uses platform APIs or a unified tool (e.g., Buffer, Make.com, or custom integration)

---

# 6. PRODUCT OBJECTIVE — CURRENT SPRINT

Implement the following website changes:

## Theme
- Set landing page to Light Theme by default
- Add Light / Dark theme toggle
- Persist theme preference
- Apply theme consistently across all pages

## Branding
- Replace the website logo with the provided new logo
- Update navbar/mobile/header/favicon branding as applicable

## Cleanup
- Remove emojis from the entire website
- Remove italic fonts globally

## Bookmark UX
- Add a rounded dynamic bookmark count badge
- Update count live when bookmarks are added or removed

## Featured Hadith
- Mobile: horizontal swipe/scroll
- Web: forward and back buttons with smooth movement

## Category Page
- Replace bookmark and camera/share icons with the provided reference icons
- Remove the text: Both / عربي / English beside the search bar
- Rebalance spacing after removal

## About Us
- Create or rewrite the About Us page
- Make it engaging, professional, respectful, and SEO-optimized

## SEO
- Optimize the entire website for SEO:
  - titles, meta descriptions, OG tags, structured data
  - image alt text, semantic HTML, internal linking
  - mobile performance, accessibility basics

## Final Report
- Generate a final report file summarizing changes, fixes, SEO improvements, and recommendations

---

# 7. GLOBAL PRODUCT RULES

## UX / Design Rules
- Maintain a premium Apple-style visual direction
- Keep the site minimal, clean, modern, and polished
- Remove all emojis across the website
- Remove italic fonts globally
- Preserve responsiveness across mobile, tablet, and desktop
- Preserve existing working functionality unless explicitly changed
- Do not introduce unnecessary clutter

## Technical Rules
- Reuse existing components where possible
- Avoid duplicated code
- Keep code modular and maintainable
- Do not break routing, assets, imports, or existing flows
- Ensure all changes are production-ready
- Ensure bookmark logic, theme logic, and rendering remain stable

---

# 8. PHASED EXECUTION WORKFLOW

Claude must execute in this order.

---

# PHASE 0 — REPOSITORY ANALYSIS
## Actions
1. Inspect repository structure
2. Detect framework / stack automatically
3. Locate: entry files, shared layouts/components, theme logic, logo references, bookmark logic, featured hadith section, category page, about page route/content, SEO/meta handling
4. Review current git status and branch
5. Identify files that need modification
## Git Action
- Do not commit in this phase
## Output
Create a short internal implementation plan, then continue automatically.

---

# PHASE 1 — THEME SYSTEM
## Actions
- Set Light Theme as default on first load
- Add a Light/Dark mode toggle
- Persist theme preference using localStorage or existing preference logic
- Apply theming consistently across site pages
- Prevent theme flicker if possible
## Validation
- Light theme is default for first-time visitors
- Toggle works correctly; refresh preserves selected theme
- Shared components render correctly in both modes
## Git Commit
`feat(theme): add persistent light/dark theme toggle with light default`

---

# PHASE 2 — LOGO UPDATE
## Actions
- Replace old logo with provided logo asset
- Update all relevant placements; update favicon if applicable
- Verify appearance in both themes
## Validation
- No broken asset paths; proper scaling and alignment; good contrast in both modes
## Git Commit
`feat(branding): replace logo assets and update site branding`

---

# PHASE 3 — GLOBAL VISUAL CLEANUP
## Actions
- Remove all emojis from the site
- Remove italic fonts globally
- Standardize typography for a cleaner premium UI
## Validation
- Search for remaining emoji characters and italic styles/classes/tags
- Confirm UI remains polished and consistent
## Git Commit
`style(ui): remove emojis and italic typography across site`

---

# PHASE 4 — BOOKMARK COUNTER BADGE
## Actions
- Add rounded bookmark count badge
- Ensure dynamic updates on add/remove
- Preserve authentication behavior; ensure desktop and mobile compatibility
## Validation
- Add bookmark increments badge; remove decrements badge; refresh preserves state
## Git Commit
`feat(bookmarks): add dynamic bookmark counter badge`

---

# PHASE 5 — FEATURED HADITH INTERACTION
## Actions
- Add mobile horizontal swipe/scroll behavior
- Add desktop forward/back controls with smooth movement
## Validation
- Mobile swipe works naturally; desktop controls work; no visual overflow bugs
## Git Commit
`feat(featured-hadith): improve horizontal navigation for mobile and desktop`

---

# PHASE 6 — CATEGORY PAGE REFINEMENT
## Actions
- Replace bookmark icon and camera/share icon with provided reference icons
- Remove `Both عربي English` beside the search bar; rebalance layout spacing
## Validation
- Icons display correctly; layout remains balanced; actions remain functional
## Git Commit
`refactor(category-page): update action icons and simplify search controls`

---

# PHASE 7 — ABOUT US PAGE
## Actions
- Create or rewrite About Us page
- Make it respectful, engaging, modern, and SEO-optimized
- Include mission, vision, authentic hadith value, user trust, learning, and reflection
## Validation
- Content matches overall site tone; heading structure is strong; SEO quality improved
## Git Commit
`feat(content): add seo-optimized about us page`

---

# PHASE 8 — SEO OPTIMIZATION
## Actions
- Improve page titles, meta descriptions, OG metadata
- Add structured data (JSON-LD) where relevant
- Improve alt text, semantic HTML, internal linking
- Improve accessibility basics and mobile SEO
## Validation
- Key pages have metadata; important images have alt text; no SEO regressions
## Git Commit
`feat(seo): optimize metadata, schema, semantics, and accessibility`

---

# PHASE 9 — FINAL QA / PERFORMANCE PASS
## Actions
- Check desktop/tablet/mobile layouts
- Check spacing, typography, icon consistency, and theme consistency
- Check broken links, broken images, and console issues
- Remove dead code introduced during edits
## Validation
- No major regressions; UI stable and polished; codebase clean
## Git Commit
`chore(qa): final polish, cleanup, and responsiveness fixes`

---

# PHASE 10 — FINAL REPORT FILE
## Actions
Create: `reports/website-seo-performance-report.md`
## Report Must Include
- Summary of completed work
- UI/UX improvements
- SEO improvements
- Technical improvements
- Issues fixed
- Recommendations for next steps
## Git Commit
`docs(report): add website seo and performance implementation report`

---

# 9. STOP POINT — ASK BEFORE PUSH

After all changes are implemented and all local commits are completed, stop and present:

## Required Summary
- Active branch name
- Git status summary
- List of commits created in order
- List of major files changed
- Report file location
- Note whether the branch is ahead of remote

## Required Question
**"All requested changes have been implemented and committed locally. Would you like me to push these commits to the remote GitHub branch now?"**

Do not push until approval is explicitly given.

---

# 10. COMMIT MESSAGE STANDARD

Use conventional commit style:
- `feat(theme): add persistent light/dark toggle`
- `feat(branding): replace site logo`
- `style(ui): remove emojis and italics`
- `feat(bookmarks): add bookmark badge counter`
- `feat(featured-hadith): improve horizontal navigation`
- `refactor(category-page): simplify search controls`
- `feat(content): create about us page`
- `feat(seo): improve metadata and schema`
- `chore(qa): final cleanup and polish`
- `docs(report): add final implementation report`

Rules:
- Keep messages professional
- Use conventional commit style
- Avoid vague messages like `update files`

---

# 11. FINAL COMPLETION CHECKLIST

Before stopping to ask for push approval, verify:
- [ ] Landing page defaults to Light Theme
- [ ] Light/Dark toggle works and persists
- [ ] New logo applied correctly
- [ ] Emojis removed globally
- [ ] Italic fonts removed globally
- [ ] Bookmark counter badge works
- [ ] Featured Hadith horizontal navigation works
- [ ] Category page icons updated
- [ ] `Both عربي English` removed beside search
- [ ] About Us page created or improved
- [ ] Website SEO optimized
- [ ] All content validated against reliable sources (no AI slop)
- [ ] Final report added
- [ ] Changes committed locally
- [ ] Push has NOT happened yet
- [ ] No major regressions introduced

---

# 12. FINAL RESPONSE FORMAT

At the stop point, provide:
- Concise implementation summary
- Files changed
- Commits created
- Report location
- Current branch status
- Explicit push approval question

Do not stop after planning only.
Do not push automatically.
Implement fully, commit locally, and then ask before push.
