# AlHudah Quran Platform — Complete Setup Reference Guide

**Target Stack:** Cloudflare Pages + Supabase PostgreSQL + GitHub + Cloudflare Workers  
**Domain:** alhudah.com  
**Repository:** github.com/ehsaasradio-bot/alhudah  
**Live Site:** https://alhudah.com  
**Staging:** https://alhudah.pages.dev  

This guide is written for someone with **no prior experience** with these platforms. Every step is explained in detail. Follow sequentially from top to bottom.

---

## TABLE OF CONTENTS

1. [Domain Setup](#1-domain-setup)
2. [GitHub Repository](#2-github-repository)
3. [Cloudflare Pages Setup](#3-cloudflare-pages-setup)
4. [Supabase Project Creation](#4-supabase-project-creation)
5. [Cloudflare Worker Setup](#5-cloudflare-worker-setup)
6. [Security Headers (_headers File)](#6-security-headers-_headers-file)
7. [Verification Checklist](#7-verification-checklist)

---

# 1. DOMAIN SETUP

## What This Does
You have (or will purchase) a domain name `alhudah.com`. This section connects it to your hosting platform (Cloudflare Pages) and configures SSL certificates for security.

## 1.1 — Purchase the Domain (If Not Already Owned)

### Option A: Purchase via Cloudflare Registrar (Recommended)

1. Go to https://dash.cloudflare.com/
2. Sign in with your account (the one managing the Timeless Hadith project)
3. Click **"Registrar"** in the left sidebar
4. Click **"Register a domain"** (top right)
5. Search for `alhudah.com` in the search box
6. If available, it will show the annual price (typically $8.88–$12/year for .com)
7. Click **"Add to cart"**
8. Complete the purchase checkout
9. The domain is now registered under your Cloudflare account

### Option B: Domain Already Purchased Elsewhere
- If the domain is registered elsewhere (GoDaddy, Namecheap, etc.), you can:
  - **Transfer it to Cloudflare** (recommended, easier to manage), OR
  - **Keep it there and point nameservers to Cloudflare** (see **Section 1.3**)

**For this guide, we assume you own the domain and are registering/managing it via Cloudflare.**

---

## 1.2 — Add the Domain to Cloudflare

Once the domain is registered (or transferred), Cloudflare automatically creates a "site" for it. Verify it exists:

1. Go to https://dash.cloudflare.com/
2. Look for `alhudah.com` in the list of **Websites** on the left
3. Click on `alhudah.com`
4. You should see a dashboard for the site

**Note:** If you don't see it, click **"Add site"** (or **"Add a website"**) and follow the prompts to add the domain to your Cloudflare account.

---

## 1.3 — Configure Nameservers (If Domain Is Elsewhere)

**Skip this section if you registered the domain via Cloudflare Registrar in 1.1.**

If your domain is registered at another registrar (GoDaddy, Namecheap, etc.):

1. Go to Cloudflare dashboard → Your site (`alhudah.com`)
2. Click **"Nameservers"** on the left sidebar under **Settings**
3. You'll see two nameserver addresses, e.g.:
   - `ana.ns.cloudflare.com`
   - `bryn.ns.cloudflare.com`
   
   (The actual names change; just copy what Cloudflare shows)

4. Log in to your **registrar account** (GoDaddy, Namecheap, etc.)
5. Find **"DNS"** or **"Nameservers"** settings
6. Replace the existing nameservers with the two Cloudflare addresses
7. Save and wait 24–48 hours for DNS propagation

**How to verify:** Open a terminal and run:
```bash
nslookup alhudah.com
```
If you see `cloudflare.com` in the nameserver output, it worked.

---

## 1.4 — SSL/TLS Configuration

SSL makes your site secure (HTTPS). Cloudflare provides free SSL automatically.

1. Go to Cloudflare dashboard → `alhudah.com`
2. Click **"SSL/TLS"** on the left sidebar
3. Under **"Overview,"** you'll see the current SSL mode
4. Set it to **"Full (strict)"**
   - This ensures all traffic is encrypted end-to-end

**Why "Full (strict)"?** It requires a valid certificate on your origin server. Since Cloudflare Pages handles this for you, it's the most secure option.

---

## 1.5 — Configure DNS Records for Cloudflare Pages

This tells Cloudflare where to route traffic for `alhudah.com`.

1. Go to Cloudflare dashboard → `alhudah.com`
2. Click **"DNS"** on the left sidebar
3. Look for existing records. You may see some auto-created records. Delete any that point to an old host.
4. Click **"Add record"**
5. Set up two records:

### Record 1: Root Domain (www-less)
```
Type:     CNAME
Name:     @
Content:  alhudah.pages.dev
Proxied:  Yes (orange cloud icon)
TTL:      Auto
```

Click **"Save"**

### Record 2: www Subdomain
```
Type:     CNAME
Name:     www
Content:  alhudah.pages.dev
Proxied:  Yes (orange cloud icon)
TTL:      Auto
```

Click **"Save"**

**Result:** Traffic to `alhudah.com` and `www.alhudah.com` now points to Cloudflare Pages.

---

## 1.6 — Enforce HTTPS

1. Go to Cloudflare dashboard → `alhudah.com`
2. Click **"SSL/TLS"** → **"Edge Certificates"**
3. Scroll down and enable:
   - **"Always Use HTTPS"** → Toggle ON
   - **"Automatic HTTPS Rewrites"** → Toggle ON

**Result:** All HTTP requests redirect to HTTPS. Users typing `http://alhudah.com` are automatically redirected to `https://alhudah.com`.

---

## 1.7 — DNS Propagation Check

DNS changes take time to propagate globally.

1. Go to https://mxtoolbox.com/
2. Search for `alhudah.com`
3. Look for the CNAME records you just created
4. Once they show up, DNS is ready

**Typical time:** 15 minutes to 48 hours. If you created the domain via Cloudflare Registrar, it's faster.

---

# 2. GITHUB REPOSITORY

## What This Does
GitHub is where your code lives. Every file, every change, is tracked here. Cloudflare Pages watches this repository and auto-deploys when you push to the `main` branch.

---

## 2.1 — Create the Repository

1. Go to https://github.com/ehsaasradio-bot
2. Click **"Repositories"** tab
3. Click the green **"New"** button (top right)
4. Fill in:
   ```
   Repository name:        alhudah
   Description:            AlHudah — Quranic reference platform
   Visibility:             Public
   Initialize with README: Check this box
   Add .gitignore:         Choose "Node" (we'll customize it)
   ```
5. Click **"Create repository"**

---

## 2.2 — Create Initial File Structure

You now have a repository at `github.com/ehsaasradio-bot/alhudah`. Clone it locally to add files:

```bash
cd ~/Desktop
git clone https://github.com/ehsaasradio-bot/alhudah
cd alhudah
```

Now create the folder structure:

```bash
# Create all directories
mkdir -p css js data worker/src sql scripts reports

# Create placeholder files (we'll fill them in later)
touch index.html surah.html about.html bookmarks.html search.html privacy.html terms.html 404.html offline.html
touch css/styles.css
touch js/app.js js/theme-init.js js/supabase-data.js js/surah-wire.js js/index-wire.js js/bookmarks-wire.js js/ai-search.js js/sw-register.js
touch manifest.json robots.txt sitemap.xml _headers sw.js CLAUDE.md
touch worker/package.json worker/wrangler.toml worker/src/index.js
touch scripts/deploy.sh sql/schema.sql
```

---

## 2.3 — Configure .gitignore

Update `.gitignore` in the repository root to exclude sensitive files:

```
# Environment variables
.env
.env.local
.env.*.local
.env.production

# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build outputs
dist/
build/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Temporary
*.tmp
~*

# Cloudflare Workers
.wrangler/
```

---

## 2.4 — Create README.md

Replace the default README with:

```markdown
# AlHudah — Quranic Reference Platform

A fast, minimal, premium Quranic reference platform with:
- Complete Quran with Arabic and English
- Verse-level bookmarking and notes
- AI-powered semantic search
- Light/Dark theme
- Offline support via Service Worker
- Progressive Web App (PWA)

## Tech Stack
- **Frontend:** Vanilla JavaScript, CSS Grid/Flexbox
- **Hosting:** Cloudflare Pages
- **Database:** Supabase PostgreSQL
- **AI Search:** OpenAI GPT-4o-mini (via Cloudflare Worker proxy)
- **Domain:** alhudah.com

## Setup
See `/references/01-setup.md` for complete setup instructions.

## Deployment
Push to `main` branch. Cloudflare Pages auto-deploys within 60 seconds.

## Repository
- **Primary:** https://github.com/ehsaasradio-bot/alhudah
- **Live:** https://alhudah.com
- **Staging:** https://alhudah.pages.dev

## Contribution
All changes must be committed to Git with clear conventional commit messages.
```

---

## 2.5 — Create CLAUDE.md (Project Instructions)

This file documents how the project should be maintained and updated. Create `CLAUDE.md` in the repository root:

```markdown
# CLAUDE.md — AlHudah Project Instructions

## Project Identity
- **Name:** AlHudah — Quranic Reference Platform
- **Domain:** alhudah.com
- **Repository:** github.com/ehsaasradio-bot/alhudah
- **Hosting:** Cloudflare Pages (auto-deploy on push to main)
- **Database:** Supabase PostgreSQL
- **GitHub Account:** ehsaasradio-bot

## Tech Stack
| Component | Choice | Notes |
|-----------|--------|-------|
| Frontend | Vanilla JS | Minimal, fast, no build step required |
| Hosting | Cloudflare Pages | Free, auto-deploy, CDN, DDoS protection |
| Database | Supabase PostgreSQL | Free tier sufficient; full-text search via tsvector |
| Auth | Supabase Auth | Optional; for bookmarks + notes (not required for MVP) |
| AI Search | OpenAI GPT-4o-mini | Proxied via Cloudflare Worker (keep API key server-side) |
| API Proxy | Cloudflare Workers | Protects OpenAI API key from client exposure |
| Domain | alhudah.com | Managed via Cloudflare Registrar |
| CDN / Security | Cloudflare | Free tier; SSL, caching, WAF |

## Execution Rules
1. **Analyze** — Inspect the repo and identify what needs to change
2. **Implement** — Make all code changes
3. **Validate** — Test changes locally
4. **Commit** — Create logical, conventional commits
5. **Stop Before Push** — Never push without explicit approval
6. **Ask Permission** — "All changes committed. Push to GitHub?"

## Commit Message Style
Use conventional commits:
- `feat(search): add ai-powered semantic search`
- `fix(theme): prevent theme flicker on page load`
- `refactor(styles): remove unused CSS classes`
- `docs(readme): update setup instructions`
- `chore(ci): update GitHub Actions workflow`

## Content Rules
- All Quranic text must be accurate and sourced from reliable references
- Never invent verse translations or references
- Cross-reference against quran.com or established Islamic sources
- Maintain respectful, bias-free tone

## Security Rules
- **Never commit:** .env files, API keys, secrets, passwords
- **Keep server-side:** OpenAI API key (proxied via Worker)
- **Keep public:** Supabase anon key (read-only, can be public)
- Use Row Level Security (RLS) on all Supabase tables

## Git Rules
- Main branch is production
- All changes go through feature branches
- Squash or rebase before merging
- Never force-push to main

## Deployment
Push to main → GitHub → Cloudflare Pages auto-deploys within 60 seconds.
No manual deployment steps.
```

---

## 2.6 — Initial Commit

Add and commit everything:

```bash
git add .
git commit -m "chore(init): initial project structure and documentation"
git push origin main
```

---

# 3. CLOUDFLARE PAGES SETUP

## What This Does
Cloudflare Pages is a free hosting platform that watches your GitHub repository. When you push code to the `main` branch, it automatically builds and deploys your site within 60 seconds. No manual deployment needed.

---

## 3.1 — Connect GitHub Repository

1. Go to https://dash.cloudflare.com/
2. Click **"Pages"** on the left sidebar
3. Click **"Create a project"**
4. Select **"Connect to Git"**
5. Sign in with your GitHub account (ehsaasradio-bot)
6. You'll see a list of your repositories
7. Find and click **"alhudah"** (the one you just created)
8. Click **"Install & authorize"** if prompted
9. Click **"Connect"** next to the `alhudah` repo

---

## 3.2 — Configure Build Settings

After connecting, you'll see the build configuration screen:

```
Production branch:  main
Build command:      (leave empty)
Build output:       (leave empty)
Environment:        (we'll add this in 3.4)
```

**Why leave build command empty?** AlHudah is a static site (HTML, CSS, JavaScript — no build process). Cloudflare Pages serves files as-is.

Click **"Save and deploy"**

---

## 3.3 — Wait for First Deployment

1. Click on your project
2. You'll see a deployment in progress (status shows building)
3. Wait 60–90 seconds for it to complete
4. Once complete, you'll see a **Cloudflare Pages URL:**
   ```
   https://alhudah.pages.dev
   ```

Visit this URL. You should see your site (currently mostly empty files, but the structure works).

---

## 3.4 — Add Environment Variables

Environment variables are settings that change how your site works. They stay hidden and don't appear in your code.

1. Go to Cloudflare dashboard → **Pages** → **alhudah**
2. Click **"Settings"** (top right)
3. Click **"Environment variables"**
4. Click **"Add variable"**

Add these three variables:

### Variable 1: Supabase URL
```
Variable name:  SUPABASE_URL
Value:          (You'll get this from Supabase in Section 4)
Environment:    Production
```

### Variable 2: Supabase Anon Key
```
Variable name:  SUPABASE_ANON_KEY
Value:          (You'll get this from Supabase in Section 4)
Environment:    Production
```

### Variable 3: OpenAI API Key
```
Variable name:  OPENAI_API_KEY
Value:          (You'll get this from OpenAI)
Environment:    Production
```

**Note:** The Pages environment variables are optional for the static frontend (it can read from Supabase directly). But it's good practice to centralize config. **The important secret is the OpenAI API key, which goes into your Cloudflare Worker**, not Pages.

**For now, you can skip adding these until you have the actual values.**

---

## 3.5 — Point Custom Domain to Pages

1. Go to Cloudflare dashboard → **Pages** → **alhudah**
2. Click **"Custom domains"**
3. Click **"Set up a custom domain"**
4. Enter: `alhudah.com`
5. Click **"Continue"**
6. Confirm the CNAME record creation (you may have already done this in Section 1.5)
7. Click **"Activate domain"**

**Result:** Your site is now live at `https://alhudah.com` and auto-deploys on every push to the `main` branch.

---

## 3.6 — Enable Page Rules (Optional But Recommended)

Caching rules make your site faster:

1. Go to Cloudflare dashboard → `alhudah.com` (the domain, not Pages)
2. Click **"Caching"** on the left sidebar
3. Click **"Rules"** (or **"Cache Rules"**)
4. Click **"Create rule"**

Create a rule to cache static assets:

```
Rule name:  Cache Static Assets
URL path:   *.css OR *.js OR *.svg OR *.woff2
Cache TTL:  30 days
```

Click **"Save"**

**Result:** Images, CSS, and JavaScript are cached globally for 30 days, making the site faster.

---

# 4. SUPABASE PROJECT CREATION

## What This Does
Supabase is a PostgreSQL database. It stores:
- All 114 Quranic Surahs and their verses
- User bookmarks (if authentication is enabled)
- User notes (if authentication is enabled)

---

## 4.1 — Create a New Supabase Project

1. Go to https://supabase.com/
2. Click **"Sign in"** (or **"Sign up"** if you don't have an account)
3. Use GitHub to sign in (easier)
4. Once signed in, click **"New project"** (or **"Create new project"**)
5. Fill in:
   ```
   Project name:        alhudah
   Database password:   (Create a strong password; save it somewhere safe)
   Region:              Choose the region closest to your users (e.g., US East for North America)
   Pricing plan:        Free (sufficient for MVP and beyond)
   ```
6. Click **"Create new project"**

Supabase will take 2–5 minutes to provision the database. Wait for the green checkmark.

---

## 4.2 — Retrieve Connection Details

Once the project is created:

1. Click on your project (`alhudah`)
2. Go to **"Settings"** (bottom left) → **"API"**
3. You'll see two keys:
   - **Project URL** (e.g., `https://xyz123.supabase.co`)
   - **anon key** (a long string starting with `eyJ...`)

**Save these somewhere safe (you'll add them to Cloudflare Pages in Section 3.4).**

---

## 4.3 — Enable Row Level Security (RLS)

RLS ensures users can only access their own data:

1. Go to Supabase dashboard → `alhudah` project
2. Click **"SQL Editor"** on the left sidebar
3. Click **"New query"**
4. Paste this SQL:

```sql
-- Enable RLS on all tables (run this after creating tables)
ALTER TABLE surahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read surahs and verses (public data)
CREATE POLICY "Allow public read on surahs" ON surahs FOR SELECT USING (true);
CREATE POLICY "Allow public read on verses" ON verses FOR SELECT USING (true);

-- Only allow authenticated users to read/write their own bookmarks
CREATE POLICY "Allow user to read own bookmarks" ON bookmarks FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "Allow user to create bookmarks" ON bookmarks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow user to delete own bookmarks" ON bookmarks FOR DELETE 
  USING (auth.uid() = user_id);

-- Same for notes
CREATE POLICY "Allow user to read own notes" ON notes FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "Allow user to create notes" ON notes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow user to update own notes" ON notes FOR UPDATE 
  USING (auth.uid() = user_id);
CREATE POLICY "Allow user to delete own notes" ON notes FOR DELETE 
  USING (auth.uid() = user_id);
```

Don't run this yet. You'll do it after creating tables.

---

## 4.4 — Create Database Tables

Still in the SQL Editor, click **"New query"** and run:

```sql
-- Surahs table (Chapters of the Quran)
CREATE TABLE surahs (
  id INT PRIMARY KEY,
  number INT UNIQUE NOT NULL,
  name_arabic VARCHAR(255) NOT NULL,
  name_english VARCHAR(255) NOT NULL,
  name_transliteration VARCHAR(255),
  verses_count INT NOT NULL,
  revelation_order INT,
  revelation_place VARCHAR(50),
  meaning VARCHAR(1000)
);

-- Verses table
CREATE TABLE verses (
  id BIGINT PRIMARY KEY,
  surah_id INT REFERENCES surahs(id) ON DELETE CASCADE,
  verse_number INT NOT NULL,
  text_arabic TEXT NOT NULL,
  text_english TEXT,
  text_transliteration TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(surah_id, verse_number)
);

-- Bookmarks table (requires auth)
CREATE TABLE bookmarks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id BIGINT REFERENCES verses(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, verse_id)
);

-- Notes table (requires auth)
CREATE TABLE notes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id BIGINT REFERENCES verses(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Full-text search index on verses
CREATE INDEX verses_arabic_fts ON verses USING GIN(to_tsvector('arabic', text_arabic));
CREATE INDEX verses_english_fts ON verses USING GIN(to_tsvector('english', text_english));
```

Click **"Run"**. Tables are created.

---

## 4.5 — Add Sample Data

For testing, add one Surah:

```sql
INSERT INTO surahs (id, number, name_arabic, name_english, name_transliteration, verses_count, revelation_order, revelation_place, meaning)
VALUES 
(1, 1, 'الفاتحة', 'The Opening', 'Al-Fatiha', 7, 5, 'Mecca', 'The opening chapter of the Quran, recited in every prayer');

INSERT INTO verses (id, surah_id, verse_number, text_arabic, text_english, text_transliteration)
VALUES
(1, 1, 1, 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 'In the name of Allah, the Entirely Merciful, the Especially Merciful', 'Bismillah ir-Rahman ir-Rahim'),
(2, 1, 2, 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', 'All praise is due to Allah, Lord of the worlds', 'Al-hamdu lillahi rabbi al-alamin'),
(3, 1, 3, 'الرَّحْمَٰنِ الرَّحِيمِ', 'The Entirely Merciful, the Especially Merciful', 'Ar-Rahman ar-Rahim');
```

Click **"Run"**. Data is inserted.

---

## 4.6 — Enable Authentication (Optional for MVP)

If you want bookmarks and notes:

1. Go to **"Authentication"** on the left sidebar
2. Click **"Providers"**
3. Enable email/password or OAuth (Google/GitHub)
4. Users can now sign up and save bookmarks

**For MVP, this is optional.** Start with read-only, anonymous browsing.

---

## 4.7 — Test the Connection

1. Go to Supabase → **"SQL Editor"**
2. Run a test query:
   ```sql
   SELECT * FROM surahs;
   ```
3. You should see the one Surah you inserted

---

# 5. CLOUDFLARE WORKER SETUP

## What This Does
A Cloudflare Worker is a server-side proxy. It sits between your frontend and the OpenAI API. This keeps your OpenAI API key **secret** — it never appears in browser code.

**Without a Worker:** Your frontend would send API requests directly to OpenAI, exposing the API key (bad).  
**With a Worker:** Your frontend sends requests to your Worker, which forwards them to OpenAI (good).

---

## 5.1 — Install Wrangler CLI

Wrangler is the command-line tool for managing Cloudflare Workers.

**On macOS:**
```bash
brew install wrangler
```

**On Windows (using npm):**
```bash
npm install -g wrangler
```

**On Linux:**
```bash
npm install -g wrangler
```

Verify installation:
```bash
wrangler --version
```

---

## 5.2 — Set Up Worker Project Locally

Navigate to your `alhudah` repository and set up the Worker:

```bash
cd ~/Desktop/alhudah
wrangler init worker
```

This creates a `worker/` folder with template files. We'll customize them.

---

## 5.3 — Configure wrangler.toml

Edit `worker/wrangler.toml`:

```toml
name = "alhudah-worker"
type = "javascript"
account_id = "YOUR_CLOUDFLARE_ACCOUNT_ID"
workers_dev = true
route = "api.alhudah.com/*"
zone_id = ""

[env.production]
routes = [
  { pattern = "api.alhudah.com/*", zone_id = "" }
]

[env.development]
routes = [
  { pattern = "localhost:8787/*", zone_id = "" }
]

[build]
command = "npm install && npm run build"
cwd = "./"

[build.upload]
format = "modules"
```

**Where to get account_id:**
1. Go to https://dash.cloudflare.com/
2. Bottom left, you'll see your account name; click it
3. Look for **"Account ID"** on the right
4. Copy and paste it into `account_id` above

---

## 5.4 — Create Worker Code

Edit `worker/src/index.js`:

```javascript
/**
 * AlHudah AI Search Worker
 * Proxies OpenAI API requests to keep the API key server-side.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Only handle POST requests to /api/search
    if (request.method !== 'POST' || !url.pathname.startsWith('/api/search')) {
      return new Response('Not Found', { status: 404 });
    }

    // Get the request body (user's search query)
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response('Invalid JSON', { status: 400 });
    }

    const { query, systemPrompt } = body;

    if (!query) {
      return new Response('Missing query parameter', { status: 400 });
    }

    // Call OpenAI API (API key stays server-side)
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'You are a helpful Quran reference assistant. Answer questions about Islamic teachings and Quranic verses.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const openaiData = await openaiResponse.json();

    // Return the AI response to the frontend
    return new Response(JSON.stringify(openaiData), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://alhudah.com',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  },
};
```

---

## 5.5 — Create package.json for Worker

Edit `worker/package.json`:

```json
{
  "name": "alhudah-worker",
  "version": "1.0.0",
  "description": "Cloudflare Worker for AlHudah AI search",
  "main": "src/index.js",
  "scripts": {
    "start": "wrangler dev",
    "deploy": "wrangler deploy",
    "build": "echo 'No build step needed'"
  },
  "devDependencies": {
    "wrangler": "^3.0.0"
  }
}
```

---

## 5.6 — Add OpenAI API Key as Secret

Secrets are encrypted environment variables that never appear in code.

```bash
cd ~/Desktop/alhudah/worker
wrangler secret put OPENAI_API_KEY
```

You'll be prompted to enter your OpenAI API key. Paste it and press Enter.

**To get an OpenAI API key:**
1. Go to https://platform.openai.com/
2. Sign in or create an account
3. Click **"API keys"** on the left
4. Click **"Create new secret key"**
5. Copy the key (it only shows once)
6. Paste it when Wrangler prompts

---

## 5.7 — Deploy the Worker

```bash
cd ~/Desktop/alhudah/worker
wrangler deploy
```

Output should show:
```
✓ Uploaded alhudah-worker (1.23 KiB)
✓ Deployed to https://alhudah-worker.YOUR_USERNAME.workers.dev
```

Your Worker is now live. Test it:

```bash
curl -X POST https://alhudah-worker.YOUR_USERNAME.workers.dev/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "What does the Quran say about mercy?"}'
```

You should get a response from OpenAI.

---

## 5.8 — Route Worker to Custom Domain (Optional)

If you want requests to `api.alhudah.com` to hit your Worker:

1. Go to Cloudflare dashboard → `alhudah.com`
2. Click **"Workers"** on the left
3. Click **"Add a route"**
4. Pattern: `api.alhudah.com/*`
5. Worker: `alhudah-worker`
6. Zone: `alhudah.com`
7. Click **"Save"**

**Result:** Requests to `https://api.alhudah.com/api/search` now hit your Worker.

---

# 6. SECURITY HEADERS (_headers FILE)

## What This Does
Security headers protect your site from common attacks (XSS, clickjacking, etc.). They're configured in a `_headers` file that Cloudflare Pages reads on every request.

---

## 6.1 — Create _headers File

Create `_headers` in the repository root (same level as `index.html`):

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  
  Content-Security-Policy: \
    default-src 'self'; \
    script-src 'self' 'wasm-unsafe-eval'; \
    style-src 'self' https://fonts.googleapis.com; \
    font-src 'self' https://fonts.gstatic.com; \
    img-src 'self' data: https:; \
    connect-src 'self' https://*.supabase.co https://fonts.googleapis.com https://fonts.gstatic.com; \
    frame-ancestors 'none'; \
    base-uri 'self'; \
    form-action 'self'; \
    upgrade-insecure-requests

/index.html
  Cache-Control: no-cache
  
/css/*
  Cache-Control: public, max-age=31536000, immutable
  
/js/*
  Cache-Control: public, max-age=31536000, immutable
  
/offline.html
  Cache-Control: no-cache
  
/sw.js
  Cache-Control: no-cache
```

---

## 6.2 — Explanation of Each Header

### X-Content-Type-Options: nosniff
Prevents the browser from guessing the content type of files. If a file is labeled as JavaScript, it must be JavaScript (not HTML).

### X-Frame-Options: SAMEORIGIN
Prevents your site from being embedded in `<iframe>` tags on other sites (clickjacking protection).

### X-XSS-Protection: 1; mode=block
Legacy header for older browsers. Blocks pages if XSS attacks are detected.

### Referrer-Policy: strict-origin-when-cross-origin
Limits what information is sent to external sites when users click outbound links. Protects privacy.

### Permissions-Policy
Denies access to sensitive browser features (geolocation, microphone, camera) unless explicitly granted.

### Content-Security-Policy (CSP)
This is the most important header. It defines where the browser can load resources from.

#### CSP Breakdown:
```
default-src 'self';
```
By default, only load resources from your own domain.

```
script-src 'self' 'wasm-unsafe-eval';
```
Load JavaScript from your domain and allow WebAssembly (some features need this).

```
style-src 'self' https://fonts.googleapis.com;
```
Load CSS from your domain and from Google Fonts.

```
font-src 'self' https://fonts.gstatic.com;
```
Load fonts from your domain and from Google's font server. **Important:** This is where custom fonts are hosted.

```
img-src 'self' data: https:;
```
Load images from your domain, inline data URLs, and any HTTPS URL.

```
connect-src 'self' https://*.supabase.co https://fonts.googleapis.com https://fonts.gstatic.com;
```
Allow API calls to your domain, Supabase, and Google Fonts. **Important lesson from Timeless Hadith:** Google Fonts requires both googleapis.com (CSS) and gstatic.com (font files) in `connect-src`.

```
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```
Don't allow your site to be embedded in iframes; keep all forms and redirects internal.

```
upgrade-insecure-requests
```
Automatically convert `http://` links to `https://`.

---

## 6.3 — Deploy the _headers File

Commit and push:

```bash
git add _headers
git commit -m "security: add content security policy headers"
git push origin main
```

Cloudflare Pages automatically reads the `_headers` file and applies these headers on every response.

---

## 6.4 — Verify Headers Are Applied

1. Go to https://alhudah.pages.dev (or your live domain)
2. Open browser DevTools (F12)
3. Go to **Network** tab
4. Reload the page
5. Click on any request (e.g., the HTML document)
6. Look at the **Response Headers** section
7. You should see all your security headers listed

---

# 7. VERIFICATION CHECKLIST

Before considering setup complete, verify each step:

## Domain Setup
- [ ] Domain `alhudah.com` is registered (Cloudflare or elsewhere)
- [ ] Nameservers point to Cloudflare (if registered elsewhere)
- [ ] DNS records (CNAME) point to `alhudah.pages.dev`
- [ ] SSL/TLS is set to "Full (strict)"
- [ ] HTTPS redirect is enabled
- [ ] HTTPS certificate is valid (no warnings in browser)

## GitHub Repository
- [ ] Repository exists at `github.com/ehsaasradio-bot/alhudah`
- [ ] Initial commit pushed to main
- [ ] `.gitignore` contains sensitive file patterns
- [ ] `README.md` is descriptive
- [ ] `CLAUDE.md` is in place

## Cloudflare Pages
- [ ] Pages project is created and connected to GitHub
- [ ] Build settings show no build command (static site)
- [ ] Initial deployment is complete
- [ ] Site is accessible at `https://alhudah.pages.dev`
- [ ] Custom domain `alhudah.com` is configured
- [ ] Site is accessible at `https://alhudah.com`
- [ ] Environment variables are set (Supabase URL and anon key)

## Supabase
- [ ] Project is created at supabase.com
- [ ] Project URL and anon key are saved
- [ ] Tables are created: surahs, verses, bookmarks, notes
- [ ] Sample Surah (Al-Fatiha) and verses are inserted
- [ ] Row Level Security policies are created
- [ ] Full-text search indexes are created

## Cloudflare Worker
- [ ] Wrangler CLI is installed
- [ ] Worker project exists in `worker/` folder
- [ ] `wrangler.toml` is configured with account ID
- [ ] Worker code is in `worker/src/index.js`
- [ ] OpenAI API key is set as a secret
- [ ] Worker is deployed and accessible at `https://alhudah-worker.YOUR_USERNAME.workers.dev`
- [ ] POST request to `/api/search` returns valid OpenAI response

## Security Headers
- [ ] `_headers` file is in repository root
- [ ] `_headers` is committed and pushed
- [ ] Security headers appear in DevTools response headers
- [ ] CSP includes `https://fonts.googleapis.com` and `https://fonts.gstatic.com`

## Final Checks
- [ ] Site loads without errors at `https://alhudah.com`
- [ ] DevTools console has no error messages
- [ ] Push to main → auto-deploy happens within 60 seconds
- [ ] All three platforms (GitHub, Cloudflare, Supabase) are connected
- [ ] You can access the database from the frontend via Supabase REST API

---

# NEXT STEPS

Once this setup is complete, you can:

1. **Add frontend code** — Create HTML pages, CSS styling, JavaScript interactivity
2. **Load Quranic data** — Insert all 114 Surahs and 6,236 verses into Supabase
3. **Implement search** — Connect the frontend to the AI search Worker
4. **Add authentication** — Enable user signups for bookmarks and notes
5. **Optimize performance** — Lighthouse testing, Core Web Vitals, caching
6. **Deploy with confidence** — Every push to main auto-deploys instantly

---

# TROUBLESHOOTING

## Site shows "Not Found" after push
- Wait 60 seconds for Cloudflare Pages to deploy
- Check Cloudflare Pages dashboard for build logs
- Verify `_headers` file is in repository root

## OpenAI Worker returns 401 Unauthorized
- Check that the API key was set correctly with `wrangler secret put`
- Verify the key is active at https://platform.openai.com/account/api-keys
- Check Worker logs at https://dash.cloudflare.com/ → Workers → Tail logs

## Can't connect to Supabase from frontend
- Verify Supabase URL and anon key are correct
- Check CSP headers include `https://*.supabase.co`
- Verify RLS policies allow public read on surahs and verses tables

## HTTPS certificate warning in browser
- Wait 24 hours for DNS propagation (first time)
- Check that Cloudflare DNS records are pointing to pages.dev
- If issue persists, contact Cloudflare support

---

# RESOURCES

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Supabase Quickstart](https://supabase.com/docs/guides/getting-started)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)

---

**End of Setup Guide**

Version: 1.0  
Last Updated: April 2026  
Maintained by: AlHudah Team
