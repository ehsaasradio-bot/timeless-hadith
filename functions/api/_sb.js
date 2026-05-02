/* Shared Supabase helper for Pages Functions */
export const SB_URL  = 'https://dwcsledifvnyrunxejzd.supabase.co';
export const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Y3NsZWRpZnZueXJ1bnhlanpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTgwNzgsImV4cCI6MjA5MDUzNDA3OH0.Aww8QcExJF1tPwMPvqP5q0_avc3YJclqsFJcXptlnZo';

export const CORS = {
  'Access-Control-Allow-Origin': 'https://timelesshadith.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function cors(status, body, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS, ...extra },
  });
}

/* Extract and verify user JWT — returns { user_id } or throws */
export async function requireAuth(request) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) throw new Error('Unauthorised');

  const res = await fetch(`${SB_URL}/auth/v1/user`, {
    headers: { apikey: SB_ANON, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Unauthorised');
  const user = await res.json();
  return { user_id: user.id, email: user.email, token };
}

/* Supabase REST call with user JWT */
export function sbFetch(path, token, opts = {}) {
  return fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SB_ANON,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
      ...(opts.headers || {}),
    },
  });
}
