import type { Hadith, HadithRow } from "./types";

// User's DB currently holds Sahih al-Bukhari only.
// `book_name_en` is the book / chapter within Bukhari (e.g. "Revelation"),
// not the collection name. Default the collection accordingly.
const DEFAULT_COLLECTION = "Sahih al-Bukhari";
const DEFAULT_COLLECTION_AR = "صحيح البخاري";

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
  // Collection: hardcoded to Bukhari for the current dataset.
  const collection = DEFAULT_COLLECTION;
  const collectionAr = DEFAULT_COLLECTION_AR;
  // Chapter / book within the collection — that's what book_name_en stores.
  const chapter = row.book_name_en || row.chapter_en || "";
  const number =
    row.hadith_number != null
      ? String(row.hadith_number)
      : row.in_book_ref || "";
  return {
    id: String(row.id),
    bookNumber: row.book_number,
    collection,
    collectionAr,
    collectionSlug: slugifyCollection(collection),
    chapter,
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
