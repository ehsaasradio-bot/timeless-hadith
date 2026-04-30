/* GET /api/dashboard/summary
   Returns a single payload with everything the dashboard needs:
   profile, stats, recent reads, achievements, collection progress,
   weekly activity (last 7 days).
   Uses service client so views bypass RLS safely server-side.
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

  const [profile, stats, recent, achievements, collectionProgress, weeklyActivity] =
    await Promise.all([
      supabase
        .from("user_profiles")
        .select("display_name, avatar_url, company_name, team_name")
        .eq("id", user.id)
        .maybeSingle()
        .then((r) => r.data),

      supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()
        .then((r) => r.data),

      supabase
        .from("hadith_progress")
        .select("id, hadith_id, collection_name, book_name, chapter_name, hadith_number, read_at, points_earned")
        .eq("user_id", user.id)
        .order("read_at", { ascending: false })
        .limit(10)
        .then((r) => r.data),

      supabase
        .from("user_achievements")
        .select("unlocked_at, achievements(badge_key, badge_name, badge_description, icon)")
        .eq("user_id", user.id)
        .order("unlocked_at", { ascending: false })
        .limit(12)
        .then((r) => r.data),

      supabase
        .from("user_collection_progress")
        .select("collection_name, read_count")
        .eq("user_id", user.id)
        .then((r) => r.data),

      supabase
        .from("user_daily_reading_activity")
        .select("reading_date, hadith_read_count, points_earned")
        .eq("user_id", user.id)
        .order("reading_date", { ascending: false })
        .limit(7)
        .then((r) => r.data),
    ]);

  return json({
    profile: profile ?? {
      display_name: user.email?.split("@")[0] ?? "Reader",
      avatar_url:   null,
      company_name: null,
      team_name:    null,
    },
    stats: stats ?? {
      total_hadith_read: 0,
      total_points:      0,
      virtual_coins:     0,
      trophies_count:    0,
      current_level:     1,
      current_streak:    0,
      longest_streak:    0,
      daily_goal:        20,
    },
    recent:             recent ?? [],
    achievements:       achievements ?? [],
    collectionProgress: collectionProgress ?? [],
    weeklyActivity:     weeklyActivity ?? [],
  });
}
