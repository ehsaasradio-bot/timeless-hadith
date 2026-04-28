-- ============================================================
-- Migration 002: Shop Settings table
-- Run in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

CREATE TABLE IF NOT EXISTS shop_settings (
  id                          INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  shop_name                   TEXT NOT NULL DEFAULT 'Timeless Hadith Shop',
  shop_tagline                TEXT DEFAULT 'Premium Islamic gifts & collectibles',
  contact_email               TEXT DEFAULT 'shop@timelesshadith.com',
  currency                    TEXT NOT NULL DEFAULT 'USD',
  free_shipping_threshold     NUMERIC(10,2) NOT NULL DEFAULT 75.00,
  default_low_stock_threshold INT NOT NULL DEFAULT 5,
  social_facebook             TEXT,
  social_instagram            TEXT,
  social_twitter              TEXT,
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed with one row (single-row settings table pattern)
INSERT INTO shop_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;

-- Only service role (admin) can read/write settings
-- Public users have no access — settings are internal only
