// app/api/admin/products/route.ts
// GET    /api/admin/products            — list all products (admin)
// POST   /api/admin/products            — create product
// PUT    /api/admin/products            — update product (include id in body)
// DELETE /api/admin/products?id=xxx     — delete product

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import {
  adminGetAllProducts,
  adminUpsertProduct,
  adminDeleteProduct,
  adminUpdateInventory,
} from '@/lib/shop-api';

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const products = await adminGetAllProducts();
    return NextResponse.json(products);
  } catch (err) {
    console.error('[GET /api/admin/products]', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    // Validate required fields
    const { title, slug, price, sku, category_id } = body;
    if (!title?.trim()) return NextResponse.json({ error: 'title is required' }, { status: 400 });
    if (typeof price !== 'number' || price < 0) return NextResponse.json({ error: 'price must be a non-negative number' }, { status: 400 });
    if (!sku?.trim()) return NextResponse.json({ error: 'sku is required' }, { status: 400 });
    // category_id is optional — products can be uncategorized
    const autoSlug = (slug || title).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const product = await adminUpsertProduct({
      title: title.trim(),
      slug: autoSlug,
      description: body.description ?? '',
      price,
      original_price: body.original_price ?? null,
      currency: body.currency ?? 'USD',
      category_id: category_id || null,
      badge: body.badge ?? null,
      tags: body.tags ?? [],
      sku: sku.trim().toUpperCase(),
      is_active: body.is_active ?? true,
      is_digital: body.is_digital ?? false,
      free_shipping: body.free_shipping ?? false,
      weight_grams: body.weight_grams ?? null,
      meta_title: body.meta_title ?? null,
      meta_description: body.meta_description ?? null,
    });

    // Set initial inventory if provided
    if (typeof body.initial_quantity === 'number') {
      await adminUpdateInventory(product.id, body.initial_quantity, 'initial');
    }

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create product';
    console.error('[POST /api/admin/products]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: 'id is required for update' }, { status: 400 });

    const product = await adminUpsertProduct(body);

    // Update inventory if provided
    if (typeof body.quantity_on_hand === 'number') {
      await adminUpdateInventory(body.id, body.quantity_on_hand, 'adjustment');
    }

    return NextResponse.json(product);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update product';
    console.error('[PUT /api/admin/products]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  try {
    await adminDeleteProduct(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete product';
    console.error('[DELETE /api/admin/products]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
