# SEO Audit Engine — Usage Guide

Location: `/admin/seo-audit-engine.js`

## Overview
The SEO Audit Engine provides a comprehensive JavaScript-based audit system for analyzing the SEO health of all pages on the Timeless Hadith website. It performs automated checks, scoring, issue categorization, token tracking, and recommendation generation.

## API Reference

### `window.SEOAudit.run(progressCallback)`
Executes a full SEO audit across all 9 pages.

**Parameters:**
- `progressCallback(currentPage, totalPages)` — Optional callback for progress updates

**Returns:**
```javascript
{
  timestamp: "2026-04-17T14:30:00Z",
  pages: [
    {
      url: "/about.html",
      score: 85,
      meta: { /* parsed meta tags */ },
      checks: { /* boolean results of each check */ },
      issues: [
        {
          type: "critical|warning|info",
          field: "field-name",
          message: "Human-readable issue description",
          recommendation: "Actionable fix"
        }
      ],
      loadTime: 234 // milliseconds
    }
    // ... 9 pages total
  ],
  summary: {
    totalScore: 82,        // Average score across all pages (0-100)
    criticalIssues: 3,     // Number of critical issues found
    warnings: 12,          // Number of warning-level issues
    infoItems: 8,          // Number of informational items
    totalPages: 9
  },
  tokensUsed: 900,         // Tokens consumed this audit
  totalTokensConsumed: 1200 // Cumulative tokens this week
}
```

### `window.SEOAudit.getResults()`
Retrieve the last audit results from localStorage.

**Returns:**
- Last audit result object (same structure as `run()` output) or `null` if no audit has been run

### `window.SEOAudit.getTokensUsed()`
Get the total tokens consumed this week.

**Returns:**
- Integer: tokens used (0–5000 per week)

### `window.SEOAudit.getWeeklyTokens()`
Get detailed weekly token information.

**Returns:**
```javascript
{
  used: 1200,              // Tokens consumed this week
  limit: 5000,             // Weekly token limit
  remaining: 3800,         // Remaining tokens
  weekStart: "2026-04-14"  // ISO date of week start (Sunday)
}
```

### `window.SEOAudit.reset()`
Clear the last audit results from localStorage.

**Returns:**
- Boolean: `true` if successful, `false` if error occurred

### `window.SEOAudit.getRecommendations(auditResults)`
Generate sorted recommendations from audit results.

**Parameters:**
- `auditResults` — The result object returned by `run()`

**Returns:**
```javascript
[
  {
    page: "/about.html",
    priority: 1,           // 1=critical, 2=warning, 3=info
    recommendation: "Add twitter:image meta tag to /about.html",
    details: "Twitter image meta tag is missing (optional but recommended)."
  }
  // ... sorted by priority
]
```

## Pages Audited
The engine audits these 9 pages:
```
[
  '/',
  '/categories.html',
  '/category.html',
  '/blog.html',
  '/prayer-times.html',
  '/about.html',
  '/bookmarks.html',
  '/privacy.html',
  '/terms.html'
]
```

## SEO Checks Per Page
For each page, the engine checks:

### Critical Issues (must fix)
- Title tag exists
- Meta description exists
- Canonical link exists
- H1 tag exists (exactly one)

### Warnings (should fix)
- Title length is 50–70 characters
- Meta description length is 120–160 characters
- OG image meta tag exists
- Twitter card meta tag exists
- Images have alt text
- H1 count is exactly 1

### Info Items (optional but recommended)
- Twitter image meta tag exists
- Robots meta tag exists
- JSON-LD structured data exists
- Skip link exists (for accessibility)
- Page load time is under 3 seconds

## Token System
- Each page audit costs **100 tokens**
- Full audit (9 pages) costs **900 tokens**
- Weekly limit: **5000 tokens**
- Tokens reset every Sunday (UTC)
- Tracked in localStorage: `th_seo_tokens_used` and `th_seo_week_start`

## Scoring
- Pages are scored 0–100
- Each check contributes equally to the score
- Average score is calculated across all 9 pages
- Stored in localStorage: `th_seo_audit_results`

## Integration Example

```html
<!-- In your admin dashboard HTML -->
<script src="admin/seo-audit-engine.js"></script>

<!-- Later in your page -->
<script>
  // Run audit with progress callback
  async function runAudit() {
    console.log('Starting SEO audit...');
    
    const results = await window.SEOAudit.run(function(current, total) {
      console.log(`Progress: ${current}/${total}`);
      // Update UI progress bar here
    });
    
    console.log('Audit complete:', results);
    console.log('Average score:', results.summary.totalScore);
    console.log('Critical issues:', results.summary.criticalIssues);
    
    // Get recommendations
    const recs = window.SEOAudit.getRecommendations(results);
    recs.forEach(rec => {
      console.log(`[${rec.priority}] ${rec.page}: ${rec.recommendation}`);
    });
    
    // Check token usage
    const weekly = window.SEOAudit.getWeeklyTokens();
    console.log(`Tokens: ${weekly.used}/${weekly.limit} used`);
  }
  
  // Attach to button
  document.getElementById('run-audit-btn').addEventListener('click', runAudit);
</script>
```

## localStorage Keys
- `th_seo_tokens_used` — Current week's token consumption (integer)
- `th_seo_week_start` — ISO date of current week start, e.g., "2026-04-14" (string)
- `th_seo_audit_results` — Last audit results (JSON string)

## Notes
- Audit fetches pages from `window.location.origin`
- Works with relative URLs (e.g., `/about.html`) or root (`/`)
- DOMParser used for HTML parsing (no external dependencies)
- Errors during fetch are captured and reported (not thrown)
- Progress callback is optional but recommended for UX
