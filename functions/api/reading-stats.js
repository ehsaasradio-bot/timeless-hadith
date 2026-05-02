/* GET /api/reading-stats — streak, total read, today count */
import { cors, requireAuth, sbFetch, SB_URL, SB_ANON } from './_sb.js';

export async function onRequest({ request }) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' } });

  try {
    const { user_id, token } = await requireAuth(request);

    /* Fetch all read_at dates for the user (just dates, not full rows) */
    const res = await sbFetch(
      `reading_log?user_id=eq.${user_id}&select=read_at&order=read_at.desc`,
      token, { headers: { Prefer: 'return=representation' } }
    );
    const rows = await res.json();

    /* Build set of unique calendar dates (UTC) */
    const dateSet = new Set(rows.map(r => r.read_at.substring(0, 10)));
    const dates   = Array.from(dateSet).sort().reverse(); // newest first

    const today     = new Date().toISOString().substring(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().substring(0, 10);

    /* Streak: consecutive days ending today or yesterday */
    let streak = 0;
    if (dateSet.has(today) || dateSet.has(yesterday)) {
      let cursor = dateSet.has(today) ? new Date(today) : new Date(yesterday);
      while (true) {
        const d = cursor.toISOString().substring(0, 10);
        if (!dateSet.has(d)) break;
        streak++;
        cursor = new Date(cursor.getTime() - 86400000);
      }
    }

    /* Today count */
    const todayCount = rows.filter(r => r.read_at.startsWith(today)).length;

    return cors(200, {
      total:      rows.length,
      streak,
      today:      todayCount,
      activeDays: dates.length,
    });
  } catch (e) {
    return cors(401, { error: e.message });
  }
}
