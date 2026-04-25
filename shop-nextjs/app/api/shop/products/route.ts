// app/api/shop/products/route.ts
// GET /api/shop/products?category=wall-art&search=quran&sort=popular&limit=24&offset=0

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/shop-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category  = searchParams.get('category') ?? undefined;
    const search    = searchParams.get('search') ?? undefined;
    const sort      = (searchParams.get('sort') ?? 'popular') as 'popular' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
    const limit     = Math.min(parseInt(searchParams.get('limit') ?? '24', 10), 100);
    const offset    = parseInt(searchParams.get('offset') ?? '0', 10);

    const { data, total } = await getProducts({ category, search, sort, limit, offset });

    return NextResponse.json(
      { data, total, limit, offset },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'CDN-Cache-Control': 'public, max-age=60',
        },
      }
    );
  } catch (err) {
    console.error('[GET /api/shop/products]', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
