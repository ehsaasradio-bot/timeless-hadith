/* GET /api/competition/company-leaderboard
   Returns the top-50 companies ranked by total points and hadiths read.
   Uses service client to bypass RLS on the company_leaderboard view.
   Auth required.
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

  // Fetch company leaderboard + the user's own company in parallel
  const [leaderboardResult, profileResult] = await Promise.all([
    supabase
      .from("company_leaderboard")
      .select("company_name, total_users, total_hadith_read, total_points, virtual_coins, trophies_count, rank")
      .order("rank", { ascending: true })
      .limit(50),

    supabase
      .from("user_profiles")
      .select("company_name")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  if (leaderboardResult.error) {
    return json({ error: leaderboardResult.error.message }, 500);
  }

  const myCompany = profileResult.data?.company_name ?? null;
  const myCompanyRow = myCompany
    ? (leaderboardResult.data ?? []).find(
        (row: Record<string, unknown>) => row.company_name === myCompany
      )
    : null;

  return json({
    myCompany,
    myCompanyRank: myCompanyRow?.rank ?? null,
    companyLeaderboard: leaderboardResult.data ?? [],
  });
}
