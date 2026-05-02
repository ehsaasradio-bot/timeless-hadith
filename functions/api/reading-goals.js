/* GET /api/reading-goals  — fetch user's daily target
   POST /api/reading-goals — set daily target { daily_target: number } */
import { cors, requireAuth, sbFetch } from './_sb.js';

export async function onRequest({ request }) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' } });

  try {
    const { user_id, token } = await requireAuth(request);

    if (request.method === 'GET') {
      const res = await sbFetch(
        `reading_goals?user_id=eq.${user_id}&select=daily_target`,
        token, { headers: { Prefer: 'return=representation' } }
      );
      const rows = await res.json();
      return cors(200, { daily_target: rows[0]?.daily_target ?? 5 });
    }

    if (request.method === 'POST') {
      const { daily_target } = await request.json();
      const target = parseInt(daily_target, 10);
      if (!target || target < 1 || target > 100) return cors(400, { error: 'daily_target must be 1–100' });

      /* Upsert */
      const res = await sbFetch('reading_goals', token, {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ user_id, daily_target: target }),
      });
      return cors(res.ok ? 200 : 500, { ok: res.ok });
    }

    return cors(405, { error: 'Method not allowed' });
  } catch (e) {
    return cors(401, { error: e.message });
  }
}
