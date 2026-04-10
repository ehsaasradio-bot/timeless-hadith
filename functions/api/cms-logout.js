/**
 * Timeless Hadith — CMS Logout Endpoint
 * POST /api/cms-logout
 * Clears the th_sess session cookie.
 */

export async function onRequestPost() {
  const response = new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  // Expire the cookie immediately
  response.headers.set('Set-Cookie',
    'th_sess=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  );
  return response;
}

export async function onRequestGet() {
  return new Response(JSON.stringify({ error: 'Use POST' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}
