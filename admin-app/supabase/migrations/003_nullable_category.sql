-- Migration 003: Make category_id nullable on shop_products
-- Allows products to be created without assigning a category

ALTER TABLE shop_products
  ALTER COLUMN category_id DROP NOT NULL;
