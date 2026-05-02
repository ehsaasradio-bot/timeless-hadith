// app/api/shop/reviews/route.ts
// GET  /api/shop/reviews?productId=xxx&limit=20 — fetch approved reviews
// POST /api/shop/reviews                        — submit a review (pending approval)

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getReviews, submitReview } from '@/lib/shop-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') ?? undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);

    const reviews = await getReviews(productId, limit);
    return NextResponse.json(reviews, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (err) {
    console.error('[GET /api/shop/reviews]', err);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { productId, authorName, authorEmail, rating, title, body: reviewBody } = body;

    if (!productId) return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    if (!authorName?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    if (!authorEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }
    if (!title?.trim() || title.length > 200) {
      return NextResponse.json({ error: 'Title is required (max 200 chars)' }, { status: 400 });
    }
    if (!reviewBody?.trim() || reviewBody.length < 20) {
      return NextResponse.json({ error: 'Review body must be at least 20 characters' }, { status: 400 });
    }

    const result = await submitReview({
      productId,
      authorName: authorName.trim(),
      authorEmail,
      authorLocation: body.authorLocation?.trim(),
      rating,
      title: title.trim(),
      body: reviewBody.trim(),
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(
      { ok: true, message: 'Review submitted and pending approval. Thank you!' },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/shop/reviews]', err);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
