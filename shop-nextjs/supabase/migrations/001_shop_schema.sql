-- ============================================================
-- Timeless Hadith — Shop Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- Project: dwcsledifvnyrunxejzd.supabase.co
-- ============================================================

-- Enable UUID extension (already enabled on most Supabase projects)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy search

-- ─── CATEGORIES ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shop_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,
  image_alt   TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  featured    BOOLEAN NOT NULL DEFAULT false,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PRODUCTS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shop_products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  price           NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  original_price  NUMERIC(10,2) CHECK (original_price >= 0),
  currency        TEXT NOT NULL DEFAULT 'USD',
  category_id     UUID NOT NULL REFERENCES shop_categories(id) ON DELETE RESTRICT,
  badge           TEXT CHECK (badge IN ('bestseller','new','limited','sale','eid','ramadan')),
  tags            TEXT[] NOT NULL DEFAULT '{}',
  sku             TEXT NOT NULL UNIQUE,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  is_digital      BOOLEAN NOT NULL DEFAULT false,
  free_shipping   BOOLEAN NOT NULL DEFAULT false,
  weight_grams    INT,                      -- for shipping calc
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Computed SEO fields
  meta_title      TEXT,
  meta_description TEXT
);

-- Product images (one-to-many)
CREATE TABLE IF NOT EXISTS shop_product_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt_text    TEXT NOT NULL DEFAULT '',
  sort_order  INT NOT NULL DEFAULT 0,
  is_primary  BOOLEAN NOT NULL DEFAULT false
);

-- ─── INVENTORY ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shop_inventory (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id        UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE UNIQUE,
  quantity_on_hand  INT NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  quantity_reserved INT NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  low_stock_threshold INT NOT NULL DEFAULT 5,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inventory change log
CREATE TABLE IF NOT EXISTS shop_inventory_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  delta       INT NOT NULL,           -- positive = stock in, negative = stock out
  reason      TEXT NOT NULL,          -- 'order', 'adjustment', 'return', 'initial'
  reference   TEXT,                   -- order_id or admin note
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── REVIEWS ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shop_reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  author_name   TEXT NOT NULL,
  author_email  TEXT NOT NULL,
  author_location TEXT,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  is_verified   BOOLEAN NOT NULL DEFAULT false,
  is_approved   BOOLEAN NOT NULL DEFAULT false,  -- admin must approve before showing
  order_id      UUID,                             -- link to verified purchase
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CART ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shop_carts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  TEXT NOT NULL UNIQUE,   -- anonymous session identifier
  user_id     UUID,                   -- null for guests, Supabase auth UID for logged-in
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE TABLE IF NOT EXISTS shop_cart_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id     UUID NOT NULL REFERENCES shop_carts(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  quantity    INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

-- ─── ORDERS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shop_orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number    TEXT NOT NULL UNIQUE,           -- human-readable, e.g. TH-2026-0001
  user_id         UUID,                           -- Supabase auth UID (nullable for guest)
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),

  -- Customer info
  customer_email  TEXT NOT NULL,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT,

  -- Shipping address
  shipping_name     TEXT,
  shipping_address  TEXT,
  shipping_city     TEXT,
  shipping_state    TEXT,
  shipping_zip      TEXT,
  shipping_country  TEXT NOT NULL DEFAULT 'US',

  -- Financials
  subtotal        NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_cost   NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'USD',

  -- Payment (Stripe will be added later)
  payment_status  TEXT NOT NULL DEFAULT 'pending'
                    CHECK (payment_status IN ('pending','paid','failed','refunded')),
  payment_ref     TEXT,               -- Stripe payment intent ID (future)

  -- Fulfillment
  tracking_number TEXT,
  carrier         TEXT,
  notes           TEXT,

  -- Email flags
  confirmation_sent_at TIMESTAMPTZ,
  shipped_at           TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shop_order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES shop_products(id) ON DELETE RESTRICT,
  product_title TEXT NOT NULL,        -- denormalised snapshot at time of order
  product_sku   TEXT NOT NULL,
  quantity      INT NOT NULL CHECK (quantity > 0),
  unit_price    NUMERIC(10,2) NOT NULL,
  line_total    NUMERIC(10,2) NOT NULL,
  is_digital    BOOLEAN NOT NULL DEFAULT false,
  download_url  TEXT,                 -- for digital products
  download_expires_at TIMESTAMPTZ
);

-- ─── NEWSLETTER ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shop_newsletter_subscribers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT NOT NULL UNIQUE,
  first_name  TEXT,
  interests   TEXT[] DEFAULT '{}',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  source      TEXT DEFAULT 'shop',    -- where they signed up
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- ─── DISCOUNT CODES (future-ready) ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shop_discount_codes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT NOT NULL UNIQUE,
  type            TEXT NOT NULL CHECK (type IN ('percent','fixed')),
  value           NUMERIC(10,2) NOT NULL,
  min_order_value NUMERIC(10,2),
  max_uses        INT,
  uses_count      INT NOT NULL DEFAULT 0,
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_products_category    ON shop_products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug        ON shop_products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active      ON shop_products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_badge       ON shop_products(badge) WHERE badge IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_tags        ON shop_products USING GIN(tags);

-- Full-text search on products
CREATE INDEX IF NOT EXISTS idx_products_fts ON shop_products
  USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || array_to_string(tags, ' ')));

