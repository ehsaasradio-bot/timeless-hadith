export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { adminGetSettings, adminUpdateSettings } from '@/lib/shop-api';

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    return NextResponse.json(await adminGetSettings());
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    return NextResponse.json(await adminUpdateSettings(body));
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
