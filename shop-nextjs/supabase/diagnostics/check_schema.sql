-- ============================================================
-- Full Database Diagnostic — Timeless Hadith Shop
-- Run in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ─── 1. All tables in public schema ──────────────────────────
SELECT
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name)::regclass)) AS size,
  (SELECT COUNT(*) FROM information_schema.columns c
   WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ─── 2. products — exact column list ─────────────────────────
SELECT
  ordinal_position AS pos,
  column_name,
  data_type,
  character_maximum_length AS max_len,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'products'
ORDER BY ordinal_position;

-- ─── 3. orders — exact column list ───────────────────────────
SELECT
  ordinal_position AS pos,
  column_name,
  data_type,
  character_maximum_length AS max_len,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'orders'
ORDER BY ordinal_position;

-- ─── 4. products row count + sample ──────────────────────────
SELECT COUNT(*) AS product_count FROM products;
SELECT id, slug, name, price, images, stripe_price_id FROM products ORDER BY price LIMIT 12;

-- ─── 5. orders row count + sample ────────────────────────────
SELECT COUNT(*) AS order_count FROM orders;
SELECT id, status, stripe_session_id, total, created_at FROM orders ORDER BY created_at DESC LIMIT 5;

-- ─── 6. Constraints on products ──────────────────────────────
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'products'
ORDER BY tc.constraint_type, kcu.column_name;

-- ─── 7. Constraints on orders ────────────────────────────────
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'orders'
ORDER BY tc.constraint_type, kcu.column_name;

-- ─── 8. Indexes ───────────────────────────────────────────────
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('products', 'orders')
ORDER BY tablename, indexname;

-- ─── 9. RLS status ────────────────────────────────────────────
SELECT
  relname AS table_name,
  relrowsecurity AS rls_enabled,
  relforcerowsecurity AS rls_forced
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relkind = 'r'
  AND relname IN ('products', 'orders')
ORDER BY relname;

-- ─── 10. RLS policies ────────────────────────────────────────
SELECT
  tablename,
  policyname,
  cmd AS operation,
  qual AS using_expr,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('products', 'orders')
ORDER BY tablename, policyname;
