// app/api/admin/login/route.ts
// POST   /api/admin/login { secret } — verify password, mint random session,
//                                       set httpOnly cookie
// DELETE /api/admin/login            — logout: revoke server-side session,
//                                       clear cookie

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import {
  COOKIE_NAME,
  SESSION_TTL_SECONDS,
  verifyPassword,
  createSession,
  revokeSession,
  isLoginRateLimited,
  recordLoginFailure,
  resetLoginRateLimit,
  LOGIN_RATELIMIT_WINDOW_SECONDS,
  LOGIN_RATELIMIT_MAX_FAILS,
  getClientIp,
} from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  if (!process.env.ADMIN_SECRET) {
    console.error('[admin/login] ADMIN_SECRET not configured');
    return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
  }

  const ip = getClientIp(request);

  // Rate-limit BEFORE doing any expensive work (HMAC, KV writes).
  if (await isLoginRateLimited(ip)) {
    return NextResponse.json(
      {
        error: 'Too many failed attempts. Try again later.',
        retryAfterSeconds: LOGIN_RATELIMIT_WINDOW_SECONDS,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(LOGIN_RATELIMIT_WINDOW_SECONDS),
          'Cache-Control': 'no-store',
        },
      },
    );
  }

  let secret: string | undefined;
  try {
    const body = (await request.json()) as { secret?: string };
    secret = body.secret;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!secret?.trim()) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  const valid = await verifyPassword(secret.trim());

  if (!valid) {
    await recordLoginFailure(ip);
    // 300ms artificial delay slows online brute-force; the KV rate limit
    // catches anyone persistent.
    await new Promise((r) => setTimeout(r, 300));
    return NextResponse.json(
      {
        error: 'Invalid credentials',
        attemptsRemaining: Math.max(0, LOGIN_RATELIMIT_MAX_FAILS - 1),
      },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  // Successful login — issue a fresh random session id, store it, set cookie.
  const sessionId = await createSession(ip);
  await resetLoginRateLimit(ip);

  const response = NextResponse.json({ ok: true });
  response.headers.set('Cache-Control', 'no-store');
  response.cookies.set(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
  });
  return response;
}

export async function DELETE(request: NextRequest) {
  // Best-effort: revoke the server-side record so the cookie can't be replayed.
  const cookie = request.cookies.get(COOKIE_NAME);
  if (cookie?.value) {
    await revokeSession(cookie.value);
  }
  const response = NextResponse.json({ ok: true });
  response.headers.set('Cache-Control', 'no-store');
  response.cookies.set(COOKIE_NAME, '', {
    maxAge: 0,
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });
  return response;
}
