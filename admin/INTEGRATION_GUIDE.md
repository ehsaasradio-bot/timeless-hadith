# SEO Audit Engine — Integration Guide

## Files Created
- **`seo-audit-engine.js`** — Core audit engine (535 lines)
- **`SEO_AUDIT_ENGINE_USAGE.md`** — API documentation
- **`seo-report.html`** — Admin dashboard with password protection (updated with integration)
- **`INTEGRATION_GUIDE.md`** — This file

## What Was Built

### 1. SEO Audit Engine (`seo-audit-engine.js`)
A complete JavaScript-based audit system that:
- Audits all 9 pages of the Timeless Hadith website
- Performs 14 SEO checks per page
- Generates actionable recommendations
- Tracks token usage (100 tokens per page, 900 for full audit)
- Stores results in localStorage
- Provides detailed scoring (0-100 per page, average across all pages)

### 2. Integration into Admin Dashboard
The `seo-report.html` dashboard now:
- Loads the `seo-audit-engine.js` script
- Implements the "Run Manual Audit" button with real functionality
- Displays audit progress (page-by-page)
- Shows results summary with scores and issue counts
- Logs detailed results to browser console for inspection

## How to Use

### From the Admin Dashboard
1. Navigate to `/admin/seo-report.html`
2. Enter the password: `DummyPassword201!`
3. Click the "Run Manual Audit" button
4. Wait for the audit to complete (typically 30-60 seconds for all 9 pages)
5. Review the results in the popup alert and browser console

### Programmatic Usage

```javascript
// Load the engine
// <script src="admin/seo-audit-engine.js"></script>

// Run a full audit
const results = await window.SEOAudit.run(function(current, total) {
  console.log(`Progress: ${current}/${total}`);
});

// Get results
console.log('Average Score:', results.summary.totalScore);
console.log('Pages audited:', results.pages);

// Get recommendations (sorted by priority)
const recs = window.SEOAudit.getRecommendations(results);
recs.forEach(rec => {
  console.log(`[Priority ${rec.priority}] ${rec.page}: ${rec.recommendation}`);
});

// Check token usage
const weekly = window.SEOAudit.getWeeklyTokens();
console.log(`Tokens used: ${weekly.used}/${weekly.limit}`);

// Reset results
window.SEOAudit.reset();
```

## SEO Checks Performed

For each of the 9 pages, the engine checks:

### Critical Issues (must fix)
1. **Title tag exists** — Pages must have a `<title>` tag
2. **Meta description exists** — Must have `<meta name="description">`
3. **Canonical link exists** — Must have `<link rel="canonical">`
4. **H1 exists (exactly one)** — Must have exactly one H1 tag

### Warnings (should fix)
5. **Title length 50-70 chars** — Optimal for search results display
6. **Meta description 120-160 chars** — Optimal for search results display
7. **OG image exists** — Social media sharing (`<meta property="og:image">`)
8. **Twitter card exists** — Twitter sharing (`<meta name="twitter:card">`)
9. **Images have alt text** — All `<img>` tags must have alt attributes
10. **H1 count = 1** — Avoid multiple H1 tags

### Info Items (optional but recommended)
11. **Twitter image exists** — Social media (`<meta name="twitter:image">`)
12. **Robots meta tag exists** — SEO control (`<meta name="robots">`)
13. **JSON-LD structured data** — Schema.org markup for rich snippets
14. **Skip link exists** — Accessibility (`<a href="#main">`)
15. **Page load speed < 3s** — Performance metric

## Scoring System

### Per-Page Score (0-100)
Each check contributes equally to the page score. If 12 checks pass out of 15, the score is 80.

### Overall Score
Average of all 9 page scores.

### Example
```
Page Scores:
- / (home): 87
- /about.html: 92
- /blog.html: 78
- /categories.html: 85
- /category.html: 88
- /prayer-times.html: 72
- /bookmarks.html: 81
- /privacy.html: 91
- /terms.html: 89

Average Score: 84
```

## Token System

### Token Consumption
- Each page audit: **100 tokens**
- Full audit (9 pages): **900 tokens**
- Weekly limit: **5000 tokens**

### Weekly Reset
Tokens reset every Sunday at UTC midnight (ISO week start). You can run about **5-6 full audits per week** within the budget.

### Token Storage
Tracked in localStorage:
- `th_seo_tokens_used` — Current week's consumption
- `th_seo_week_start` — ISO date of week start (e.g., "2026-04-14")

## Results Storage

