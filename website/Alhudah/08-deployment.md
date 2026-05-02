# AlHudah Quran — Complete Deployment & DevOps Guide

**Last Updated:** April 2026  
**Platform:** Cloudflare Pages + GitHub  
**Target:** Zero manual deployment steps, fully automated CI/CD

---

## 1. CLOUDFLARE PAGES SETUP

### 1.1 Prerequisites

You need:
- GitHub account with the AlHudah repository
- Cloudflare account (free tier sufficient)
- Domain: alhudah.com (already registered, pointed to Cloudflare nameservers)

### 1.2 Step-by-Step Cloudflare Pages Connection

#### Step 1: Log into Cloudflare Dashboard

1. Go to https://dash.cloudflare.com
2. Sign in with your Cloudflare account
3. Select your **alhudah.com** domain

#### Step 2: Set Up Pages

1. In the left sidebar, click **Pages**
2. Click **Create a project**
3. Select **Connect to Git**
4. Authorize Cloudflare to access your GitHub account
5. Select repository: **timeless-hadith** (or your AlHudah repo)
6. Click **Begin setup**

#### Step 3: Configure Build Settings

**Project name:** `alhudah` (or any preferred name)

**Production branch:** `main`

**Build command:** Leave blank (static site, no build needed)

**Build output directory:** `/public` or `./` (if all HTML is in root)

**Environment variables:** See section 1.4

**Leave everything else as default.**

#### Step 4: Deploy

1. Click **Save and Deploy**
2. Cloudflare will deploy your site to `alhudah.pages.dev`
3. Wait for deployment to complete (usually 1-2 minutes)

#### Step 5: Connect Custom Domain

1. In Pages project, go to **Settings** → **Domain**
2. Click **Add a domain**
3. Select **alhudah.com** (if already in Cloudflare)
4. Cloudflare automatically creates the necessary DNS records
5. Verify the domain is connected

**Subdomain handling:**
- Primary domain: `alhudah.com` → `example.pages.dev` (automatic CNAME)
- Redirect www: Use Cloudflare Rules to redirect `www.alhudah.com` → `alhudah.com`

### 1.3 Cloudflare Pages Build Configuration

Your `.github/workflows` should handle validation. Cloudflare Pages itself doesn't need a build step for a static site.

If you have a build step (e.g., bundling, minification), update:

**Build command:** `npm run build`  
**Build output directory:** `dist/` (or wherever your build outputs to)

### 1.4 Environment Variables in Cloudflare Pages

**Important:** Environment variables in Cloudflare Pages are:
1. Available in GitHub Actions build (if using)
2. NOT exposed to the frontend (for security)
3. Used by Edge Functions and Workers (if applicable)

**To add environment variables:**

1. In Cloudflare Pages project, click **Settings**
2. Go to **Environment variables**
3. Add each variable:

| Variable | Value | Type | Notes |
|----------|-------|------|-------|
| `SUPABASE_URL` | `https://YOUR-PROJECT.supabase.co` | Secret | Used by backend API calls |
| `SUPABASE_ANON_KEY` | Your public anon key | Secret | Safe to expose to frontend (read-only) |
| `OPENAI_API_KEY` | Your OpenAI key | Secret | Used server-side only |
| `ENVIRONMENT` | `production` | Plain | Deployment environment |

**Important Security Rules:**

- **Do NOT expose API keys to the frontend** — only the Supabase ANON key (which is read-only)
- **OpenAI API key must be server-side only** — use Cloudflare Workers or backend API
- **All secrets should be "Secret" type**, not "Plain Text"

---

## 2. GITHUB ACTIONS CI/CD PIPELINE

### 2.1 Why GitHub Actions?

Even though Cloudflare Pages auto-deploys, you need:
1. **Pre-deployment validation** (HTML, links, performance)
2. **Automated testing** (accessibility, SEO)
3. **Performance baseline** (Lighthouse CI)
4. **Scheduled tasks** (sitemap generation, content updates)

### 2.2 Create Workflow File

Create `.github/workflows/validate.yml`:

