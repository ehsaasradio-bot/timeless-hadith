"use server";

import { getSupabase } from "@/src/lib/supabase/server";
import { getCurrentUserId } from "./auth";
import type { Hadith } from "@/src/lib/hadith/types";

export async function isBookmarked(hadithId: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;
  const supabase = getSupabase();
  const { count } = await supabase
    .from("dashboard_bookmarks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("hadith_id", hadithId);
  return (count ?? 0) > 0;
}

export async function toggleBookmark(
  hadith: Hadith,
): Promise<{ ok: boolean; bookmarked?: boolean; reason?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, reason: "not_authenticated" };
  const supabase = getSupabase();
  const existing = await supabase
    .from("dashboard_bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("hadith_id", hadith.id)
    .maybeSingle();
  if (existing.data) {
    const { error } = await supabase
      .from("dashboard_bookmarks")
      .delete()
      .eq("id", existing.data.id);
    return { ok: !error, bookmarked: false, reason: error?.message };
  }
  const { error } = await supabase.from("dashboard_bookmarks").insert({
    user_id: userId,
    hadith_id: hadith.id,
    collection: hadith.collection,
    topic: hadith.chapter,
  });
  return { ok: !error, bookmarked: true, reason: error?.message };
}
