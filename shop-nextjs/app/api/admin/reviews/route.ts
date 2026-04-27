export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { adminGetAllReviews, adminUpdateReview, adminDeleteReview } from '@/lib/shop-api';

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  const filter = new URL(request.url).searchParams.get('filter') as 'pending' | 'approved' | null;
  try {
    return NextResponse.json(await adminGetAllReviews(filter ?? undefined));
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { id, ...fields } = await request.json();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    return NextResponse.json(await adminUpdateReview(id, fields));
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  try {
    await adminDeleteReview(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
