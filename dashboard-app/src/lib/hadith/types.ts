export type HadithRow = {
  id: number;
  book_number: number | null;
  book_name_en: string | null;
  book_name_ar: string | null;
  chapter_en: string | null;
  hadith_number: number | null;
  in_book_ref: string | null;
  narrator: string | null;
  text_ar: string | null;
  text_en: string | null;
  urdu: string | null;
  quick_read: string | null;
};

export type Hadith = {
  id: string;
  bookNumber: number | null;
  collection: string;
  collectionAr: string;
  collectionSlug: string;
  chapter: string;
  hadithNumber: string;
  narrator: string;
  arabic: string;
  english: string;
  urdu: string;
  summary: string;
  grade: string;
};

export type HadithSummary = Pick<
  Hadith,
  "id" | "collection" | "collectionSlug" | "chapter" | "hadithNumber" | "english" | "narrator"
>;