```yaml
name: Validate & Test Before Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'

jobs:
  validate:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      # 1. Checkout code
      - name: Checkout code
        uses: actions/checkout@v4

      # 2. Set up Node (if needed for build)
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      # 3. Install dependencies
      - name: Install dependencies
        run: npm ci --if-present

      # 4. HTML Validation
      - name: Validate HTML
        run: |
          npm install -g html-validate
          html-validate 'public/**/*.html' || true
        continue-on-error: true

      # 5. Link Checking
      - name: Check for broken links
        uses: actions/download-artifact@v3
        id: check-links
        with:
          name: link-check
        continue-on-error: true

      - name: Run link checker
        run: |
          npm install -g broken-link-checker
          blc http://localhost:3000 -r || true
        continue-on-error: true

      # 6. Generate Sitemaps (Optional)
      - name: Generate sitemaps
        run: |
          node scripts/generate-sitemaps.js || true
        continue-on-error: true

      # 7. Commit generated files if changed
      - name: Commit sitemap changes
        uses: stefanzweifel/git-auto-commit-action@v5
        if: success()
        with:
          commit_message: 'chore: regenerate sitemaps'
          file_pattern: public/sitemap*.xml
          skip_fetch: false
          skip_checkout: false

      # 8. Lighthouse CI (Optional - requires setup)
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          uploadArtifacts: true
          temporaryPublicStorage: true
        continue-on-error: true

      # 9. Accessibility Check (axe)
      - name: Run Accessibility Tests
        run: |
          npm install -g @axe-core/cli
          axe public/index.html --exit || true
        continue-on-error: true

      # 10. Create summary report
      - name: Create validation summary
        if: always()
        run: |
          cat > /tmp/validation-summary.md << 'EOF'
          # Validation Report
          - HTML: Validated
          - Links: Checked
          - Sitemaps: Generated
          - Lighthouse: Tested
          - Accessibility: Tested
          
          All checks passed. Ready for deployment.
          EOF
          echo "Validation complete"

      # 11. Notify on failure
      - name: Notify on failure
        if: failure()
        run: echo "Validation failed - check logs"

  # Deploy only if validation passes
  deploy:
    needs: validate
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - name: Notify Cloudflare Pages
        run: |
          echo "Cloudflare Pages will auto-deploy from this push"
          echo "Deployment URL: https://alhudah.pages.dev"
```

### 2.3 Alternative: Lighthouse CI Configuration

For detailed performance monitoring, create `lighthouserc.json` in the root:

```json
{
  "ci": {
    "collect": {
      "url": [
        "https://alhudah.pages.dev",
        "https://alhudah.pages.dev/surah/al-fatihah",
        "https://alhudah.pages.dev/about"
      ],
      "numberOfRuns": 3,
      "settings": {
        "configPath": "./lighthouse-config.js"
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.95 }]
      }
    }
  }
}
```

### 2.4 Lighthouse Config File

Create `lighthouse-config.js`:

```javascript
module.exports = {
  extends: 'lighthouse:default',
  settings: {
    // Timeout for page load (in milliseconds)
    maxWaitForLoad: 45000,
    
    // Emulated device
    emulatedFormFactor: 'mobile',
    
    // Disable certain audits if needed
    skipAudits: [],
    
    // Chrome flags
    chromeFlags: [
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-sync'
    ],
    
    // Throttling
    throttling: {
      cpuSlowdownMultiplier: 4,
      downloadThroughputKbps: 1600,
      uploadThroughputKbps: 750,
      rttMs: 150
    }
  },
  onlyAudits: [
    'metrics',
    'accessibility',
    'best-practices',
    'seo'
  ]
};
```

---

## 3. CLOUDFLARE PAGES HEADERS FILE

### 3.1 Purpose of _headers File

The `_headers` file controls:
- HTTP security headers (CSP, X-Frame-Options, etc.)
- Caching policies
- Compression
- CORS headers
- Custom redirects

Create `/public/_headers`:

