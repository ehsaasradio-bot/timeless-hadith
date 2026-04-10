/**
 * Timeless Hadith — Cloudflare Pages Edge Middleware
 * Blocks /cms.html, /admin.html, /admin-backup.html for unauthenticated users.
 *
 * Required Cloudflare Pages env variable:
 *   TH_SESSION_SECRET  — a random 32-char string you set in Pages → Settings → Environment Variables
 *
 * How auth works:
 *   1. POST /api/cms-auth with { password } → validates against env ADMIN_PASSWORD_HASH
 *   2. On success, sets an HttpOnly session cookie (th_sess)
 *   3. This middleware checks that cookie on every request to admin paths
 *   4. GET /api/cms-logout → clears the cookie
 */

const ADMIN_PATHS = ['/cms.html', '/admin.html', '/admin-backup.html'];

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // Only intercept admin paths
  if (!ADMIN_PATHS.includes(url.pathname)) {
    return next();
  }

  // Read the session cookie
  const cookieHeader = request.headers.get('Cookie') || '';
  const sessionMatch = cookieHeader.match(/\bth_sess=([^;]+)/);
  const sessionToken = sessionMatch ? sessionMatch[1] : null;

  if (!sessionToken) {
    return redirectToLogin(url);
  }

  // Validate the session token
  const secret = env.TH_SESSION_SECRET || 'change-me-in-cloudflare-env';
  const valid = await verifyToken(sessionToken, secret);

  if (!valid) {
    return redirectToLogin(url);
  }

  // Authenticated — allow through
  return next();
}

function redirectToLogin(url) {
  const loginUrl = '/cms-login.html?redirect=' + encodeURIComponent(url.pathname);
  return new Response(null, {
    status: 302,
    headers: { 'Location': loginUrl },
  });
}

/**
 * Verify a session token: base64url(json) where json = { exp, sig }
 * sig = HMAC-SHA256(secret, exp_string)
 */
async function verifyToken(token, secret) {
  try {
    const decoded = JSON.parse(atob(token.replace(/-/g,'+').replace(/_/g,'/')));
    if (!decoded.exp || !decoded.sig) return false;
    if (Date.now() > decoded.exp) return false; // expired

    const expectedSig = await hmacSha256(secret, String(decoded.exp));
    return timingSafeEqual(decoded.sig, expectedSig);
  } catch {
    return false;
  }
}

async function hmacSha256(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,'0')).join('');
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
