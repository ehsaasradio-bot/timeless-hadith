// lib/admin-auth.ts
// Stateless admin session using HMAC-SHA256.
//
// How it works (stateless, edge-compatible):
//   Login:  token = HMAC-SHA256(ADMIN_SECRET, "th-admin-session-v1")  → stored in httpOnly cookie
//   Verify: re-derive token from env var, compare with cookie (constant-time)
//
// This means:
//   - Cookie never contains the raw secret
//   - No server-side session store needed
//   - Changing ADMIN_SECRET instantly invalidates all existing sessions
//   - Reads ADMIN_SECRET inside functions (not at module level) for edge runtime safety

import { NextRequest } from 'next/server';

export const COOKIE_NAME = 'th_admin_session';
const SESSION_MSG = 'th-admin-session-v1';

/** Derive the expected session token from the secret (deterministic, no randomness). */
export async function deriveSessionToken(secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(SESSION_MSG));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Constant-time comparison — prevents timing-based secret leaks. */
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  if (a.length !== b.length) return false;
  const enc = new TextEncoder();
  const aKey = await crypto.subtle.importKey('raw', enc.encode(a), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bKey = await crypto.subtle.importKey('raw', enc.encode(b), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const msg = enc.encode('timeless-compare');
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

/** Returns true if the request carries a valid admin session cookie. */
export async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const ADMIN_SECRET = process.env.ADMIN_SECRET;  // read inside function — safe for edge
  if (!ADMIN_SECRET) {
    console.error('[admin-auth] ADMIN_SECRET is not set');
    return false;
  }

  const cookie = request.cookies.get(COOKIE_NAME);
  if (!cookie?.value) return false;

  const expected = await deriveSessionToken(ADMIN_SECRET);
  return timingSafeEqual(cookie.value, expected);
}

/** Returns a 401 Response if unauthorized, null if authorized. Must be awaited. */
export async function requireAdmin(request: NextRequest): Promise<Response | null> {
  const ok = await isAdminAuthenticated(request);
  if (!ok) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}
