/* GET /api/admin-stats — site-wide analytics (admin only)
   Requires SUPABASE_SERVICE_ROLE_KEY env var in Cloudflare Pages */
import { cors, requireAuth, SB_URL, SB_ANON } from './_sb.js';

const ADMIN_EMAIL = 'ehsaasradio@gmail.com';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' } });

  try {
    const { email } = await requireAuth(request);
    if (email !== ADMIN_EMAIL) return cors(403, { error: 'Forbidden' });

    const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!SERVICE) return cors(500, { error: 'Service key not configured' });

    const hdrs = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, Prefer: 'return=representation' };
    const base = `${SB_URL}/rest/v1`;

    const [totalReads, topHadiths, activeUsers, dailyReads] = await Promise.all([
      /* total reads */
      fetch(`${base}/reading_log?select=id`, { headers: { ...hdrs, Prefer: 'count=exact' } })
        .then(r => parseInt(r.headers.get('Content-Range')?.split('/')[1] || '0', 10)),

      /* top 10 most-read hadiths */
      fetch(`${base}/reading_log?select=hadith_id&order=hadith_id.asc&limit=500`, { headers: hdrs })
        .then(r => r.json())
        .then(rows => {
          const counts = {};
          rows.forEach(r => { counts[r.hadith_id] = (counts[r.hadith_id] || 0) + 1; });
          return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10)
            .map(([id, count]) => ({ hadith_id: id, count }));
        }),

      /* unique active users (last 30 days) */
      fetch(`${base}/reading_log?select=user_id&read_at=gte.${new Date(Date.now() - 30 * 86400000).toISOString()}`, { headers: { ...hdrs, Prefer: 'count=exact' } })
        .then(r => parseInt(r.headers.get('Content-Range')?.split('/')[1] || '0', 10)),

      /* reads per day (last 7 days) */
      fetch(`${base}/reading_log?select=read_at&read_at=gte.${new Date(Date.now() - 7 * 86400000).toISOString()}&order=read_at.asc`, { headers: hdrs })
        .then(r => r.json())
        .then(rows => {
          const by_day = {};
          rows.forEach(r => {
            const d = r.read_at.substring(0, 10);
            by_day[d] = (by_day[d] || 0) + 1;
          });
          return Object.entries(by_day).map(([date, count]) => ({ date, count }));
        }),
    ]);

    return cors(200, { totalReads, topHadiths, activeUsers, dailyReads });
  } catch (e) {
    return cors(e.message === 'Forbidden' ? 403 : 401, { error: e.message });
  }
}
