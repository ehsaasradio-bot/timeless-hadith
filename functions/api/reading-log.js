/* POST /api/reading-log  — log a hadith read
   GET  /api/reading-log  — fetch last 50 reads for current user */
import { cors, requireAuth, sbFetch } from './_sb.js';

export async function onRequest({ request }) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' } });

  try {
    const { user_id, token } = await requireAuth(request);

    if (request.method === 'POST') {
      const { hadith_id } = await request.json();
      if (!hadith_id) return cors(400, { error: 'hadith_id required' });

      const res = await sbFetch('reading_log', token, {
        method: 'POST',
        body: JSON.stringify({ user_id, hadith_id }),
      });
      return cors(res.ok ? 201 : 500, { ok: res.ok });
    }

    if (request.method === 'GET') {
      const res = await sbFetch(
        `reading_log?user_id=eq.${user_id}&order=read_at.desc&limit=50&select=id,hadith_id,read_at`,
        token, { headers: { Prefer: 'return=representation' } }
      );
      const data = await res.json();
      return cors(200, data);
    }

    return cors(405, { error: 'Method not allowed' });
  } catch (e) {
    return cors(401, { error: e.message });
  }
}