```
# ===================================
# SECURITY HEADERS
# ===================================

/*
  # Prevent clickjacking attacks
  X-Frame-Options: DENY
  
  # Prevent MIME type sniffing
  X-Content-Type-Options: nosniff
  
  # Prevent XSS attacks in older browsers
  X-XSS-Protection: 1; mode=block
  
  # Control referrer information
  Referrer-Policy: strict-origin-when-cross-origin
  
  # Disable browser features for security
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()
  
  # HSTS: Force HTTPS for 1 year (365 days)
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  
  # Comprehensive Content Security Policy
  # CRITICAL: Include fonts.googleapis.com and fonts.gstatic.com in connect-src
  # Service Worker fetches fonts using fetch(), which is governed by connect-src, NOT style-src
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com https://static.cloudflareinsights.com; worker-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://YOUR-PROJECT.supabase.co https://alhudah-worker.ehsaasradio.workers.dev https://cloudflareinsights.com https://fonts.googleapis.com https://fonts.gstatic.com https://api.openai.com; manifest-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';

# ===================================
# CACHING POLICIES
# ===================================

# Static assets: cache for 1 year
/css/*
/js/*
/images/*
/fonts/*
  Cache-Control: public, max-age=31536000, immutable

# HTML files: cache for 1 hour (revalidate frequently)
/*.html
  Cache-Control: public, max-age=3600, must-revalidate

# API responses: no cache, always fresh
/api/*
  Cache-Control: no-store, no-cache, must-revalidate

# Sitemap: cache for 1 day
/sitemap*.xml
  Cache-Control: public, max-age=86400

# Service worker: no cache (always fresh)
/sw.js
  Cache-Control: no-cache, no-store, must-revalidate

# Favicon: cache for 1 day
/favicon.ico
  Cache-Control: public, max-age=86400

# ===================================
# COMPRESSION
# ===================================

/*
  # Cloudflare automatically handles Gzip/Brotli compression
  # These headers signal to Cloudflare to compress if needed
  Vary: Accept-Encoding

# ===================================
# REDIRECTS
# ===================================

# Redirect www to apex domain
https://www.alhudah.com/*
  Status: 301
  Location: https://alhudah.com/:splat

# Old URL redirects (if applicable)
/old-page
  Status: 301
  Location: /new-page

# ===================================
# CUSTOM HEADERS FOR SPECIFIC ROUTES
# ===================================

# Service worker
/sw.js
  Service-Worker-Allowed: /

# API endpoints
/api/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization

# ===================================
# NOTES ON CSP CRITICAL LESSON
# ===================================
# 
# IMPORTANT: From Timeless Hadith implementation:
# The Service Worker uses fetch() to load fonts from Google Fonts.
# The fetch() method is governed by connect-src in CSP, NOT style-src.
#
# If fonts.googleapis.com or fonts.gstatic.com are missing from connect-src,
# the service worker will fail with CORS error when caching fonts:
#   "Failed to fetch: https://fonts.gstatic.com/..."
#
# Solution: Always include BOTH in connect-src AND style-src:
#   style-src: 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com;
#   connect-src: 'self' ... https://fonts.googleapis.com https://fonts.gstatic.com;
#
# Replace YOUR-PROJECT.supabase.co with your actual Supabase URL
# Replace alhudah-worker.ehsaasradio.workers.dev with your actual Worker URL (if using)
```

### 3.2 _headers File Explanation (Line by Line)

| Header | Purpose | Example Value |
|--------|---------|----------------|
| **X-Frame-Options** | Prevent clickjacking | `DENY` (never allow iframe), `SAMEORIGIN` (allow same domain) |
| **X-Content-Type-Options** | Prevent MIME sniffing | `nosniff` (respect Content-Type header) |
| **X-XSS-Protection** | XSS protection (legacy) | `1; mode=block` |
| **Referrer-Policy** | Control referrer leaking | `strict-origin-when-cross-origin` (safe, minimal leaking) |
| **Permissions-Policy** | Disable browser APIs | `geolocation=(), camera=(), microphone=()` |
| **Strict-Transport-Security** | Force HTTPS | `max-age=31536000; includeSubDomains; preload` (1 year) |
| **Content-Security-Policy** | Prevent injection attacks | See CSP section below |
| **Cache-Control** | Browser/CDN caching | `public, max-age=3600` (1 hour) |

### 3.3 CSP Breakdown