CREATE INDEX IF NOT EXISTS idx_product_images_product ON shop_product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product      ON shop_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product        ON shop_reviews(product_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_cart_session           ON shop_carts(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart        ON shop_cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_email           ON shop_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON shop_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number         ON shop_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order     ON shop_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_email      ON shop_newsletter_subscribers(email);

-- Trigram index for fuzzy search
CREATE INDEX IF NOT EXISTS idx_products_title_trgm ON shop_products USING GIN(title gin_trgm_ops);

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON shop_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON shop_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON shop_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON shop_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_carts_updated_at
  BEFORE UPDATE ON shop_carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generate readable order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  yr TEXT := TO_CHAR(NOW(), 'YYYY');
  seq INT;
BEGIN
  SELECT COUNT(*) + 1 INTO seq FROM shop_orders WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  NEW.order_number := 'TH-' || yr || '-' || LPAD(seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_order_number
  BEFORE INSERT ON shop_orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Auto-update inventory when order item inserted
CREATE OR REPLACE FUNCTION reserve_inventory()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE shop_inventory
  SET quantity_reserved = quantity_reserved + NEW.quantity
  WHERE product_id = NEW.product_id;

  INSERT INTO shop_inventory_log(product_id, delta, reason, reference)
  VALUES (NEW.product_id, -NEW.quantity, 'order', NEW.order_id::TEXT);

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reserve_inventory
  AFTER INSERT ON shop_order_items
  FOR EACH ROW EXECUTE FUNCTION reserve_inventory();

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE shop_categories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_product_images        ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_inventory             ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_inventory_log         ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_reviews               ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_carts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_cart_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_orders                ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_order_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_discount_codes        ENABLE ROW LEVEL SECURITY;

-- ── PUBLIC read policies ──

-- Anyone can read active categories
CREATE POLICY "public_read_categories" ON shop_categories
  FOR SELECT USING (is_active = true);

-- Anyone can read active products
CREATE POLICY "public_read_products" ON shop_products
  FOR SELECT USING (is_active = true);

-- Anyone can read product images for active products
CREATE POLICY "public_read_product_images" ON shop_product_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM shop_products p WHERE p.id = product_id AND p.is_active = true)
  );

-- Anyone can read inventory levels (quantity_on_hand - quantity_reserved)
CREATE POLICY "public_read_inventory" ON shop_inventory
  FOR SELECT USING (true);

-- Anyone can read approved reviews
CREATE POLICY "public_read_reviews" ON shop_reviews
  FOR SELECT USING (is_approved = true);

-- Anyone can submit a review (pending approval)
CREATE POLICY "public_insert_review" ON shop_reviews
  FOR INSERT WITH CHECK (is_approved = false);

-- ── CART policies (session-based, no auth required) ──

-- Cart: anon can read/write their own cart by session_id
-- NOTE: The session_id check is enforced at the API layer
-- The anon key can access carts — server validates session_id
CREATE POLICY "anon_manage_carts" ON shop_carts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "anon_manage_cart_items" ON shop_cart_items
  FOR ALL USING (true) WITH CHECK (true);

-- ── ORDER policies ──

-- Users can see their own orders
CREATE POLICY "user_read_own_orders" ON shop_orders
  FOR SELECT USING (
    user_id = auth.uid()
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Server (service role) can create orders — anon checkout creates via service key
-- Public insert is allowed (validated at API layer)
CREATE POLICY "public_insert_orders" ON shop_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public_insert_order_items" ON shop_order_items
  FOR INSERT WITH CHECK (true);

-- Users can read their own order items
CREATE POLICY "user_read_own_order_items" ON shop_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shop_orders o
      WHERE o.id = order_id
        AND (o.user_id = auth.uid() OR o.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

-- Newsletter: public insert only
CREATE POLICY "public_insert_newsletter" ON shop_newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Discount codes: public read of active codes (validate server-side)
CREATE POLICY "public_read_discounts" ON shop_discount_codes
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- ── ADMIN policies — service_role bypasses RLS ──
-- All admin operations use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS
-- No explicit admin policies needed — service role has full access

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA — Sample categories (add products via Admin panel)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO shop_categories (slug, title, description, sort_order, featured, is_active) VALUES
  ('wall-art',          'Wall Art',           'Quranic verses and Islamic geometric art, museum-quality printed.',       1, true,  true),
  ('journals',          'Journals',           'Guided reflection journals, Quran reading trackers, and gratitude books.', 2, true,  true),
  ('prayer-essentials', 'Prayer Essentials',  'Prayer mats, tasbeeh, Qibla compasses, and prayer time accessories.',   3, true,  true),
  ('books',             'Books',              'Curated Islamic literature, Hadith collections, and scholarship.',        4, true,  true),
  ('apparel',           'Apparel',            'Minimal, modest, and meaningful clothing.',                              5, true,  true),
  ('kids-learning',     'Kids Learning',      'Engaging Islamic education tools for young minds.',                      6, false, true),
  ('home-decor',        'Home Decor',         'Transform your living space with meaningful Islamic accents.',            7, false, true),
  ('digital-products',  'Digital Products',   'Printable planners, digital journals, and instant-access resources.',    8, false, true)
ON CONFLICT (slug) DO NOTHING;