Audit results are automatically saved to:
- **localStorage key**: `th_seo_audit_results`
- **Format**: JSON
- **Retention**: Until manually cleared or browser localStorage is wiped

### Result Structure
```javascript
{
  timestamp: "2026-04-17T14:30:00Z",
  pages: [
    {
      url: "/about.html",
      score: 92,
      meta: { /* parsed meta information */ },
      checks: { /* boolean results */ },
      issues: [
        {
          type: "warning",
          field: "twitter:image",
          message: "Twitter image is missing",
          recommendation: "Add twitter:image meta tag to /about.html"
        }
      ],
      loadTime: 234 // ms
    }
    // ... 9 total
  ],
  summary: {
    totalScore: 84,        // Average
    criticalIssues: 2,
    warnings: 8,
    infoItems: 12,
    totalPages: 9
  },
  tokensUsed: 900,
  totalTokensConsumed: 1200
}
```

## Dashboard Integration

The "Run Manual Audit" button in `/admin/seo-report.html` now:

1. **Disables** the button and shows "Running audit..."
2. **Fetches** each of the 9 pages from your site
3. **Parses** the HTML using DOMParser
4. **Checks** 14 SEO metrics per page
5. **Scores** each page and calculates average
6. **Generates** recommendations sorted by priority
7. **Tracks** tokens in localStorage
8. **Shows** results in an alert popup
9. **Logs** full results to browser console
10. **Re-enables** the button with status indicator

## Next Steps

### To Display Results in Dashboard
Update the seo-report.html to show:
- Per-page score cards with issue icons
- Issue list sorted by severity
- Recommendation list with actionable steps
- Token usage gauge
- Last audit timestamp
- Quick fix instructions

### To Add Auto-Scheduling
Create a scheduled task that runs the audit daily:
```javascript
// Run audit automatically every day at 9 AM
const auditTask = setInterval(async () => {
  const results = await window.SEOAudit.run();
  // Store or send to backend
  // Notify admin if critical issues found
}, 24 * 60 * 60 * 1000);
```

### To Add Backend Integration
POST audit results to a backend API:
```javascript
const results = await window.SEOAudit.run();
// Send to your backend
fetch('/api/seo-audit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(results)
});
```

## Pages Audited

The engine audits these 9 pages:
1. `/` — Homepage
2. `/categories.html` — Category listing
3. `/category.html` — Single category view
4. `/blog.html` — Blog page
5. `/prayer-times.html` — Prayer times page
6. `/about.html` — About Us page
7. `/bookmarks.html` — Bookmarks page
8. `/privacy.html` — Privacy policy
9. `/terms.html` — Terms of service

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Uses native `fetch()` API
- Uses native `DOMParser`
- Uses `localStorage` for persistence
- No external dependencies

## Security Notes
- The audit engine fetches pages as the public would see them
- No sensitive data is exposed
- Results are stored in client-side localStorage (not transmitted)
- Admin dashboard requires password protection
- All audits are read-only (no changes to site)

## Troubleshooting

### Audit fails to complete
- Check browser console for network errors
- Verify all 9 pages exist and are accessible
- Check if server is responding to fetch requests
- Try from a private/incognito window

### Results not showing
- Open browser DevTools → Application → LocalStorage
- Look for key `th_seo_audit_results`
- Check if localStorage is enabled
- Clear localStorage and try again

### Token usage seems wrong
- Reset tokens: `localStorage.removeItem('th_seo_tokens_used')`
- Reset week: `localStorage.removeItem('th_seo_week_start')`
- Wait for automatic reset (Sunday UTC)

### Console shows CORS errors
- Ensure all pages are served from the same origin
- Check CORS headers if pages are from different domains
- Verify no Content-Security-Policy blocking fetch

## Performance Expectations

- **Per-page fetch time**: 100-500ms (depends on network + server)
- **HTML parsing**: 10-50ms per page
- **Total audit time**: 30-60 seconds for all 9 pages
- **Results calculation**: < 100ms
- **Token tracking**: Instant (localStorage)

## Future Enhancements

Potential improvements for future versions:
1. **Lighthouse integration** — Fetch actual performance scores
2. **Mobile usability audit** — Check mobile-specific issues
3. **Accessibility audit** — Full WCAG 2.1 compliance check
4. **Content analysis** — Keyword density, readability, tone
5. **Competitor comparison** — Benchmark against similar sites
6. **Email notifications** — Alert on critical issues
7. **Historical tracking** — Graph scores over time
8. **Bulk page testing** — Audit unlimited pages
9. **Custom rules** — Define your own audit criteria
10. **API endpoint** — Remote audit scheduling
