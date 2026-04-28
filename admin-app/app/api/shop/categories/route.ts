// app/api/shop/categories/route.ts
// GET /api/shop/categories

export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/shop-api';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    console.error('[GET /api/shop/categories]', err);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
