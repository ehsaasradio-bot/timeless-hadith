# Timeless Hadith — Admin SEO & Product Report Dashboard

## Overview
A complete, self-contained HTML admin dashboard for monitoring SEO performance and product metrics for the Timeless Hadith platform.

**File:** `/admin/seo-report.html`
**Size:** 40KB (single HTML file, all CSS/JS inline)
**Password:** `DummyPassword201!`

---

## Features

### 1. Password-Protected Access
- Centered login card with gradient logo
- sessionStorage-based authentication
- Shake animation on failed login
- Logout button on dashboard

### 2. Dashboard Header
- "SEO & Product Dashboard" title
- Auto-updated date display
- **Run Audit Now** button — triggers live SEO audit across all 9 pages
- **Schedule: Daily 9AM** dropdown — saves schedule preference to localStorage

### 3. Top Statistics (4 Cards)
| Card | Metric | Status |
|------|--------|--------|
| 1 | Overall SEO Score | 87/100 (green) |
| 2 | Pages Audited | 9/9 (blue) |
| 3 | Issues Found | 3 total (orange) |
| 4 | Tokens Used | 1,840/10,000 (blue) |

### 4. Token Spending Gauge (Right Panel)
- **SVG semicircle gauge** with green-to-teal gradient
- Center displays "SPENT" label + large token number
- Breakdown section:
  - SEO Audit: 900 tokens
  - AI Analysis: 640 tokens
  - Keyword Research: 300 tokens
- "Your weekly token limit is 10,000" note
- Dynamically updates as audit runs

### 5. SEO Tool Usage Grid (4 Mini-Cards)
Each tool card displays:
- **Tool name**
- **Usage percentage bar** (gradient fill)
- **Tokens remaining**
- **Sparkline chart** (trends up/down)
- Status text ("Trending up", "Limit reached", etc.)

Tools included:
1. On-Page SEO Audit (75% usage)
2. AI Content Analysis (60% usage)
3. Image Alt Checker (0% usage, red "Upgrade" badge)
4. Keyword Research (30% usage)

### 6. Audit Results Table
Real-time table populated after "Run Audit Now":
- **Columns:** Page | Title | Description | OG Image | JSON-LD | Score
- **Status Badges:** PASS (green), WARN (orange), FAIL (red)
- **Score:** /100 with color coding
- **Pages audited:** All 9 core pages

### 7. Recommendations Section
Auto-generated after audit completes with actionable SEO & product improvements:
- Add skip-link targets (main-content IDs)
- Protect admin routes with Cloudflare Access
- Connect Supabase hadith database
- Deploy Lighthouse audit post-launch
- Add JSON-LD schema to category pages
- Submit sitemap to Google Search Console

---

## Technical Details

### Storage Keys
- `th_admin_auth` — sessionStorage for authentication state
- `th_seo_last_audit` — localStorage for last audit results
- `th_seo_schedule` — localStorage for scheduled audit preference

### Audit Logic
When "Run Audit Now" is clicked:
1. Fetches all 9 pages via fetch() API
2. Parses HTML with DOMParser
3. Checks: title length, meta description, og:image, JSON-LD presence, h1 count
4. Assigns PASS/WARN/FAIL badges per check
5. Calculates score (max 100, min 50)
6. Uses 100 tokens per page (900 total)
7. Updates all stat cards and table in real-time
8. Saves results to localStorage with timestamp

### Design System
- **Dark theme** optimized for admin use
- **Color scheme:**
  - Primary: #4f72f8 (accent blue)
  - Success: #00c853 (green)
  - Warning: #ffa726 (orange)
  - Error: #ef5350 (red)
  - Background: #060c1a (dark navy)
  - Cards: #0d1629 (slightly lighter)

### Responsive Layout
- Stat cards: 4-column grid on desktop, 2-column on tablet, 1-column on mobile
- Content grid: 2-column (tools + gauge) on desktop, 1-column on mobile
- All elements scale proportionally

### Animations
- Login shake animation on wrong password
- Gauge progress animation
- Toast notifications with slide-in effect
- Button hover effects with depth

---

## Pages Audited
The dashboard monitors these 9 pages:
1. Home (`/`)
2. Blog (`/blog.html`)
3. Categories (`/categories.html`)
4. Prayer Times (`/prayer-times.html`)
5. Hadith Search (`/search.html`)
6. About Us (`/about.html`)
7. Contact (`/contact.html`)
8. Resources (`/resources.html`)
9. Admin (`/admin/`)

---

## Usage Instructions

### Access the Dashboard
1. Navigate to `/admin/seo-report.html`
2. Enter password: `DummyPassword201!`
3. Click "Access Dashboard"

### Run an Audit
1. Click "Run Audit Now" button
2. Wait for loader to complete (fetches all 9 pages)
3. View results in the audit table
4. Review recommendations

### Schedule Audits
1. Click "Schedule: Daily 9AM ▾"
2. Select a schedule option
3. Preference is saved to localStorage
4. Toast confirmation appears

### Monitor Tokens
- Watch the semicircle gauge on the right
- Breakdown shows usage per tool category
- Resets weekly (10,000 token limit)

### Logout
- Click "Logout" button in top-right
- Clears sessionStorage authentication
- Returns to login screen

---

## Customization

### Change Password
Edit line 887 in the HTML:
```javascript
const PASSWORD = 'DummyPassword201!';
```

### Modify Token Limit
Edit the gauge note and calculation:
```javascript
const MAX_TOKENS = 10000; // Default: 10,000
```

### Add/Remove Pages
Modify the `pagesToAudit` array (lines ~924-934):
```javascript
const pagesToAudit = [
    { name: 'Page Name', path: '/path.html' },
    // ... add more pages
];
```

### Change Colors
Modify CSS custom properties in the `:root` section:
```css
:root {
    --accent: #4f72f8;
    --green: #00c853;
    --orange: #ffa726;
    /* ... etc */
}
```

---

## Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires localStorage and sessionStorage support

---

## Notes
- This is a **self-contained HTML file** — no external dependencies
- All CSS and JavaScript are **inline** for easy deployment
- Suitable for Cloudflare Pages, GitHub Pages, or any static hosting
- No API keys or sensitive data hardcoded (add your own in production)

