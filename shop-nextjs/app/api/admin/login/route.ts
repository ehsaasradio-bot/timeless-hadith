// app/api/admin/login/route.ts
// POST /api/admin/login { secret } — set admin session cookie

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json();
    const ADMIN_SECRET = process.env.ADMIN_SECRET;

    if (!ADMIN_SECRET) {
      return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
    }

    if (!secret || secret !== ADMIN_SECRET) {
      // Constant-time comparison would be ideal; this is sufficient for edge
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, ADMIN_SECRET, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 8 * 60 * 60, // 8 hour session
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
  return response;
}
