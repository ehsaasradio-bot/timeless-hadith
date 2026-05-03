import type { Hadith, HadithRow } from "./types";

export function slugifyCollection(name: string): string {
  return name
    .toLowerCase()
    .replace(/sahih\s+/g, "")
    .replace(/al-?/g, "")
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 40);
}

export function inferGrade(collection: string): string {
  const c = collection.toLowerCase();
  if (c.includes("bukhari") || c.includes("muslim")) return "Sahih";
  if (c.includes("tirmidhi")) return "Hasan";
  if (c.includes("abu dawud") || c.includes("abi dawud")) return "Hasan";
  if (c.includes("nasai") || c.includes("ibn majah")) return "Hasan";
  return "Authentic";
}

export function mapHadith(row: HadithRow): Hadith {
  const collection = row.book_name_en || "Sahih al-Bukhari";
  const number =
    row.hadith_number != null ? String(row.hadith_number) : row.in_book_ref || "";
  return {
    id: String(row.id),
    bookNumber: row.book_number,
    collection,
    collectionAr: row.book_name_ar || "",
    collectionSlug: slugifyCollection(collection),
    chapter: row.chapter_en || "",
    hadithNumber: number,
    narrator: row.narrator || "",
    arabic: row.text_ar || "",
    english: row.text_en || "",
    urdu: row.urdu || "",
    summary: row.quick_read || "",
    grade: inferGrade(collection),
  };
}

const COLLECTION_BY_SLUG: Record<string, string[]> = {
  bukhari: ["Sahih al-Bukhari"],
  muslim: ["Sahih Muslim"],
  abudawud: ["Sunan Abi Dawud", "Sunan Abu Dawud"],
  tirmidhi: ["Jami` at-Tirmidhi", "Jami at-Tirmidhi"],
  nasai: ["Sunan an-Nasa'i", "Sunan an-Nasai"],
  ibnmajah: ["Sunan Ibn Majah"],
};

export function collectionNamesForSlug(slug: string): string[] {
  const key = slug.toLowerCase().replace(/-/g, "");
  return COLLECTION_BY_SLUG[key] || [];
}
