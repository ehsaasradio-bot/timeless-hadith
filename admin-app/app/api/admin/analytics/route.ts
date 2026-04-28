export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { adminGetAnalytics } from '@/lib/shop-api';

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const params = new URL(request.url).searchParams;
  let from = params.get('from');
  let to   = params.get('to');

  // Default: last 30 days
  if (!from || !to) {
    const now  = new Date();
    to   = now.toISOString();
    const f = new Date(now);
    f.setDate(f.getDate() - 29);
    f.setHours(0, 0, 0, 0);
    from = f.toISOString();
  }

  try {
    return NextResponse.json(await adminGetAnalytics(from, to));
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
