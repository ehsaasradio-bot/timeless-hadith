export const runtime = "edge";
import type { Metadata } from "next";
import ReaderShell from "@/src/components/reader/ReaderShell";
import SearchFilters from "@/src/components/search/SearchFilters";
import SearchResults from "@/src/components/search/SearchResults";
import AISummaryBox from "@/src/components/search/AISummaryBox";
import { searchHadiths } from "@/src/lib/hadith/queries";

export const metadata: Metadata = {
  title: "Search · Timeless Hadith",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q = "", type = "all" } = await searchParams;
  const trimmed = q.trim();
  const items = trimmed ? await searchHadiths(trimmed, 30) : [];

  let filtered = items;
  if (type === "narrator") {
    filtered = items.filter((h) => h.narrator.toLowerCase().includes(trimmed.toLowerCase()));
  } else if (type === "topic") {
    filtered = items.filter((h) => h.chapter.toLowerCase().includes(trimmed.toLowerCase()));
  }

  return (
    <ReaderShell>
      <div className="flex flex-col gap-2">
        <h1 className="reader-display text-2xl sm:text-3xl font-semibold text-[var(--reader-ink)] dark:text-white">
          {trimmed ? `Search results for "${trimmed}"` : "Search"}
        </h1>
        <p className="text-sm text-black/55 dark:text-white/55 mb-3">
          {trimmed ? `${filtered.length} results found` : "Type a query to search hadith, narrators, and topics."}
        </p>
        <SearchFilters />
        {trimmed && <AISummaryBox query={trimmed} items={filtered} />}
        {trimmed && <SearchResults query={trimmed} items={filtered} />}
      </div>
    </ReaderShell>
  );
}
