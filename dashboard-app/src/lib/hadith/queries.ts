import { getSupabase } from "@/src/lib/supabase/server";
import { mapHadith, collectionNamesForSlug } from "./mapHadith";
import type { Hadith, HadithRow } from "./types";

const SELECT =
  "id,book_number,book_name_en,book_name_ar,chapter_en,hadith_number,in_book_ref,narrator,text_ar,text_en,urdu,quick_read";

export async function fetchHadithById(id: string): Promise<Hadith | null> {
  const supabase = getSupabase();
  const numId = Number(id);
  if (!Number.isFinite(numId)) return null;
  const { data, error } = await supabase
    .from("hadiths")
    .select(SELECT)
    .eq("id", numId)
    .maybeSingle();
  if (error || !data) return null;
  return mapHadith(data as unknown as HadithRow);
}

export async function fetchAdjacentHadiths(
  hadith: Hadith,
): Promise<{ prev: Hadith | null; next: Hadith | null; total: number }> {
  const supabase = getSupabase();
  const id = Number(hadith.id);
  const bookNumber = hadith.bookNumber;

  let total = 0;
  if (bookNumber != null) {
    const { count } = await supabase
      .from("hadiths")
      .select("id", { count: "exact", head: true })
      .eq("book_number", bookNumber);
    total = count ?? 0;
  }

  const prevPromise = supabase
    .from("hadiths")
    .select(SELECT)
    .lt("id", id)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPromise = supabase
    .from("hadiths")
    .select(SELECT)
    .gt("id", id)
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  const [prevRes, nextRes] = await Promise.all([prevPromise, nextPromise]);
  return {
    prev: prevRes.data ? mapHadith(prevRes.data as unknown as HadithRow) : null,
    next: nextRes.data ? mapHadith(nextRes.data as unknown as HadithRow) : null,
    total,
  };
}

export async function fetchRelatedByChapter(
  hadith: Hadith,
  limit = 4,
): Promise<Hadith[]> {
  if (!hadith.chapter) return [];
  const supabase = getSupabase();
  const { data } = await supabase
    .from("hadiths")
    .select(SELECT)
    .eq("chapter_en", hadith.chapter)
    .neq("id", Number(hadith.id))
    .limit(limit);
  return (data ?? []).map((r) => mapHadith(r as unknown as HadithRow));
}

export async function searchHadiths(
  query: string,
  limit = 30,
): Promise<Hadith[]> {
  const q = query.trim();
  if (!q) return [];
  const supabase = getSupabase();
  const escaped = q.replace(/[%_]/g, "\\$&");
  const { data } = await supabase
    .from("hadiths")
    .select(SELECT)
    .or(
      `text_en.ilike.%${escaped}%,narrator.ilike.%${escaped}%,chapter_en.ilike.%${escaped}%`,
    )
    .limit(limit);
  return (data ?? []).map((r) => mapHadith(r as unknown as HadithRow));
}

export async function fetchByCollectionAndNumber(
  collectionSlug: string,
  hadithIdOrNumber: string,
): Promise<Hadith | null> {
  // 1. Direct id lookup — wins regardless of collection slug.
  //    Slug is purely cosmetic / SEO; we never reject a valid id match.
  const direct = await fetchHadithById(hadithIdOrNumber);
  if (direct) return direct;

  // 2. If id lookup missed, try (collection, hadith_number).
  const supabase = getSupabase();
  const numHadith = Number(hadithIdOrNumber);
  if (!Number.isFinite(numHadith)) return null;

  const names = collectionNamesForSlug(collectionSlug);
  if (names.length > 0) {
    const { data } = await supabase
      .from("hadiths")
      .select(SELECT)
      .in("book_name_en", names)
      .eq("hadith_number", numHadith)
      .limit(1)
      .maybeSingle();
    if (data) return mapHadith(data as unknown as HadithRow);
  }

  // 3. Last resort — any collection with that hadith_number.
  const { data: any1 } = await supabase
    .from("hadiths")
    .select(SELECT)
    .eq("hadith_number", numHadith)
    .limit(1)
    .maybeSingle();
  if (any1) return mapHadith(any1 as unknown as HadithRow);

  return null;
}
