# Timeless Hadith Admin — SEO Audit Engine

Complete SEO audit system for monitoring and optimizing site health.

## Quick Start

1. Open `/admin/seo-report.html` in your browser
2. Enter password: `DummyPassword201!`
3. Click "Run Manual Audit"
4. Review results in the popup and browser console

## Files in This Directory

### Core Engine
- **`seo-audit-engine.js`** (535 lines)
  - Complete audit implementation
  - Fetches and analyzes all 9 pages
  - Performs 14 SEO checks per page
  - Generates actionable recommendations
  - Tracks token usage and scoring

### Dashboard
- **`seo-report.html`** (updated)
  - Admin dashboard with password protection
  - "Run Manual Audit" button (now fully functional)
  - Displays scores and issue summaries
  - Reports token usage
  - Password: `DummyPassword201!`

### Documentation
- **`SEO_AUDIT_ENGINE_USAGE.md`** (200 lines)
  - Complete API reference
  - Method signatures and return types
  - Code examples
  - Token system explanation
  - localStorage keys

- **`INTEGRATION_GUIDE.md`** (400+ lines)
  - How the system works
  - Per-page checks explained
  - Scoring methodology
  - Troubleshooting guide
  - Future enhancement ideas

## What Gets Audited

### 9 Pages Analyzed
```
/ — Home
/categories.html — Category list
/category.html — Category detail
/blog.html — Blog
/prayer-times.html — Prayer times
/about.html — About Us
/bookmarks.html — Bookmarks
/privacy.html — Privacy policy
/terms.html — Terms of service
```

### 14 SEO Checks Per Page
**Critical (must fix):**
- Title tag exists
- Meta description exists
- Canonical link exists
- H1 tag exists (exactly 1)

**Warnings (should fix):**
- Title: 50-70 characters
- Meta description: 120-160 characters
- OG image meta tag exists
- Twitter card meta tag exists
- All images have alt text
- Exactly one H1 tag

**Info (optional but recommended):**
- Twitter image meta tag exists
- Robots meta tag exists
- JSON-LD structured data exists
- Skip link exists
- Page loads in < 3 seconds

## Scoring

Each page is scored 0-100 based on checks passed:
- All 14 checks pass = 100
- 12 checks pass = 86
- Average of all 9 pages = overall score

Example output:
```
Average Score: 84/100
Critical Issues: 2
Warnings: 8
Info Items: 12
```

## Token System

- **Per-page cost**: 100 tokens
- **Full audit**: 900 tokens
- **Weekly limit**: 5000 tokens
- **Reset**: Every Sunday at UTC midnight
- **Audits per week**: ~5-6 full audits within budget

Current usage shown in dashboard and alerts.

## API Usage

```javascript
// Load the engine
// <script src="admin/seo-audit-engine.js"></script>

// Run audit
const results = await window.SEOAudit.run(progressCallback);

// Get last results
const lastResults = window.SEOAudit.getResults();

// Get recommendations
const recs = window.SEOAudit.getRecommendations(results);

// Check tokens
const weekly = window.SEOAudit.getWeeklyTokens();
// {used: 900, limit: 5000, remaining: 4100, weekStart: "2026-04-14"}

// Reset results
window.SEOAudit.reset();

// Get tokens used
const used = window.SEOAudit.getTokensUsed();
```

## Storage

Results stored in browser localStorage:
- `th_seo_audit_results` — Full audit results (JSON)
- `th_seo_tokens_used` — Weekly token count (integer)
- `th_seo_week_start` — Week start date (ISO string)

## Browser Console

When audit completes:
```javascript
// Logged automatically:
// "SEO Audit Results: {...}"
// "Average Score: 84"
// "Issues Found - Critical: 2 Warnings: 8 Info: 12"
```

Access results programmatically:
```javascript
const lastResults = window.SEOAudit.getResults();
console.log(lastResults.pages[0].score);  // Score of first page
console.log(lastResults.pages[0].issues); // Issues found on first page
```

## Common Tasks

### Get average score
```javascript
const results = await window.SEOAudit.run();
console.log(results.summary.totalScore); // 0-100
```

### Get all issues
```javascript
const results = window.SEOAudit.getResults();
const allIssues = [];
results.pages.forEach(page => {
  allIssues.push(...page.issues);
});
```

### Filter by issue type
```javascript
const results = window.SEOAudit.getResults();
const criticalIssues = [];
results.pages.forEach(page => {
  page.issues.forEach(issue => {
    if (issue.type === 'critical') criticalIssues.push(issue);
  });
});
```

### Get recommendations
```javascript
const results = await window.SEOAudit.run();
const recs = window.SEOAudit.getRecommendations(results);
// Sorted by priority (critical → warning → info)
recs.forEach(rec => {
  console.log(`${rec.page}: ${rec.recommendation}`);
});
```

### Reset for next audit
```javascript
window.SEOAudit.reset();
// Results cleared from localStorage
// Ready to run fresh audit
```

## Troubleshooting

### "Audit failed" error
- Check browser console for network errors
- Verify all 9 pages exist and are accessible
- Try from a private/incognito window
- Clear localStorage and retry

### Results not saved
- Check that localStorage is enabled
- Verify browser DevTools → Application → LocalStorage
- Look for `th_seo_audit_results` key
- Clear and retry

### Tokens not resetting
- Reset manually: `localStorage.clear()`
- Or remove just: `localStorage.removeItem('th_seo_tokens_used')`
- Automatic reset happens Sunday UTC

### Performance concerns
- Full audit typically takes 30-60 seconds
- Page-by-page fetching is sequential
- Results are cached to avoid re-auditing
- No external API calls

## Security

- Read-only operations (no changes to site)
- Client-side only (no data sent to servers)
- Password-protected admin dashboard
- localStorage is domain-specific
- No credentials or API keys exposed

## Next Steps

1. **Review results** from first audit
2. **Fix critical issues** (missing title, description, canonical)
3. **Address warnings** (title length, meta description length, alt text)
4. **Run audit again** to verify improvements
5. **Schedule recurring audits** for ongoing monitoring

## Support

Refer to:
- `SEO_AUDIT_ENGINE_USAGE.md` for API details
- `INTEGRATION_GUIDE.md` for in-depth explanation
- Browser console logs for debugging
- `window.SEOAudit` for programmatic access

---

**Created**: April 2026
**Engine Version**: 1.0
**Pages Audited**: 9
**Checks Per Page**: 14
**Status**: Production Ready