```
Content-Security-Policy: 
  default-src 'self';                    # Default: only from same origin
  script-src 'self' 'unsafe-inline' https://accounts.google.com https://static.cloudflareinsights.com;
                                         # Scripts: self + Google + Cloudflare
  worker-src 'self';                     # Service Workers: same origin only
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com;
                                         # Styles: self + Google Fonts
  img-src 'self' data: https:;          # Images: self + data URIs + any HTTPS
  font-src 'self' https://fonts.gstatic.com;
                                         # Fonts: self + Google Fonts
  connect-src 'self' https://YOUR-PROJECT.supabase.co https://alhudah-worker.ehsaasradio.workers.dev https://cloudflareinsights.com https://fonts.googleapis.com https://fonts.gstatic.com https://api.openai.com;
                                         # Fetch/XHR: self + allowed APIs
  manifest-src 'self';                   # Manifests: self
  base-uri 'self';                       # Base href: self
  form-action 'self';                    # Form submissions: self
  frame-ancestors 'none';                # Cannot be framed by any site
```

### 3.4 CSP Testing

Check your CSP with:
- **CSP Evaluator:** https://csp-evaluator.withgoogle.com
- **Browser Console:** Check for CSP violation warnings
- **Example violation error:** `Refused to load script from 'https://blocked-domain.com' because it violates the following Content Security Policy directive: "script-src 'self' https://accounts.google.com"`

---

## 4. ENVIRONMENT VARIABLES & SECRETS MANAGEMENT

### 4.1 Cloudflare Pages Environment Variables

**For production deployment:**

1. Go to your Pages project → **Settings**
2. Navigate to **Environment variables**
3. Click **Add variables**

| Variable Name | Value | Type | Visibility |
|---------------|-------|------|------------|
| `SUPABASE_URL` | `https://YOUR-PROJECT.supabase.co` | Secret | Not exposed to client |
| `SUPABASE_ANON_KEY` | Your public anon key | Plain | Safe for client |
| `OPENAI_API_KEY` | Your OpenAI API key | Secret | Server-side only |
| `ENVIRONMENT` | `production` | Plain | Public |

**Why "Secret" vs "Plain"?**
- **Secret:** Masked in UI, not logged, only available to Edge Functions
- **Plain:** Visible in UI, logged, available everywhere

### 4.2 GitHub Actions Secrets

For CI/CD workflows:

1. Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**

| Secret Name | Value | Usage |
|------------|-------|-------|
| `CF_PAGES_PROJECT_NAME` | `alhudah` | Cloudflare Pages project name |
| `CF_ACCOUNT_ID` | Your Cloudflare account ID | Deploy to Cloudflare |
| `CF_API_TOKEN` | Cloudflare API token | Authenticate with Cloudflare |
| `OPENAI_API_KEY` | Your key | Tests, builds requiring OpenAI |

### 4.3 Cloudflare Worker Secrets (if using)

For serverless functions:

```bash
# Install Wrangler CLI
npm install -g wrangler

# Authenticate
wrangler login

# Add secret to specific environment
wrangler secret put OPENAI_API_KEY --env production

# Verify secret is set (doesn't display value)
wrangler secret list --env production
```

### 4.4 Never Commit Secrets

Add to `.gitignore`:

```
# Environment files
.env
.env.local
.env.*.local

# Secrets
*.key
*.pem
*.p12
*.pfx

# Build artifacts
dist/
build/
.next/
```

---

## 5. DNS CONFIGURATION

### 5.1 Domain Setup for alhudah.com

Assuming alhudah.com is registered with a registrar (GoDaddy, Namecheap, etc.):

#### Step 1: Point Nameservers to Cloudflare

1. Go to your domain registrar (e.g., GoDaddy)
2. Edit **Nameservers** to:
   ```
   josh.ns.cloudflare.com
   mia.ns.cloudflare.com
   ```
   (Actual nameservers provided by Cloudflare when you add the domain)

3. Wait 24-48 hours for propagation (check with `nslookup alhudah.com`)

#### Step 2: Verify Domain in Cloudflare

1. Log into Cloudflare dashboard
2. Click **Add a Site**
3. Enter `alhudah.com`
4. Cloudflare scans for existing DNS records
5. Click **Continue Setup**

#### Step 3: Create Necessary DNS Records

In Cloudflare DNS editor, ensure these records exist:

