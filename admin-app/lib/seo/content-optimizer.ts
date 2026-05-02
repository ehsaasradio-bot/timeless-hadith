// ═══════════════════════════════════════════════════════════════
// Content Optimizer — Yoast-style content analysis
// ═══════════════════════════════════════════════════════════════

import type { ContentAnalysisInput, ContentAnalysisResult, ContentFactor, ScoreColor } from './types';

// ── Helpers ─────────────────────────────────────────────────────
function score(val: number): ScoreColor {
  if (val >= 70) return 'green';
  if (val >= 40) return 'amber';
  return 'red';
}

function kw(text: string, keyword: string): boolean {
  return text.toLowerCase().includes(keyword.toLowerCase());
}

function kwDensity(text: string, keyword: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const kws   = keyword.toLowerCase().split(/\s+/);
  let count   = 0;
  for (let i = 0; i <= words.length - kws.length; i++) {
    if (kws.every((k, j) => words[i + j] === k)) count++;
  }
  return words.length > 0 ? (count / words.length) * 100 : 0;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

function getAll(html: string, re: RegExp): string[] {
  return [...html.matchAll(re)].map(m => m[1].trim()).filter(Boolean);
}

function get(html: string, re: RegExp): string | null {
  return html.match(re)?.[1]?.trim() || null;
}

// ── Fetch page content ──────────────────────────────────────────
export async function fetchPageContent(url: string): Promise<string> {
  const res  = await fetch(url, {
    signal: AbortSignal.timeout(10_000),
    headers: { 'User-Agent': 'TimelessHadithSEOBot/1.0' },
  });
  return res.text();
}

// ── Factor builder ───────────────────────────────────────────────
function factor(key: string, label: string, s: number, message: string, tips: string[] = []): ContentFactor {
  return { key, label, status: score(s), score: s, message, tips };
}

// ── Analyze ─────────────────────────────────────────────────────
export async function analyzeContent(input: ContentAnalysisInput): Promise<ContentAnalysisResult> {
  let html = input.content || '';
  if (!html) {
    try { html = await fetchPageContent(input.pageUrl); } catch { html = ''; }
  }

  const text       = stripTags(html);
  const words      = text.split(/\s+/).filter(w => w.length > 1);
  const wordCount  = words.length;
  const fk         = input.focusKeyword.toLowerCase().trim();
  const url        = input.pageUrl;
  const slug       = url.split('/').filter(Boolean).pop() ?? '';

  // Extract fields
  const title    = get(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ?? '';
  const metaDesc = get(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i)
                ?? get(html, /<meta[^>]+content=["']([^"']*)[^>]+name=["']description["']/i) ?? '';
  const h1s      = getAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map(stripTags);
  const h2s      = getAll(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi).map(stripTags);
  const h3s      = getAll(html, /<h3[^>]*>([\s\S]*?)<\/h3>/gi).map(stripTags);
  const images   = [...html.matchAll(/<img([^>]*)>/gi)].map(m => m[1]);
  const allLinks = [...html.matchAll(/<a([^>]*)>/gi)].map(m => m[1]);
  const baseOrigin = (() => { try { return new URL(url).origin; } catch { return ''; } })();
  const internalLinks = allLinks.filter(a => {
    const href = a.match(/href=["']([^"']*)/i)?.[1] ?? '';
    return href && !href.startsWith('#') && (href.startsWith('/') || href.startsWith(baseOrigin));
  });
  const externalLinks = allLinks.filter(a => {
    const href = a.match(/href=["']([^"']*)/i)?.[1] ?? '';
    return href && href.startsWith('http') && !href.startsWith(baseOrigin);
  });

  const density    = kwDensity(text, fk);
  const paragraphs = (html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || []).map(p => stripTags(p));
  const firstPara  = paragraphs[0] ?? '';
  const ogTitle    = get(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)/i);
  const ogDesc     = get(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)/i);
  const ogImage    = get(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)/i);
  const twCard     = get(html, /<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']*)/i);
  const hasSchema  = html.includes('application/ld+json');

  // ── 1. Title analysis ──────────────────────────────────────────
  const titleLen = title.length;
  const titleAnalysis: ContentFactor[] = [
    factor('title_keyword', 'Keyword in title', kw(title, fk) ? 100 : 0, kw(title, fk) ? `"${fk}" found in title.` : `Focus keyword "${fk}" missing from title.`, kw(title, fk) ? [] : [`Add "${fk}" near the start of the title.`]),
    factor('title_length', 'Title length', titleLen >= 50 && titleLen <= 60 ? 100 : titleLen >= 40 && titleLen <= 65 ? 70 : titleLen > 0 ? 30 : 0, titleLen ? `Title is ${titleLen} characters.` : 'No title found.', ['Aim for 50–60 characters.']),
    factor('title_ctr', 'CTR attractiveness', title.match(/\b(best|top|guide|how|why|free|new|ultimate)\b/i) ? 80 : 50, 'Power words boost click-through rates.', ['Use numbers, brackets, or power words like "Ultimate Guide", "Top 10".']),
  ];

  // ── 2. Meta description ────────────────────────────────────────
  const metaLen = metaDesc.length;
  const metaAnalysis: ContentFactor[] = [
    factor('meta_keyword', 'Keyword in meta desc', kw(metaDesc, fk) ? 100 : 0, kw(metaDesc, fk) ? 'Keyword found in meta description.' : 'Keyword missing from meta description.', [`Include "${fk}" naturally.`]),
    factor('meta_length', 'Meta desc length', metaLen >= 120 && metaLen <= 160 ? 100 : metaLen >= 80 ? 60 : metaLen > 0 ? 30 : 0, metaLen ? `${metaLen} characters.` : 'No meta description found.', ['Target 120–160 characters.']),
    factor('meta_cta', 'Call to action', metaDesc.match(/\b(learn|discover|get|find|read|explore|try|start)\b/i) ? 80 : 40, 'CTAs in descriptions improve clicks.', ['Add an action verb: "Learn how to…", "Discover the…"']),
  ];

  // ── 3. URL slug ────────────────────────────────────────────────
  const urlAnalysis: ContentFactor[] = [
    factor('slug_keyword', 'Keyword in URL', kw(slug, fk.replace(/\s+/g, '-')) ? 100 : 0, kw(slug, fk.replace(/\s+/g, '-')) ? 'Keyword found in URL slug.' : 'Keyword not in URL.', [`Rename slug to include "${fk.replace(/\s+/g, '-')}".`]),
    factor('slug_length', 'Slug length', slug.length <= 60 ? 100 : 60, `Slug is "${slug}".`, ['Keep slugs under 60 characters and use hyphens.']),
    factor('slug_clean', 'Clean URL', /^[a-z0-9-]+$/i.test(slug) ? 100 : 40, /^[a-z0-9-]+$/i.test(slug) ? 'Clean URL.' : 'URL contains special characters or uppercase.', ['Use lowercase letters, numbers, and hyphens only.']),
  ];

  // ── 4. Headings ────────────────────────────────────────────────
  const headingAnalysis: ContentFactor[] = [
    factor('h1_present', 'H1 present', h1s.length === 1 ? 100 : h1s.length === 0 ? 0 : 50, h1s.length === 1 ? `H1: "${h1s[0]}"` : h1s.length === 0 ? 'No H1 found.' : `${h1s.length} H1s found (should be 1).`, ['Use exactly one H1 per page.']),
    factor('h1_keyword', 'Keyword in H1', h1s.some(h => kw(h, fk)) ? 100 : 0, h1s.some(h => kw(h, fk)) ? 'H1 contains focus keyword.' : 'H1 does not contain focus keyword.', [`Include "${fk}" in your H1.`]),
    factor('h2_structure', 'H2 structure', h2s.length >= 2 ? 100 : h2s.length === 1 ? 60 : 20, `${h2s.length} H2 heading(s) found.`, ['Use 2–5 H2 headings to structure your content.']),
    factor('h3_support', 'H3 sub-sections', h3s.length > 0 ? 80 : 50, `${h3s.length} H3 heading(s) found.`, ['H3s help break up long sections and improve readability.']),
  ];

  // ── 5. Keyword optimization ────────────────────────────────────
  const idealDensity = density >= 0.5 && density <= 2.5;
  const keywordAnalysis: ContentFactor[] = [
    factor('kw_intro', 'Keyword in intro', kw(firstPara, fk) ? 100 : 0, kw(firstPara, fk) ? 'Keyword in first paragraph.' : 'Keyword not in first paragraph.', ['Mention the keyword in the first 100 words.']),
    factor('kw_headings', 'Keyword in headings', [...h2s, ...h3s].some(h => kw(h, fk)) ? 100 : 0, 'Keyword usage in subheadings.', [`Use "${fk}" or related terms in at least one H2 or H3.`]),
    factor('kw_density', 'Keyword density', idealDensity ? 100 : density < 0.5 ? 40 : 30, `Density: ${density.toFixed(2)}% (target: 0.5–2.5%).`, idealDensity ? [] : [density < 0.5 ? 'Use the keyword more naturally.' : 'Reduce keyword repetition to avoid over-optimisation.']),
    factor('kw_secondary', 'Secondary keywords', input.secondaryKeywords.length > 0 ? (input.secondaryKeywords.some(sk => kw(text, sk)) ? 90 : 40) : 50, `${input.secondaryKeywords.filter(sk => kw(text, sk)).length}/${input.secondaryKeywords.length} secondary keywords used.`, ['Sprinkle secondary keywords naturally throughout the content.']),
  ];

  // ── 6. Content quality ─────────────────────────────────────────
  const avgParaWords = paragraphs.length > 0 ? wordCount / paragraphs.length : 0;
  const contentAnalysis: ContentFactor[] = [
    factor('content_length', 'Content length', wordCount >= 1000 ? 100 : wordCount >= 600 ? 75 : wordCount >= 300 ? 50 : 20, `${wordCount} words. Target: 600+ for standard pages, 1000+ for articles.`, []),
    factor('readability', 'Readability', avgParaWords <= 80 ? 90 : avgParaWords <= 150 ? 60 : 30, `Avg paragraph: ${Math.round(avgParaWords)} words.`, ['Keep paragraphs under 80 words. Short paragraphs are easier to read.']),
    factor('content_structure', 'Content structure', h2s.length >= 2 && paragraphs.length >= 5 ? 90 : 50, `${paragraphs.length} paragraphs, ${h2s.length} H2s.`, ['Use headings, paragraphs, and lists to break up content.']),
  ];

  // ── 7. Links ───────────────────────────────────────────────────
  const linksAnalysis: ContentFactor[] = [
    factor('internal_links', 'Internal links', internalLinks.length >= 3 ? 100 : internalLinks.length >= 1 ? 60 : 0, `${internalLinks.length} internal link(s) found.`, ['Add 3–5 internal links to related pages.']),
    factor('external_links', 'External authority links', externalLinks.length >= 1 ? 80 : 40, `${externalLinks.length} external link(s) found.`, ['Link to 1–2 authoritative external sources.']),
  ];

  // ── 8. Images ──────────────────────────────────────────────────
  const imagesWithAlt = images.filter(a => (a.match(/alt=["']([^"']*)/i)?.[1] ?? '').trim() !== '');
  const imagesAnalysis: ContentFactor[] = [
    factor('img_alt', 'Image alt text', images.length === 0 ? 50 : imagesWithAlt.length === images.length ? 100 : Math.round((imagesWithAlt.length / images.length) * 100), `${imagesWithAlt.length}/${images.length} images have alt text.`, ['Add descriptive alt text to all images, including the keyword where natural.']),
    factor('img_count', 'Image usage', images.length >= 2 ? 90 : images.length === 1 ? 70 : 40, `${images.length} image(s) on page.`, ['Include at least 2 relevant images in longer articles.']),
  ];

  // ── 9. Schema ──────────────────────────────────────────────────
  const schemaAnalysis: ContentFactor[] = [
    factor('schema_present', 'Structured data (schema)', hasSchema ? 100 : 0, hasSchema ? 'Schema markup found.' : 'No structured data found.', ['Add relevant schema: Article, FAQPage, BreadcrumbList.']),
    factor('faq_schema', 'FAQ schema', html.includes('"FAQPage"') ? 100 : 0, html.includes('"FAQPage"') ? 'FAQ schema present.' : 'No FAQ schema found.', ['Add FAQ schema to target "People Also Ask" boxes.']),
  ];

  // ── 10. Social ─────────────────────────────────────────────────
  const socialAnalysis: ContentFactor[] = [
    factor('og_tags', 'Open Graph tags', (ogTitle && ogDesc && ogImage) ? 100 : (ogTitle || ogDesc) ? 60 : 0, (ogTitle && ogDesc && ogImage) ? 'All OG tags present.' : 'Some OG tags missing.', ['Add og:title, og:description, og:image for rich social previews.']),
    factor('twitter_card', 'Twitter Card', twCard ? 100 : 0, twCard ? `Twitter card: "${twCard}".` : 'No Twitter card found.', ['Add twitter:card, twitter:title, twitter:description, twitter:image.']),
  ];

  // ── Overall score ───────────────────────────────────────────────
  const allFactors = [...titleAnalysis, ...metaAnalysis, ...urlAnalysis, ...headingAnalysis, ...keywordAnalysis, ...contentAnalysis, ...linksAnalysis, ...imagesAnalysis, ...schemaAnalysis, ...socialAnalysis];
  const overallScore = Math.round(allFactors.reduce((sum, f) => sum + f.score, 0) / allFactors.length);

  return {
    pageUrl:          url,
    focusKeyword:     fk,
    overallScore,
    titleAnalysis, metaAnalysis, urlAnalysis, headingAnalysis,
    keywordAnalysis, contentAnalysis, linksAnalysis, imagesAnalysis,
    schemaAnalysis, socialAnalysis,
    rawData: { title, metaDesc, h1: h1s, wordCount, keywordDensity: density },
  };
}
