/* POST /api/progress/mark-read
   Marks a Hadith as read for the authenticated user.
   Calls the mark_hadith_as_read RPC which handles:
   - Duplicate prevention (unique constraint)
   - Points and coins award
   - Level calculation
   - Achievement unlocking
*/
import { getUserFromRequest, json, serviceClient, corsHeaders, Env } from "../../_shared/supabase";

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const user = await getUserFromRequest(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!body.hadith_id || typeof body.hadith_id !== "string") {
    return json({ error: "hadith_id is required and must be a string" }, 400);
  }

  const supabase = serviceClient(env);

  const { data, error } = await supabase.rpc("mark_hadith_as_read", {
    p_user_id:         user.id,
    p_hadith_id:       body.hadith_id,
    p_collection_name: (body.collection_name as string) ?? null,
    p_book_name:       (body.book_name as string) ?? null,
    p_chapter_name:    (body.chapter_name as string) ?? null,
    p_hadith_number:   (body.hadith_number as string) ?? null,
  });

  if (error) return json({ error: error.message }, 500);

  return json(data);
}