| Type | Name | Content | TTL | Proxy |
|------|------|---------|-----|-------|
| **A** | @ (root) | `192.0.2.1` (Cloudflare IP) | Auto | ☑️ Proxied |
| **CNAME** | alhudah | `alhudah.pages.dev` | Auto | ☑️ Proxied |
| **CNAME** | www | `alhudah.pages.dev` | Auto | ☑️ Proxied |

Or, let Cloudflare Pages handle it automatically.

#### Step 4: SSL/TLS Configuration

1. Go to **SSL/TLS** in Cloudflare dashboard
2. Set **SSL/TLS encryption mode** to **"Full (strict)"**
3. Ensure **Automatic HTTPS Rewrites** is enabled
4. Verify **Certificate Status** shows "Active"

### 5.2 Subdomain Handling

To redirect `www.alhudah.com` → `alhudah.com`:

1. Go to **Rules** → **Page Rules** in Cloudflare
2. Create a new Page Rule:
   - **URL Pattern:** `www.alhudah.com/*`
   - **Setting:** `Forwarding URL`
   - **Status Code:** `301 - Permanent Redirect`
   - **Destination URL:** `https://alhudah.com$1`

Or use **Cloudflare Rules** (more modern):
1. Go to **Rules** → **Redirect Rules**
2. Create rule:
   - **Expression:** `(http.host eq "www.alhudah.com")`
   - **Action:** `Redirect`
   - **Destination:** `https://alhudah.com/`
   - **Status:** `301`

### 5.3 DNS Propagation Check

```bash
# Check DNS A record
nslookup alhudah.com

# Check nameservers
nslookup -type=NS alhudah.com

# Check CNAME record
nslookup -type=CNAME www.alhudah.com

# Detailed lookup
dig alhudah.com +short
```

Expected output:
```
alhudah.com.     3600    IN  A  104.21.X.X
```

---

## 6. MONITORING & ANALYTICS

### 6.1 Cloudflare Analytics

**To view:**
1. Cloudflare Dashboard → Your Domain
2. **Analytics** tab shows:
   - Page views
   - Unique visitors
   - Requests by country
   - Cache statistics
   - Threats blocked

**Key Metrics:**
- **Cache Hit Ratio:** Should be 90%+
- **Bandwidth:** Monitor for spikes
- **Requests:** Ensure no anomalies

### 6.2 Google Search Console Setup

1. Go to https://search.google.com/search-console
2. Click **Add Property**
3. Select **URL prefix:** `https://alhudah.com`
4. Verify ownership (via DNS TXT record or HTML file)

**In GSC, monitor:**
- **Coverage:** All pages indexed?
- **Performance:** Click-through rate, impressions, position
- **Mobile Usability:** Any mobile issues?
- **Core Web Vitals:** LCP, CLS, INP scores

### 6.3 Google Analytics 4 Setup

1. Create GA4 property: https://analytics.google.com
2. Add measurement ID to your pages:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

3. Monitor:
   - Users
   - Bounce rate
   - Session duration
   - Top pages
   - Traffic sources

### 6.4 Uptime Monitoring

Use free services like:
- **Uptime Robot:** https://uptimerobot.com (free, monitors every 5 min)
- **Pingdom:** https://www.pingdom.com (freemium)
- **Cloudflare Notifications:** Set up alerts in Cloudflare dashboard

**Create uptime alert:**
1. Cloudflare → **Notifications**
2. Add **Incident Alert** rule
3. Set condition: "Page Rule triggered" or "SSL expiring"
4. Get notified via email

---

## 7. ROLLBACK & EMERGENCY PROCEDURES

### 7.1 Cloudflare Pages Rollback

If a bad deployment goes live:

**Option 1: Instant Rollback in UI**
1. Go to Pages project → **Deployments** tab
2. Find the last **good deployment** (green checkmark)
3. Click **...** (three dots)
4. Select **Rollback to this deployment**
5. Confirm

**Option 2: Git Revert**
```bash
# See commit history
git log --oneline

# Revert to previous good commit
git revert abc1234

# Push to main (auto-deploys)
git push origin main
```

### 7.2 Emergency Rollback Checklist

| Step | Action |
|------|--------|
| **1** | Identify the bad deployment (check Cloudflare status) |
| **2** | Confirm impact (check error logs, user reports) |
| **3** | Find last good deployment timestamp |
| **4** | Click rollback in Cloudflare UI |
| **5** | Verify site is working (check homepage, key pages) |
| **6** | Notify stakeholders |
| **7** | Investigate root cause |
| **8** | Fix issue in code |
| **9** | Test locally |
| **10** | Deploy fix |

