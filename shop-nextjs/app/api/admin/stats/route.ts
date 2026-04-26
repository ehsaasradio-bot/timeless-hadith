// app/api/admin/stats/route.ts
// GET /api/admin/stats — dashboard statistics

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { adminGetDashboardStats } from '@/lib/shop-api';

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const stats = await adminGetDashboardStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error('[GET /api/admin/stats]', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
