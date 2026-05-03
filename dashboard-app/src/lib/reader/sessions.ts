"use server";

import { getSupabase } from "@/src/lib/supabase/server";
import { getCurrentUserId } from "./auth";
import type { Hadith } from "@/src/lib/hadith/types";

export async function recordSession(
  hadith: Hadith,
  durationSeconds: number,
  hadithCount = 1,
): Promise<{ ok: boolean; reason?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, reason: "not_authenticated" };
  const supabase = getSupabase();
  const now = new Date();
  const startedAt = new Date(now.getTime() - durationSeconds * 1000).toISOString();
  const { error } = await supabase.from("reading_sessions").insert({
    user_id: userId,
    collection: hadith.collection,
    hadith_id: hadith.id,
    started_at: startedAt,
    ended_at: now.toISOString(),
    duration_seconds: Math.max(0, Math.floor(durationSeconds)),
    hadith_count: Math.max(0, Math.floor(hadithCount)),
  });
  return { ok: !error, reason: error?.message };
}