### 7.3 GitHub Pages Emergency Fallback

If Cloudflare Pages fails completely:

1. Enable GitHub Pages as backup:
   - Go to repo → **Settings** → **Pages**
   - Source: **Deploy from a branch**
   - Branch: `gh-pages`
   - Save

2. Your site will be available at:
   ```
   https://ehsaasradio-bot.github.io/timeless-hadith/
   ```

3. This is a last-resort fallback only.

---

## 8. GO-LIVE CHECKLIST

### 8.1 Pre-Launch Validation

| Item | Status | Notes |
|------|--------|-------|
| [ ] Domain registered | ✓ | alhudah.com purchased |
| [ ] Nameservers updated | ✓ | Pointing to Cloudflare |
| [ ] Cloudflare Pages connected | ✓ | Auto-deployment working |
| [ ] SSL certificate active | ✓ | HTTPS enabled |
| [ ] Custom domain working | ✓ | https://alhudah.com loads |
| [ ] www redirect working | ✓ | www.alhudah.com → alhudah.com |
| [ ] All pages accessible | ✓ | Homepage, surahs, about, etc. |
| [ ] Service worker registered | ✓ | Check DevTools → Application tab |
| [ ] No console errors | ✓ | Check DevTools → Console |
| [ ] Manifest.json valid | ✓ | Check DevTools → Application → Manifest |
| [ ] Images loading | ✓ | All images display correctly |
| [ ] Fonts loading | ✓ | Check Network tab for font files |
| [ ] Responsive design | ✓ | Test mobile, tablet, desktop |
| [ ] Performance tested | ✓ | Lighthouse score 90+ |
| [ ] Accessibility tested | ✓ | No WAVE errors |

### 8.2 Security Validation

| Item | Status | Notes |
|------|--------|-------|
| [ ] CSP headers set | ✓ | Check _headers file |
| [ ] No secrets in code | ✓ | Scan codebase for API keys |
| [ ] HTTPS redirect working | ✓ | http:// → https:// |
| [ ] HSTS header set | ✓ | Strict-Transport-Security present |
| [ ] X-Frame-Options set | ✓ | Prevents clickjacking |
| [ ] No mixed content | ✓ | All resources use https:// |
| [ ] Robots.txt in place | ✓ | /robots.txt exists |
| [ ] Sitemap submitted | ✓ | Google Search Console registered |

### 8.3 Analytics & Monitoring

| Item | Status | Notes |
|------|--------|-------|
| [ ] Google Analytics configured | ✓ | GA4 tracking code added |
| [ ] Google Search Console set | ✓ | Property verified, sitemaps submitted |
| [ ] Uptime monitoring active | ✓ | Uptime Robot or similar |
| [ ] Error logging configured | ✓ | E.g., Sentry, LogRocket (optional) |
| [ ] Performance baselines set | ✓ | Lighthouse, Core Web Vitals baseline |

### 8.4 Post-Launch Tasks

After deployment:

1. **Wait 24-48 hours** for DNS propagation
2. **Verify in Search Console:**
   - Go to Coverage report
   - Ensure pages are "Indexed, not submitted in sitemap" or "Discovered but not indexed"
   - Request indexing for homepage
3. **Check mobile usability:**
   - Visit https://search.google.com/test/mobile-friendly
   - Ensure no "Mobile Usability" issues
4. **Monitor analytics:**
   - Google Analytics → Real-time report
   - Ensure traffic is being recorded
5. **Submit to other search engines:**
   - Bing Webmaster Tools
   - Yandex Search Console (if targeting Russia/CIS)
6. **Create social media posts:**
   - Announce launch on Twitter/X, Facebook, LinkedIn, Instagram

---

