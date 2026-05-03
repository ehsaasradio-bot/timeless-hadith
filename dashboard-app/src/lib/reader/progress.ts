"use server";

import { getSupabase } from "@/src/lib/supabase/server";
import { getCurrentUserId } from "./auth";
import type { Hadith } from "@/src/lib/hadith/types";

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export async function recordRead(
  hadith: Hadith,
  totalInCollection: number,
  status: ProgressStatus = "in_progress",
): Promise<{ ok: boolean; reason?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, reason: "not_authenticated" };

  const supabase = getSupabase();
  const num = Number(hadith.hadithNumber) || 0;
  const pct =
    totalInCollection > 0
      ? Math.min(100, Math.max(0, Math.round((num / totalInCollection) * 100)))
      : 0;

  const { error } = await supabase
    .from("reading_progress")
    .upsert(
      {
        user_id: userId,
        collection: hadith.collection,
        hadith_id: hadith.id,
        hadith_number: num,
        status,
        progress_pct: pct,
        last_read_at: new Date().toISOString(),
      },
      { onConflict: "user_id,collection" },
    );
  return { ok: !error, reason: error?.message };
}

export async function markAsCompleted(
  hadith: Hadith,
  totalInCollection: number,
) {
  return recordRead(hadith, totalInCollection, "completed");
}
