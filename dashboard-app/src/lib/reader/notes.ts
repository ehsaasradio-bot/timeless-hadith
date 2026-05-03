"use server";

import { getSupabase } from "@/src/lib/supabase/server";
import { getCurrentUserId } from "./auth";
import type { Hadith } from "@/src/lib/hadith/types";

export type Note = {
  id: string;
  body: string;
  updatedAt: string;
};

export async function listNotes(hadithId: string): Promise<Note[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  const supabase = getSupabase();
  const { data } = await supabase
    .from("dashboard_notes")
    .select("id,body,updated_at")
    .eq("user_id", userId)
    .eq("hadith_id", hadithId)
    .order("updated_at", { ascending: false });
  return (data ?? []).map((n) => ({
    id: String(n.id),
    body: n.body || "",
    updatedAt: n.updated_at || "",
  }));
}

export async function saveNote(
  hadith: Hadith,
  body: string,
): Promise<{ ok: boolean; reason?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, reason: "not_authenticated" };
  const supabase = getSupabase();
  const { error } = await supabase.from("dashboard_notes").insert({
    user_id: userId,
    hadith_id: hadith.id,
    collection: hadith.collection,
    body: body.slice(0, 4000),
  });
  return { ok: !error, reason: error?.message };
}