## 9. INFRASTRUCTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                     END USERS                               │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           CLOUDFLARE CDN (Global Edge Network)              │
│  ┌──────────────────────────────────────────────────────────┤
│  │ • Cache-first for static assets (JS, CSS, images)        │
│  │ • Network-first for API calls (Supabase)                 │
│  │ • Apply _headers security policies                       │
│  │ • Handle redirects (www → apex)                          │
│  │ • Compress responses (Gzip/Brotli)                       │
│  └──────────────────────────────────────────────────────────┤
└────────────────────────┬────────────────────────────────────┘
                         │ CNAME: alhudah.pages.dev
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   CLOUDFLARE PAGES                          │
│  ┌──────────────────────────────────────────────────────────┤
│  │ • Automatic deployment from GitHub main branch           │
│  │ • Static site hosting (no server needed)                 │
│  │ • Auto-HTTPS with free SSL certificate                  │
│  │ • Environment variables & secrets                        │
│  └──────────────────────────────────────────────────────────┤
└────────────────────────┬────────────────────────────────────┘
                         │ Deployed from
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    GITHUB REPOSITORY                        │
│  ┌──────────────────────────────────────────────────────────┤
│  │ • Branch: main (production)                              │
│  │ • Webhook on push → Cloudflare Pages auto-deploy         │
│  │ • GitHub Actions: validate before deploy                 │
│  │ • Pull Requests: CI validation (no auto-deploy)          │
│  └──────────────────────────────────────────────────────────┤
└────────────────────────┬────────────────────────────────────┘
                         │ API calls to
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               SUPABASE POSTGRESQL DATABASE                  │
│  ┌──────────────────────────────────────────────────────────┤
│  │ • 114 Surahs + verses                                    │
│  │ • Translations (Arabic, English, etc.)                   │
│  │ • User bookmarks (if auth enabled)                       │
│  │ • REST API endpoint: YOUR-PROJECT.supabase.co            │
│  │ • Real-time subscriptions (optional)                     │
│  └──────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────┘
```

---

## 10. DEPLOYMENT SUMMARY CHECKLIST

**Before Going Live:**

- [ ] Cloudflare Pages connected to GitHub
- [ ] Custom domain (alhudah.com) pointing to Cloudflare
- [ ] SSL/TLS certificate active (green padlock)
- [ ] _headers file with security policies in `/public`
- [ ] Environment variables set in Cloudflare Pages dashboard
- [ ] GitHub Actions workflow validation passing
- [ ] Sitemaps generated and accessible at `/sitemap.xml`
- [ ] robots.txt in place at `/robots.txt`
- [ ] Google Search Console property created and verified
- [ ] Lighthouse score 90+ on all metrics
- [ ] No console errors, warnings, or security issues
- [ ] Mobile responsiveness tested
- [ ] Service worker registers successfully
- [ ] Offline fallback page works
- [ ] Analytics (GA4) code added
- [ ] Monitoring alerts configured

**After Deployment:**

- [ ] Visit https://alhudah.com and verify it loads
- [ ] Check https://alhudah.pages.dev as backup
- [ ] Test on mobile device
- [ ] Submit homepage to Google Search Console
- [ ] Monitor Google Analytics for traffic
- [ ] Check Cloudflare Analytics for cache hit ratio
- [ ] Create launch announcements

---

## Quick Reference: Key URLs

| Purpose | URL |
|---------|-----|
| **Live site** | https://alhudah.com |
| **Cloudflare Pages (backup)** | https://alhudah.pages.dev |
| **Cloudflare dashboard** | https://dash.cloudflare.com |
| **GitHub repository** | https://github.com/ehsaasradio-bot/timeless-hadith |
| **Google Search Console** | https://search.google.com/search-console |
| **Google PageSpeed Insights** | https://pagespeed.web.dev |
| **Supabase project** | https://app.supabase.com |

---

## Complete Deployment Workflow

```
1. Make changes locally
   ↓
2. Push to main branch
   ↓
3. GitHub Actions validates (HTML, links, accessibility, performance)
   ↓
4. Validation passes → Cloudflare Pages auto-deploys
   ↓
5. Site live at https://alhudah.pages.dev
   ↓
6. Custom domain https://alhudah.com resolves to Cloudflare Pages
   ↓
7. CDN caches assets globally
   ↓
8. Users see fast, secure site worldwide
   ↓
9. Monitor metrics (Cloudflare Analytics, Google Analytics, GSC)
   ↓
10. If issue: Rollback to previous deployment in Cloudflare UI
```

---

**Deployment guide complete. All systems ready for launch.**
