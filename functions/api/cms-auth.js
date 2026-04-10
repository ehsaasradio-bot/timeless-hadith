/**
 * Timeless Hadith — CMS Authentication Endpoint
 * POST /api/cms-auth  { "password": "..." }
 *
 * Required Cloudflare Pages env variables:
 *   ADMIN_PASSWORD_HASH  — SHA-256 hex of your admin password
 *                          Generate with: echo -n "yourpassword" | sha256sum
 *                          Or use: https://emn178.github.io/online-tools/sha256.html
 *   TH_SESSION_SECRET    — random 32+ char string for signing session tokens
 *
 * Returns:
 *   200 + Set-Cookie: th_sess=<token>  on success
 *   401 on wrong password
 *   405 on wrong method
 */

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function onRequestPost(context) {
  const { request, env } = context;

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const { password } = body || {};
  if (!password || typeof password !== 'string') {
    return jsonResponse({ error: 'Password required' }, 400);
  }

  // Hash the submitted password
  const submittedHash = await sha256(password);

  // Compare against env variable (never hardcoded in source)
  const storedHash = (env.ADMIN_PASSWORD_HASH || '').toLowerCase().trim();

  if (!storedHash) {
    // Misconfigured — env var not set
    return jsonResponse({ error: 'Auth not configured. Set ADMIN_PASSWORD_HASH in Cloudflare Pages.' }, 503);
  }

  if (!timingSafeEqual(submittedHash, storedHash)) {
    // Wrong password — add a delay to slow brute force
    await sleep(500);
    return jsonResponse({ error: 'Invalid password' }, 401);
  }

  // Generate signed session token
  const secret = env.TH_SESSION_SECRET || 'change-me-in-cloudflare-env';
  const exp = Date.now() + SESSION_DURATION_MS;
  const sig = await hmacSha256(secret, String(exp));
  const token = btoa(JSON.stringify({ exp, sig }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const response = jsonResponse({ ok: true }, 200);
  response.headers.set('Set-Cookie',
    `th_sess=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DURATION_MS / 1000}`
  );
  return response;
}

export async function onRequestGet() {
  return jsonResponse({ error: 'Use POST' }, 405);
}

// ── Helpers ──────────────────────────────────────────────

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
