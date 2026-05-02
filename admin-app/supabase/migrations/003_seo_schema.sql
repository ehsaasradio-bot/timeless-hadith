-- ═══════════════════════════════════════════════════════════════
-- SEO Command Center — Supabase Schema
-- Migration: 003_seo_schema.sql
-- Run in: Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── sites ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seo_sites (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain      TEXT NOT NULL UNIQUE,
  name        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── audits ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seo_audits (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id         UUID REFERENCES seo_sites(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','running','complete','failed')),
  health_score    INTEGER CHECK (health_score BETWEEN 0 AND 100),
  seo_score       INTEGER CHECK (seo_score BETWEEN 0 AND 100),
  pages_crawled   INTEGER DEFAULT 0,
  issues_critical INTEGER DEFAULT 0,
  issues_high     INTEGER DEFAULT 0,
  issues_medium   INTEGER DEFAULT 0,
  issues_low      INTEGER DEFAULT 0,
  error_message   TEXT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── audit_issues ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seo_audit_issues (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id        UUID REFERENCES seo_audits(id) ON DELETE CASCADE,
  category        TEXT NOT NULL,
  -- technical | metadata | content | links | images | performance | sitemap | social | security
  severity        TEXT NOT NULL CHECK (severity IN ('critical','high','medium','low')),
  title           TEXT NOT NULL,
  description     TEXT,
  affected_url    TEXT,
  recommendation  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── pages ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seo_pages (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id         UUID REFERENCES seo_sites(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,
  title           TEXT,
  meta_desc       TEXT,
  h1              TEXT,
  word_count      INTEGER DEFAULT 0,
  status_code     INTEGER,
  last_crawled    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (site_id, url)
);

-- ── content_scores ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seo_content_scores (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url            TEXT NOT NULL,
  focus_keyword       TEXT,
  secondary_keywords  TEXT[],
  overall_score       INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  title_score         INTEGER,
  meta_score          INTEGER,
  content_score       INTEGER,
  keyword_score       INTEGER,
  readability_score   INTEGER,
  links_score         INTEGER,
  images_score        INTEGER,
  schema_score        INTEGER,
  social_score        INTEGER,
  analysis_json       JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── recommendations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seo_recommendations (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id        UUID REFERENCES seo_audits(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  -- keyword | content | technical | meta | links | schema | social | performance
  priority        INTEGER DEFAULT 5,
  title           TEXT NOT NULL,
  recommendation  TEXT NOT NULL,
  rationale       TEXT,
  ai_generated    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── weekly_reports ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seo_weekly_reports (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id         UUID REFERENCES seo_sites(id) ON DELETE CASCADE,
  week_start      DATE NOT NULL,
  week_end        DATE NOT NULL,
  health_score    INTEGER,
  seo_score       INTEGER,
  issues_fixed    INTEGER DEFAULT 0,
  issues_new      INTEGER DEFAULT 0,
  summary         TEXT,
  action_plan     TEXT,
  report_json     JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── settings ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seo_settings (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key             TEXT NOT NULL UNIQUE,
  value           TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO seo_settings (key, value) VALUES
  ('openai_model',        'gpt-4o-mini'),
  ('max_pages_per_audit', '50'),
  ('crawl_delay_ms',      '500'),
  ('audit_timeout_ms',    '30000')
ON CONFLICT (key) DO NOTHING;

-- ── indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_seo_audits_site      ON seo_audits(site_id);
CREATE INDEX IF NOT EXISTS idx_seo_issues_audit     ON seo_audit_issues(audit_id);
CREATE INDEX IF NOT EXISTS idx_seo_issues_severity  ON seo_audit_issues(severity);
CREATE INDEX IF NOT EXISTS idx_seo_pages_site       ON seo_pages(site_id);
CREATE INDEX IF NOT EXISTS idx_seo_reports_site     ON seo_weekly_reports(site_id);

-- ── RLS (open for now — lock down per user auth later) ─────────
ALTER TABLE seo_sites              ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_audits             ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_audit_issues       ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_content_scores     ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_recommendations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_weekly_reports     ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings           ENABLE ROW LEVEL SECURITY;

-- Service role bypass (used from API routes with service key)
CREATE POLICY "service_role_all" ON seo_sites              FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all" ON seo_audits             FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all" ON seo_audit_issues       FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all" ON seo_pages              FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all" ON seo_content_scores     FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all" ON seo_recommendations    FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all" ON seo_weekly_reports     FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all" ON seo_settings           FOR ALL TO service_role USING (true);
