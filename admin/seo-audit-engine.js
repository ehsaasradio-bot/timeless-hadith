/**
 * SEO Audit Engine for Timeless Hadith
 * Comprehensive page auditing with scoring, recommendations, and token tracking
 * Exports: window.SEOAudit = { run, getResults, getTokensUsed, reset, getWeeklyTokens }
 */

(function () {
  'use strict';

  const TOKEN_KEY = 'th_seo_tokens_used';
  const TOKEN_WEEK_KEY = 'th_seo_week_start';
  const RESULTS_KEY = 'th_seo_audit_results';
  const TOKENS_PER_PAGE = 100;
  const FULL_AUDIT_TOKENS = TOKENS_PER_PAGE * 9; // 900 tokens for 9 pages

  // Pages to audit
  const PAGES_TO_AUDIT = [
    '/',
    '/categories.html',
    '/category.html',
    '/blog.html',
    '/prayer-times.html',
    '/about.html',
    '/bookmarks.html',
    '/privacy.html',
    '/terms.html'
  ];

  /**
   * Get the current week start date (Sunday)
   */
  function getWeekStart() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek;
    const weekStart = new Date(now.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  }

  /**
   * Check if we need to reset weekly tokens
   */
  function checkWeeklyReset() {
    const lastWeek = localStorage.getItem(TOKEN_WEEK_KEY);
    const currentWeek = getWeekStart();
    if (lastWeek !== currentWeek) {
      localStorage.setItem(TOKEN_KEY, '0');
      localStorage.setItem(TOKEN_WEEK_KEY, currentWeek);
    }
  }

  /**
   * Consume tokens and track usage
   */
  function consumeTokens(amount) {
    checkWeeklyReset();
    let used = parseInt(localStorage.getItem(TOKEN_KEY) || '0', 10);
    used += amount;
    localStorage.setItem(TOKEN_KEY, used.toString());
    return used;
  }

  /**
   * Fetch and parse a page
   */
  async function fetchPage(url) {
    try {
      const fullUrl = url === '/' ? window.location.origin + '/' : window.location.origin + url;
      const startTime = performance.now();
      const response = await fetch(fullUrl);
      const endTime = performance.now();
      const html = await response.text();
      return {
        url,
        html,
        status: response.status,
        loadTime: endTime - startTime
      };
    } catch (error) {
      return {
        url,
        html: '',
        status: 0,
        loadTime: 0,
        error: error.message
      };
    }
  }

  /**
   * Parse HTML and extract meta information
   */
  function parsePageMeta(html) {
    const parser = new DOMParser();
    let doc;
    try {
      doc = parser.parseFromString(html, 'text/html');
    } catch (e) {
      return null;
    }

    // Title
    const titleElement = doc.querySelector('title');
    const title = titleElement ? titleElement.textContent : '';

    // Meta description
    const descElement = doc.querySelector('meta[name="description"]');
    const description = descElement ? descElement.getAttribute('content') : '';

    // OG image
    const ogImageElement = doc.querySelector('meta[property="og:image"]');
    const ogImage = ogImageElement ? ogImageElement.getAttribute('content') : '';

    // Twitter card
    const twitterCardElement = doc.querySelector('meta[name="twitter:card"]');
    const twitterCard = twitterCardElement ? twitterCardElement.getAttribute('content') : '';

    // Canonical
    const canonicalElement = doc.querySelector('link[rel="canonical"]');
    const canonical = canonicalElement ? canonicalElement.getAttribute('href') : '';

    // Robots
    const robotsElement = doc.querySelector('meta[name="robots"]');
    const robots = robotsElement ? robotsElement.getAttribute('content') : '';

    // H1 tags
    const h1Elements = doc.querySelectorAll('h1');
    const h1Count = h1Elements.length;

    // Images without alt text
    const imageElements = doc.querySelectorAll('img');
    let imagesWithoutAlt = 0;
    imageElements.forEach(img => {
      if (!img.getAttribute('alt') || img.getAttribute('alt').trim() === '') {
        imagesWithoutAlt++;
      }
    });

    // JSON-LD structured data
    const jsonLdElements = doc.querySelectorAll('script[type="application/ld+json"]');
    const jsonLdCount = jsonLdElements.length;

    // Skip link
    const skipLink = doc.querySelector('a[href="#main"], a[href="#content"]');
    const hasSkipLink = !!skipLink;

    // Twitter image
    const twitterImageElement = doc.querySelector('meta[name="twitter:image"]');
    const twitterImage = twitterImageElement ? twitterImageElement.getAttribute('content') : '';

    return {
      title,
      titleLength: title.length,
      description,
      descriptionLength: description.length,
      ogImage,
      twitterCard,
      twitterImage,
      canonical,
      robots,
      h1Count,
      imagesWithoutAlt,
      jsonLdCount,
      hasSkipLink
    };
  }

  /**
   * Score a page based on SEO checks
   */
  function scorePage(meta, loadTime) {
    const checks = {
      titleExists: meta.title.length > 0,
      titleLength: meta.titleLength >= 50 && meta.titleLength <= 70,
      descriptionExists: meta.description.length > 0,
      descriptionLength: meta.descriptionLength >= 120 && meta.descriptionLength <= 160,
      ogImageExists: !!meta.ogImage,
      twitterCardExists: !!meta.twitterCard,
      twitterImageExists: !!meta.twitterImage,
      canonicalExists: !!meta.canonical,
      robotsExists: !!meta.robots,
      h1Exists: meta.h1Count === 1,
      imagesAltText: meta.imagesWithoutAlt === 0,
      jsonLdExists: meta.jsonLdCount > 0,
      skipLinkExists: meta.hasSkipLink,
      speedGood: loadTime < 3000
    };

    // Calculate score: max 100
    let score = 0;
    const maxChecks = Object.keys(checks).length;
    Object.values(checks).forEach(result => {
      if (result) score += (100 / maxChecks);
    });

    return {
      score: Math.round(score),
      checks
    };
  }

  /**
   * Generate issues from audit results
   */
  function generateIssues(meta, checks, url) {
    const issues = [];

    if (!checks.titleExists) {
      issues.push({
        type: 'critical',
        field: 'title',
        message: 'Title tag is missing. Add a descriptive title.',
        recommendation: `Add a title tag to ${url}`
      });
    } else if (!checks.titleLength) {
      const len = meta.titleLength;
      if (len < 50) {
        issues.push({
          type: 'warning',
          field: 'title',
          message: `Title is too short (${len} chars). Expand to 50-70 characters.`,
          recommendation: `Expand title for ${url} to at least 50 characters`
        });
      } else if (len > 70) {
        issues.push({
          type: 'warning',
          field: 'title',
          message: `Title is too long (${len} chars). Shrink to 50-70 characters.`,
          recommendation: `Shorten title for ${url} to max 70 characters`
        });
      }
    }

    if (!checks.descriptionExists) {
      issues.push({
        type: 'critical',
        field: 'description',
        message: 'Meta description is missing. Add a concise description.',
        recommendation: `Add meta description to ${url}`
      });
    } else if (!checks.descriptionLength) {
      const len = meta.descriptionLength;
      if (len < 120) {
        issues.push({
          type: 'warning',
          field: 'description',
          message: `Meta description is too short (${len} chars). Expand to 120-160 characters.`,
          recommendation: `Expand meta description for ${url} to 120-160 characters`
        });
      } else if (len > 160) {
        issues.push({
          type: 'warning',
          field: 'description',
          message: `Meta description is too long (${len} chars). Shrink to 120-160 characters.`,
          recommendation: `Shorten meta description for ${url} to max 160 characters`
        });
      }
    }

    if (!checks.ogImageExists) {
      issues.push({
        type: 'warning',
        field: 'og:image',
        message: 'OG image meta tag is missing. Add for social sharing.',
        recommendation: `Add og:image meta tag to ${url}`
      });
    }

    if (!checks.twitterCardExists) {
      issues.push({
        type: 'warning',
        field: 'twitter:card',
        message: 'Twitter card meta tag is missing. Add for Twitter sharing.',
        recommendation: `Add twitter:card meta tag to ${url}`
      });
    }

    if (!checks.twitterImageExists) {
      issues.push({
        type: 'info',
        field: 'twitter:image',
        message: 'Twitter image meta tag is missing (optional but recommended).',
        recommendation: `Add twitter:image meta tag to ${url}`
      });
    }

    if (!checks.canonicalExists) {
      issues.push({
        type: 'critical',
        field: 'canonical',
        message: 'Canonical link is missing. Add to prevent duplicate content issues.',
        recommendation: `Add canonical link to ${url}`
      });
    }

    if (!checks.robotsExists) {
      issues.push({
        type: 'info',
        field: 'robots',
        message: 'Robots meta tag is missing (optional but recommended).',
        recommendation: `Add robots meta tag to ${url}`
      });
    }

    if (!checks.h1Exists) {
      if (meta.h1Count === 0) {
        issues.push({
          type: 'critical',
          field: 'h1',
          message: 'H1 tag is missing. Every page should have exactly one H1.',
          recommendation: `Add an H1 tag to ${url}`
        });
      } else {
        issues.push({
          type: 'warning',
          field: 'h1',
          message: `Multiple H1 tags found (${meta.h1Count}). Pages should have exactly one H1.`,
          recommendation: `Remove extra H1 tags from ${url}. Keep only one.`
        });
      }
    }

    if (!checks.imagesAltText && meta.imagesWithoutAlt > 0) {
      issues.push({
        type: 'warning',
        field: 'alt-text',
        message: `${meta.imagesWithoutAlt} image(s) missing alt text. Add descriptive alt attributes.`,
        recommendation: `Add alt text to ${meta.imagesWithoutAlt} image(s) on ${url}`
      });
    }

    if (!checks.jsonLdExists) {
      issues.push({
        type: 'info',
        field: 'json-ld',
        message: 'No JSON-LD structured data found (optional but recommended for SEO).',
        recommendation: `Add JSON-LD structured data to ${url}`
      });
    }

    if (!checks.skipLinkExists) {
      issues.push({
        type: 'info',
        field: 'skip-link',
        message: 'Skip link is missing (optional but improves accessibility).',
        recommendation: `Add a skip-to-content link to ${url}`
      });
    }

    if (!checks.speedGood) {
      issues.push({
        type: 'info',
        field: 'performance',
        message: `Page load time is slower than ideal (${Math.round(meta.loadTime)}ms).`,
        recommendation: `Optimize page load speed for ${url}`
      });
    }

    return issues;
  }

  /**
   * Main audit function
   */
  async function run(progressCallback) {
    checkWeeklyReset();
    const results = {
      timestamp: new Date().toISOString(),
      pages: [],
      summary: {
        totalScore: 0,
        criticalIssues: 0,
        warnings: 0,
        infoItems: 0,
        totalPages: PAGES_TO_AUDIT.length
      }
    };

    for (let i = 0; i < PAGES_TO_AUDIT.length; i++) {
      const page = PAGES_TO_AUDIT[i];
      if (progressCallback) {
        progressCallback(i + 1, PAGES_TO_AUDIT.length);
      }

      const pageData = await fetchPage(page);

      if (pageData.error) {
        results.pages.push({
          url: page,
          score: 0,
          error: pageData.error,
          issues: []
        });
        continue;
      }

      const meta = parsePageMeta(pageData.html);
      if (!meta) {
        results.pages.push({
          url: page,
          score: 0,
          error: 'Failed to parse page HTML',
          issues: []
        });
        continue;
      }

      const { score, checks } = scorePage(meta, pageData.loadTime);
      const issues = generateIssues(meta, checks, page);

      results.pages.push({
        url: page,
        score,
        meta,
        checks,
        issues,
        loadTime: pageData.loadTime
      });

      results.summary.totalScore += score;
      issues.forEach(issue => {
        if (issue.type === 'critical') results.summary.criticalIssues++;
        else if (issue.type === 'warning') results.summary.warnings++;
        else if (issue.type === 'info') results.summary.infoItems++;
      });
    }

    // Calculate average score
    results.summary.totalScore = Math.round(results.summary.totalScore / PAGES_TO_AUDIT.length);

    // Save results to localStorage
    try {
      localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
    } catch (e) {
      console.warn('Failed to save audit results to localStorage:', e);
    }

    // Consume tokens
    const tokensUsed = consumeTokens(FULL_AUDIT_TOKENS);

    return {
      ...results,
      tokensUsed,
      totalTokensConsumed: tokensUsed
    };
  }

  /**
   * Get last audit results
   */
  function getResults() {
    try {
      const stored = localStorage.getItem(RESULTS_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.warn('Failed to retrieve audit results:', e);
      return null;
    }
  }

  /**
   * Get current token usage
   */
  function getTokensUsed() {
    checkWeeklyReset();
    return parseInt(localStorage.getItem(TOKEN_KEY) || '0', 10);
  }

  /**
   * Get weekly token info
   */
  function getWeeklyTokens() {
    checkWeeklyReset();
    const used = getTokensUsed();
    const limit = 5000; // Weekly limit
    return {
      used,
      limit,
      remaining: Math.max(0, limit - used),
      weekStart: localStorage.getItem(TOKEN_WEEK_KEY)
    };
  }

  /**
   * Reset audit results
   */
  function reset() {
    try {
      localStorage.removeItem(RESULTS_KEY);
      return true;
    } catch (e) {
      console.warn('Failed to reset audit results:', e);
      return false;
    }
  }

  /**
   * Generate recommendations based on results
   */
  function getRecommendations(auditResults) {
    const recommendations = [];

    auditResults.pages.forEach(page => {
      page.issues.forEach(issue => {
        recommendations.push({
          page: page.url,
          priority: issue.type === 'critical' ? 1 : issue.type === 'warning' ? 2 : 3,
          recommendation: issue.recommendation,
          details: issue.message
        });
      });
    });

    // Sort by priority
    recommendations.sort((a, b) => a.priority - b.priority);
    return recommendations;
  }

  /**
   * Export public API
   */
  window.SEOAudit = {
    run,
    getResults,
    getTokensUsed,
    getWeeklyTokens,
    reset,
    getRecommendations
  };

  // Expose for debugging if needed
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('SEO Audit Engine loaded. Access via window.SEOAudit');
  }
})();
