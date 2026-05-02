// ═══════════════════════════════════════════════════════════════
// SEO Command Center — TypeScript Types
// ═══════════════════════════════════════════════════════════════

export type Severity  = 'critical' | 'high' | 'medium' | 'low';
export type AuditStatus = 'pending' | 'running' | 'complete' | 'failed';
export type ScoreColor  = 'green' | 'amber' | 'red';

// ── Raw page data extracted by crawl ───────────────────────────
export interface CrawledPage {
  url:            string;
  statusCode:     number;
  redirectUrl?:   string;
  title:          string | null;
  metaDescription: string | null;
  canonical:      string | null;
  robots:         string | null;
  h1:             string[];
  h2:             string[];
  h3:             string[];
  images:         ImageData[];
  links:          LinkData[];
  wordCount:      number;
  hasSchema:      boolean;
  schemaTypes:    string[];
  ogTitle:        string | null;
  ogDesc:         string | null;
  ogImage:        string | null;
  twitterCard:    string | null;
  twitterTitle:   string | null;
  isHttps:        boolean;
  loadTimeMs:     number;
  htmlSizeKb:     number;
}

export interface ImageData {
  src:     string;
  alt:     string | null;
  width?:  number;
  height?: number;
}

export interface LinkData {
  href:       string;
  text:       string;
  isInternal: boolean;
  isNofollow: boolean;
}

// ── Issues ─────────────────────────────────────────────────────
export interface SeoIssue {
  id?:            string;
  category:       string;
  severity:       Severity;
  title:          string;
  description:    string;
  affectedUrl?:   string;
  recommendation: string;
}

// ── Audit result ───────────────────────────────────────────────
export interface AuditResult {
  url:            string;
  healthScore:    number;
  seoScore:       number;
  pagesCrawled:   number;
  crawledPages:   CrawledPage[];
  issues:         SeoIssue[];
  robotsTxt:      RobotsTxtResult;
  sitemapXml:     SitemapResult;
  summary: {
    critical: number;
    high:     number;
    medium:   number;
    low:      number;
    passed:   number;
  };
}

export interface RobotsTxtResult {
  exists:    boolean;
  content?:  string;
  issues:    string[];
}

export interface SitemapResult {
  exists:    boolean;
  url?:      string;
  pageCount: number;
  issues:    string[];
}

// ── Content analysis ────────────────────────────────────────────
export interface ContentAnalysisInput {
  pageUrl:           string;
  focusKeyword:      string;
  secondaryKeywords: string[];
  targetCountry?:    string;
  targetAudience?:   string;
  content?:          string; // raw text/html; if absent, auto-fetch
}

export interface ContentFactor {
  key:         string;
  label:       string;
  status:      ScoreColor;
  score:       number;          // 0–100
  message:     string;
  tips:        string[];
}

export interface ContentAnalysisResult {
  pageUrl:          string;
  focusKeyword:     string;
  overallScore:     number;
  titleAnalysis:    ContentFactor[];
  metaAnalysis:     ContentFactor[];
  urlAnalysis:      ContentFactor[];
  headingAnalysis:  ContentFactor[];
  keywordAnalysis:  ContentFactor[];
  contentAnalysis:  ContentFactor[];
  linksAnalysis:    ContentFactor[];
  imagesAnalysis:   ContentFactor[];
  schemaAnalysis:   ContentFactor[];
  socialAnalysis:   ContentFactor[];
  rawData: {
    title:        string | null;
    metaDesc:     string | null;
    h1:           string[];
    wordCount:    number;
    keywordDensity: number;
  };
}

// ── AI suggestions ─────────────────────────────────────────────
export interface AiSuggestion {
  type:         string;
  priority:     number;
  title:        string;
  suggestion:   string;
  rationale:    string;
}

export interface AiRewriteResult {
  original: string;
  rewritten: string;
  explanation: string;
}

// ── Dashboard metrics ──────────────────────────────────────────
export interface DashboardMetrics {
  healthScore:      number;
  seoScore:         number;
  contentScore:     number;
  criticalErrors:   number;
  warnings:         number;
  passedChecks:     number;
  pagesIndexed:     number;
  lastAuditDate:    string | null;
  weeklyTrend:      TrendPoint[];
  topIssues:        { category: string; count: number }[];
}

export interface TrendPoint {
  date:         string;
  healthScore:  number;
  seoScore:     number;
}

// ── DB row types (mirrors Supabase tables) ─────────────────────
export interface SeoSiteRow {
  id:         string;
  domain:     string;
  name:       string | null;
  created_at: string;
  updated_at: string;
}

export interface SeoAuditRow {
  id:               string;
  site_id:          string | null;
  url:              string;
  status:           AuditStatus;
  health_score:     number | null;
  seo_score:        number | null;
  pages_crawled:    number;
  issues_critical:  number;
  issues_high:      number;
  issues_medium:    number;
  issues_low:       number;
  error_message:    string | null;
  started_at:       string | null;
  completed_at:     string | null;
  created_at:       string;
}

export interface SeoIssueRow {
  id:             string;
  audit_id:       string;
  category:       string;
  severity:       Severity;
  title:          string;
  description:    string | null;
  affected_url:   string | null;
  recommendation: string | null;
  created_at:     string;
}
