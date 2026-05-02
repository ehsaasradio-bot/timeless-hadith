// lib/admin-auth.ts
// Admin sessions, hardened.
//
// PREVIOUS DESIGN (deprecated):
//   Token was a deterministic HMAC-SHA256 of ADMIN_SECRET. One leaked cookie
//   = permanent access until the secret was rotated. No revocation.
//
// CURRENT DESIGN:
//   Each successful login mints a fresh 256-bit random session ID. The session
//   ID is the cookie value; KV stores the matching record { issuedAt, ip,
//   expiresAt }. Verifying a request looks up the cookie's session ID in KV;
//   if absent (expired or revoked) the request is unauthorised. Logout deletes
//   the KV record so the cookie can't be replayed.
//
// SECURITY PROPERTIES:
//   - Session IDs are unique, unpredictable, server-issued — no relation to
//     ADMIN_SECRET, so a stolen cookie can be revoked individually.
//   - KV TTL enforces expiry server-side; reducing cookie maxAge alone won't
//     cut it because a stolen cookie can be replayed before the browser drops
//     it.
//   - Logout is real — the KV row is deleted, so even if the cookie persists
//     in a browser cache, it won't authenticate.
//   - Login still uses constant-time HMAC comparison for the password check.
//   - Reads ADMIN_SECRET inside functions (not at module scope) for edge safety.

import { NextRequest } from 'next/server';
import { getKV } from '@/lib/kv';

export const COOKIE_NAME = 'th_admin_session';

export const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours
const SESSION_PREFIX = 'session:';

// ─── Crypto helpers ─────────────────────────────────────────────────────────

/** Generate a 256-bit random session id, hex-encoded (64 chars). */
export function generateSessionId(): string {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Constant-time comparison of two strings. */
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  if (a.length !== b.length) return false;
  const enc = new TextEncoder();
  const aKey = await crypto.subtle.importKey('raw', enc.encode(a), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bKey = await crypto.subtle.importKey('raw', enc.encode(b), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const msg = enc.encode('th-compare');
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

/** Verify the supplied password against ADMIN_SECRET in constant time. */
export async function verifyPassword(input: string): Promise<boolean> {
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  if (!ADMIN_SECRET) {
    console.error('[admin-auth] ADMIN_SECRET is not set');
    return false;
  }
  return timingSafeEqual(input, ADMIN_SECRET);
}

// ─── Session lifecycle ──────────────────────────────────────────────────────

interface SessionRecord {
  issuedAt: number;       // ms epoch
  expiresAt: number;      // ms epoch
  ip: string;             // creator IP, for audit only
}

/** Create a new session and store it in KV. Returns the new session id. */
export async function createSession(ip: string): Promise<string> {
  const id = generateSessionId();
  const now = Date.now();
  const record: SessionRecord = {
    issuedAt: now,
    expiresAt: now + SESSION_TTL_SECONDS * 1000,
    ip,
  };
  await getKV().put(SESSION_PREFIX + id, JSON.stringify(record), {
    expirationTtl: SESSION_TTL_SECONDS,
  });
  return id;
}

/** Returns the session record if the cookie carries a valid, unexpired id. */
export async function getSession(request: NextRequest): Promise<SessionRecord | null> {
  const cookie = request.cookies.get(COOKIE_NAME);
  if (!cookie?.value) return null;

  // Sanity-check the cookie shape before hitting KV.
  if (!/^[a-f0-9]{64}$/.test(cookie.value)) return null;

  const raw = await getKV().get(SESSION_PREFIX + cookie.value);
  if (!raw) return null;

  try {
    const rec = JSON.parse(raw) as SessionRecord;
    if (rec.expiresAt < Date.now()) {
      // Lazy clean-up; KV TTL will purge eventually.
      await getKV().delete(SESSION_PREFIX + cookie.value);
      return null;
    }
    return rec;
  } catch {
    return null;
  }
}

/** Revoke a session (logout). Safe to call with an unknown id. */
export async function revokeSession(sessionId: string | undefined): Promise<void> {
  if (!sessionId) return;
  if (!/^[a-f0-9]{64}$/.test(sessionId)) return;
  await getKV().delete(SESSION_PREFIX + sessionId);
}

/** Returns true if the request carries a valid admin session cookie. */
export async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const session = await getSession(request);
  return session !== null;
}

/** Returns a 401 Response if unauthorised, null if authorised. */
export async function requireAdmin(request: NextRequest): Promise<Response | null> {
  if (await isAdminAuthenticated(request)) return null;
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'WWW-Authenticate': 'Cookie realm="admin"',
    },
  });
}

// ─── IP-based rate limit on login ──────────────────────────────────────────

const LOGIN_RATELIMIT_PREFIX = 'rl:login:';
export const LOGIN_RATELIMIT_WINDOW_SECONDS = 15 * 60; // 15 minutes
export const LOGIN_RATELIMIT_MAX_FAILS = 5;

interface RateLimitRecord {
  fails: number;
  firstAt: number;
}

/**
 * Returns true if this IP has too many recent failed logins.
 * Reset the counter manually with resetLoginRateLimit() after a successful
 * login (we let it decay naturally otherwise).
 */
export async function isLoginRateLimited(ip: string): Promise<boolean> {
  const raw = await getKV().get(LOGIN_RATELIMIT_PREFIX + ip);
  if (!raw) return false;
  try {
    const rec = JSON.parse(raw) as RateLimitRecord;
    return rec.fails >= LOGIN_RATELIMIT_MAX_FAILS;
  } catch {
    return false;
  }
}

/** Increment the failure counter. */
export async function recordLoginFailure(ip: string): Promise<void> {
  const key = LOGIN_RATELIMIT_PREFIX + ip;
  const raw = await getKV().get(key);
  const now = Date.now();
  let rec: RateLimitRecord = { fails: 1, firstAt: now };
  if (raw) {
    try {
      const existing = JSON.parse(raw) as RateLimitRecord;
      rec = { fails: existing.fails + 1, firstAt: existing.firstAt };
    } catch {
      // ignore parse error and start fresh
    }
  }
  await getKV().put(key, JSON.stringify(rec), {
    expirationTtl: LOGIN_RATELIMIT_WINDOW_SECONDS,
  });
}

/** Clear the failure counter (call after a successful login). */
export async function resetLoginRateLimit(ip: string): Promise<void> {
  await getKV().delete(LOGIN_RATELIMIT_PREFIX + ip);
}

// ─── Helpers ─────────────────────────────────────────────────────────────

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}
