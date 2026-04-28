// app/api/admin/login/route.ts
// POST /api/admin/login { secret } — verify password, set signed session cookie
// DELETE /api/admin/login          — logout (clear cookie)

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, deriveSessionToken } from '@/lib/admin-auth';

/** Constant-time comparison to prevent timing attacks on the login check. */
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  if (a.length !== b.length) return false;
  const enc = new TextEncoder();
  const aKey = await crypto.subtle.importKey('raw', enc.encode(a), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bKey = await crypto.subtle.importKey('raw', enc.encode(b), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const msg = enc.encode('timeless-login-check');
  const [aSig, bSig] = await Promise.all([
    crypto.subtle.sign('HMAC', aKey, msg),
    crypto.subtle.sign('HMAC', bKey, msg),
  ]);
  const aArr = new Uint8Array(aSig);
  const bArr = new Uint8Array(bSig);
  let diff = 0;
  for (let i = 0; i < aArr.length; i++) diff |= aArr[i] ^ bArr[i];
  return diff === 0;
}

export async function POST(request: NextRequest) {
  const ADMIN_SECRET = process.env.ADMIN_SECRET; // read inside handler — edge safe

  if (!ADMIN_SECRET) {
    console.error('[admin/login] ADMIN_SECRET not configured');
    return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { secret } = body as { secret?: string };

    if (!secret?.trim()) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const valid = await timingSafeEqual(secret.trim(), ADMIN_SECRET);

    if (!valid) {
      // 300ms artificial delay — slows brute-force attempts
      await new Promise((r) => setTimeout(r, 300));
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Derive a deterministic HMAC token — NOT the raw secret
    const sessionToken = await deriveSessionToken(ADMIN_SECRET);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, '', {
    maxAge: 0,
    path: '/',
    httpOnly: true,
    secure: true,
  });
  return response;
}
