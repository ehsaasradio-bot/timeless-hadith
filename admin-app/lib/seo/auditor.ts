// ═══════════════════════════════════════════════════════════════
// SEO Auditor — Ahrefs-style technical SEO engine
// Runs in Node.js runtime (NOT edge) — heavy crawling
// ═══════════════════════════════════════════════════════════════

import type {
  CrawledPage, SeoIssue, AuditResult,
  RobotsTxtResult, SitemapResult, ImageData, LinkData,
} from './types';

const CRAWL_DELAY_MS  = 400;
const MAX_PAGES       = 50;
const FETCH_TIMEOUT   = 10_000;

// ── Fetch helper ────────────────────────────────────────────────
async function safeFetch(url: string): Promise<{ ok: boolean; status: number; text: string; ms: number }> {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
      headers: { 'User-Agent': 'TimelessHadithSEOBot/1.0 (+https://timelesshadith.com)' },
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text, ms: Date.now() - start };
  } catch {
    return { ok: false, status: 0, text: '', ms: Date.now() - start };
  }
}

// ── HTML parser (edge-safe regex, no DOM) ───────────────────────
function parseHtml(html: string, baseUrl: string): Omit<CrawledPage, 'url' | 'statusCode' | 'redirectUrl' | 'isHttps' | 'loadTimeMs' | 'htmlSizeKb'> {
  const get  = (re: RegExp) => (html.match(re)?.[1] ?? '').trim() || null;
  const getAll = (re: RegExp) => [...html.matchAll(re)].map(m => m[1].trim()).filter(Boolean);

  const title       = get(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDesc    = get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i)
                   ?? get(/<meta[^>]+content=["']([^"']*)[^>]+name=["']description["']/i);
  const canonical   = get(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)/i)
                   ?? get(/<link[^>]+href=["']([^"']*)[^>]+rel=["']canonical["']/i);
  const robotsMeta  = get(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)/i);

  const h1 = getAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi).map(stripTags);
  const h2 = getAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi).map(stripTags);
  const h3 = getAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi).map(stripTags);

  // Images
  const imgMatches = [...html.matchAll(/<img([^>]*)>/gi)];
  const images: ImageData[] = imgMatches.map(m => {
    const attrs = m[1];
    const src   = (attrs.match(/src=["']([^"']*)/i)?.[1] ?? '').trim();
    const alt   = attrs.match(/alt=["']([^"']*)/i)?.[1]?.trim() ?? null;
    return { src: resolveUrl(src, baseUrl), alt };
  }).filter(img => img.src);

  // Links
  const linkMatches = [...html.matchAll(/<a([^>]*)>([\s\S]*?)<\/a>/gi)];
  const base = new URL(baseUrl);
  const links: LinkData[] = linkMatches.map(m => {
    const attrs      = m[1];
    const text       = stripTags(m[2]).trim();
    const href       = (attrs.match(/href=["']([^"']*)/i)?.[1] ?? '').trim();
    const rel        = (attrs.match(/rel=["']([^"']*)/i)?.[1] ?? '').toLowerCase();
    const isNofollow = rel.includes('nofollow');
    if (!href || href.startsWith('#') || href.startsWith('javascript')) return null;
    const abs = resolveUrl(href, baseUrl);
    const isInternal = abs.startsWith(base.origin);
    return { href: abs, text, isInternal, isNofollow };
  }).filter(Boolean) as LinkData[];

  // Word count (strip HTML, count words)
  const text      = stripTags(html).replace(/\s+/g, ' ').trim();
  const wordCount = text.split(/\s+/).filter(w => w.length > 1).length;

  // Schema markup
  const schemaMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const schemaTypes: string[] = [];
  schemaMatches.forEach(m => {
    try {
      const obj = JSON.parse(m[1]);
      const t = obj['@type'] || (Array.isArray(obj['@graph']) ? obj['@graph'].map((g: Record<string, unknown>) => g['@type']) : []);
      if (Array.isArray(t)) schemaTypes.push(...t.map(String));
      else if (t) schemaTypes.push(String(t));
    } catch {}
  });

  // OG / Twitter
  const ogTitle    = get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)/i);
  const ogDesc     = get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)/i);
  const ogImage    = get(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)/i);
  const twitterCard  = get(/<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']*)/i);
  const twitterTitle = get(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']*)/i);

  return {
    title, metaDescription: metaDesc, canonical, robots: robotsMeta,
    h1, h2, h3, images, links, wordCount,
    hasSchema: schemaTypes.length > 0, schemaTypes,
    ogTitle, ogDesc, ogImage, twitterCard, twitterTitle,
  };
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').trim();
}

function resolveUrl(href: string, base: string): string {
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
}

// ── Crawl a single page ─────────────────────────────────────────
async function crawlPage(url: string): Promise<CrawledPage> {
  const result = await safeFetch(url);
  const isHttps  = url.startsWith('https://');
  const htmlSize = (new TextEncoder().encode(result.text).length / 1024);

  if (!result.ok || !result.text) {
    return {
      url, statusCode: result.status, isHttps,
      loadTimeMs: result.ms, htmlSizeKb: htmlSize,
      title: null, metaDescription: null, canonical: null, robots: null,
      h1: [], h2: [], h3: [], images: [], links: [],
      wordCount: 0, hasSchema: false, schemaTypes: [],
      ogTitle: null, ogDesc: null, ogImage: null,
      twitterCard: null, twitterTitle: null,
    };
  }

  const parsed = parseHtml(result.text, url);
  return { url, statusCode: result.status, isHttps, loadTimeMs: result.ms, htmlSizeKb: htmlSize, ...parsed };
}

// ── robots.txt ──────────────────────────────────────────────────
async function checkRobots(origin: string): Promise<RobotsTxtResult> {
  const result = await safeFetch(`${origin}/robots.txt`);
  const issues: string[] = [];
  if (!result.ok) { return { exists: false, issues: ['robots.txt not found (404)'] }; }
  const txt = result.text;
  if (!txt.toLowerCase().includes('user-agent')) issues.push('No User-agent directive found');
  if (!txt.toLowerCase().includes('sitemap')) issues.push('No Sitemap reference in robots.txt');
  return { exists: true, content: txt, issues };
}

// ── sitemap.xml ─────────────────────────────────────────────────
async function checkSitemap(origin: string): Promise<SitemapResult> {
  const candidates = [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`, `${origin}/sitemap/sitemap.xml`];
  for (const url of candidates) {
    const result = await safeFetch(url);
    if (result.ok && result.text.includes('<url')) {
      const count  = (result.text.match(/<url>/g) || []).length;
      const issues = count === 0 ? ['Sitemap found but contains no <url> entries'] : [];
      return { exists: true, url, pageCount: count, issues };
    }
  }
  return { exists: false, pageCount: 0, issues: ['sitemap.xml not found at common paths'] };
}

// ── Issue checkers ──────────────────────────────────────────────
function checkPage(page: CrawledPage): SeoIssue[] {
  const issues: SeoIssue[] = [];
  const u = page.url;

  // HTTPS
  if (!page.isHttps) {
    issues.push({ category: 'security', severity: 'critical', title: 'Page not served over HTTPS', description: `${u} is served over HTTP.`, affectedUrl: u, recommendation: 'Enable HTTPS and redirect all HTTP → HTTPS.' });
  }

  // Status code
  if (page.statusCode === 404) {
    issues.push({ category: 'technical', severity: 'critical', title: 'Page returns 404', description: `${u} returned a 404 Not Found.`, affectedUrl: u, recommendation: 'Fix the broken URL or set up a 301 redirect.' });
  } else if (page.statusCode >= 500) {
    issues.push({ category: 'technical', severity: 'critical', title: `Server error (${page.statusCode})`, description: `${u} returned a server error.`, affectedUrl: u, recommendation: 'Fix the server error immediately — this page is uncrawlable.' });
  }

  // Title
  if (!page.title) {
    issues.push({ category: 'metadata', severity: 'critical', title: 'Missing page title', description: `${u} has no <title> tag.`, affectedUrl: u, recommendation: 'Add a descriptive <title> (50–60 characters) with the primary keyword.' });
  } else if (page.title.length < 30) {
    issues.push({ category: 'metadata', severity: 'high', title: 'Title too short', description: `Title "${page.title}" is only ${page.title.length} chars.`, affectedUrl: u, recommendation: 'Expand the title to 50–60 characters for better visibility in SERPs.' });
  } else if (page.title.length > 65) {
    issues.push({ category: 'metadata', severity: 'medium', title: 'Title too long', description: `Title is ${page.title.length} chars — will be truncated in SERPs.`, affectedUrl: u, recommendation: 'Shorten to under 60 characters.' });
  }

  // Meta description
  if (!page.metaDescription) {
    issues.push({ category: 'metadata', severity: 'high', title: 'Missing meta description', description: `${u} has no meta description.`, affectedUrl: u, recommendation: 'Add a meta description (120–160 characters) that summarises the page and includes the target keyword.' });
  } else if (page.metaDescription.length < 70) {
    issues.push({ category: 'metadata', severity: 'medium', title: 'Meta description too short', description: `Description is only ${page.metaDescription.length} chars.`, affectedUrl: u, recommendation: 'Expand to 120–160 characters.' });
  } else if (page.metaDescription.length > 165) {
    issues.push({ category: 'metadata', severity: 'low', title: 'Meta description too long', description: `Description is ${page.metaDescription.length} chars — will be truncated.`, affectedUrl: u, recommendation: 'Trim to under 160 characters.' });
  }

  // H1
  if (page.h1.length === 0) {
    issues.push({ category: 'content', severity: 'high', title: 'Missing H1', description: `${u} has no H1 heading.`, affectedUrl: u, recommendation: 'Add a single H1 tag that includes the primary keyword.' });
  } else if (page.h1.length > 1) {
    issues.push({ category: 'content', severity: 'medium', title: 'Multiple H1 tags', description: `${u} has ${page.h1.length} H1 headings.`, affectedUrl: u, recommendation: 'Use exactly one H1 per page.' });
  }

  // Thin content
  if (page.wordCount > 0 && page.wordCount < 300) {
    issues.push({ category: 'content', severity: 'high', title: 'Thin content', description: `Only ${page.wordCount} words on ${u}.`, affectedUrl: u, recommendation: 'Add more valuable content. Aim for 600+ words for informational pages.' });
  }

  // Images alt text
  const missingAlt = page.images.filter(i => !i.alt || i.alt.trim() === '');
  if (missingAlt.length > 0) {
    issues.push({ category: 'images', severity: 'medium', title: `${missingAlt.length} image(s) missing alt text`, description: `Alt text is critical for accessibility and image search.`, affectedUrl: u, recommendation: 'Add descriptive alt attributes to all images, including the focus keyword where natural.' });
  }

  // Canonical
  if (!page.canonical) {
    issues.push({ category: 'technical', severity: 'low', title: 'Missing canonical tag', description: `${u} has no canonical URL.`, affectedUrl: u, recommendation: 'Add <link rel="canonical"> to prevent duplicate content issues.' });
  }

  // OG tags
  if (!page.ogTitle || !page.ogImage) {
    issues.push({ category: 'social', severity: 'low', title: 'Incomplete Open Graph tags', description: `${u} is missing og:title or og:image.`, affectedUrl: u, recommendation: 'Add og:title, og:description, og:image for rich social previews.' });
  }

  // Twitter cards
  if (!page.twitterCard) {
    issues.push({ category: 'social', severity: 'low', title: 'Missing Twitter Card', description: `No twitter:card meta tag found.`, affectedUrl: u, recommendation: 'Add twitter:card, twitter:title, twitter:description, twitter:image.' });
  }

  // Schema
  if (!page.hasSchema) {
    issues.push({ category: 'technical', severity: 'low', title: 'No structured data (schema.org)', description: `${u} has no JSON-LD or schema markup.`, affectedUrl: u, recommendation: 'Add relevant schema: Article, BreadcrumbList, FAQPage, or WebPage.' });
  }

  // Performance
  if (page.loadTimeMs > 3000) {
    issues.push({ category: 'performance', severity: 'high', title: 'Slow page load time', description: `Fetched in ${(page.loadTimeMs / 1000).toFixed(1)}s.`, affectedUrl: u, recommendation: 'Optimise server response time, enable caching, and compress assets.' });
  }
  if (page.htmlSizeKb > 200) {
    issues.push({ category: 'performance', severity: 'medium', title: 'Large HTML payload', description: `HTML is ${page.htmlSizeKb.toFixed(0)} KB.`, affectedUrl: u, recommendation: 'Minify HTML, defer non-critical scripts, and remove unused code.' });
  }

  return issues;
}

// ── Score calculator ────────────────────────────────────────────
function calcScores(issues: SeoIssue[], pagesCrawled: number): { health: number; seo: number } {
  const deductions = { critical: 15, high: 8, medium: 3, low: 1 };
  let penalty = 0;
  issues.forEach(i => { penalty += deductions[i.severity] || 0; });
  const health = Math.max(0, Math.min(100, 100 - penalty));
  const seoIssues = issues.filter(i => ['metadata', 'content', 'technical'].includes(i.category));
  let seoPenalty = 0;
  seoIssues.forEach(i => { seoPenalty += deductions[i.severity] || 0; });
  const seo = Math.max(0, Math.min(100, 100 - seoPenalty));
  return { health, seo };
}

// ── Main audit entry point ──────────────────────────────────────
export async function runAudit(inputUrl: string): Promise<AuditResult> {
  const base = new URL(inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`);
  const origin = base.origin;

  const allIssues: SeoIssue[] = [];
  const crawledPages: CrawledPage[] = [];

  // Crawl homepage first
  const home = await crawlPage(base.href);
  crawledPages.push(home);
  allIssues.push(...checkPage(home));

  // Discover internal links to crawl
  const visited  = new Set<string>([base.href]);
  const queue    = home.links.filter(l => l.isInternal && !l.href.includes('#')).map(l => l.href).slice(0, MAX_PAGES - 1);

  for (const url of queue) {
    if (crawledPages.length >= MAX_PAGES) break;
    if (visited.has(url)) continue;
    visited.add(url);

    await new Promise(r => setTimeout(r, CRAWL_DELAY_MS));
    const page = await crawlPage(url);
    crawledPages.push(page);
    allIssues.push(...checkPage(page));
  }

  // Global checks: duplicate titles
  const titleMap = new Map<string, string[]>();
  crawledPages.forEach(p => {
    if (p.title) {
      const key = p.title.toLowerCase();
      if (!titleMap.has(key)) titleMap.set(key, []);
      titleMap.get(key)!.push(p.url);
    }
  });
  titleMap.forEach((urls, title) => {
    if (urls.length > 1) {
      allIssues.push({ category: 'metadata', severity: 'high', title: 'Duplicate page title', description: `Title "${title}" used on ${urls.length} pages.`, recommendation: `Make each page title unique. Affected: ${urls.slice(0, 3).join(', ')}` });
    }
  });

  // Duplicate meta descriptions
  const metaMap = new Map<string, string[]>();
  crawledPages.forEach(p => {
    if (p.metaDescription) {
      const key = p.metaDescription.toLowerCase();
      if (!metaMap.has(key)) metaMap.set(key, []);
      metaMap.get(key)!.push(p.url);
    }
  });
  metaMap.forEach((urls, desc) => {
    if (urls.length > 1) {
      allIssues.push({ category: 'metadata', severity: 'medium', title: 'Duplicate meta description', description: `Same description used on ${urls.length} pages.`, recommendation: `Write unique meta descriptions for each page.` });
    }
  });

  // robots.txt + sitemap
  const [robotsTxt, sitemapXml] = await Promise.all([checkRobots(origin), checkSitemap(origin)]);
  robotsTxt.issues.forEach(msg => allIssues.push({ category: 'sitemap', severity: 'medium', title: `robots.txt: ${msg}`, description: msg, recommendation: 'Review and update robots.txt.' }));
  sitemapXml.issues.forEach(msg => allIssues.push({ category: 'sitemap', severity: 'medium', title: `Sitemap: ${msg}`, description: msg, recommendation: 'Create and submit an XML sitemap to Google Search Console.' }));

  const scores  = calcScores(allIssues, crawledPages.length);
  const summary = {
    critical: allIssues.filter(i => i.severity === 'critical').length,
    high:     allIssues.filter(i => i.severity === 'high').length,
    medium:   allIssues.filter(i => i.severity === 'medium').length,
    low:      allIssues.filter(i => i.severity === 'low').length,
    passed:   Math.max(0, crawledPages.length * 12 - allIssues.length),
  };

  return {
    url: base.href,
    healthScore: scores.health,
    seoScore: scores.seo,
    pagesCrawled: crawledPages.length,
    crawledPages,
    issues: allIssues,
    robotsTxt,
    sitemapXml,
    summary,
  };
}
