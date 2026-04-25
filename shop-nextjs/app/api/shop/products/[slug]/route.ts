// app/api/shop/products/[slug]/route.ts
// GET /api/shop/products/:slug

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/shop-api';

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await getProductBySlug(params.slug);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('[GET /api/shop/products/[slug]]', err);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
