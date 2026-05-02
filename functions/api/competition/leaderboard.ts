/* GET /api/competition/leaderboard
   Returns global top-50 readers from the user_leaderboard view.
   Also returns the authenticated user's own rank.
   Auth required — uses service client to bypass RLS on the view.
*/
import { getUserFromRequest, json, serviceClient, corsHeaders, Env } from "../../_shared/supabase";

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const user = await getUserFromRequest(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);

  const supabase = serviceClient(env);

  const { data, error } = await supabase
    .from("user_leaderboard")
    .select(
      "user_id, display_name, avatar_url, company_name, team_name, " +
      "total_hadith_read, total_points, virtual_coins, trophies_count, " +
      "current_level, current_streak, rank"
    )
    .order("rank", { ascending: true })
    .limit(50);

  if (error) return json({ error: error.message }, 500);

  const myRow = (data ?? []).find((row: Record<string, unknown>) => row.user_id === user.id);

  return json({
    myRank:      myRow?.rank ?? null,
    myUserId:    user.id,
    leaderboard: data ?? [],
  });
}
