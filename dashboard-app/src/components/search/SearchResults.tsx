import Link from "next/link";
import type { Hadith } from "@/src/lib/hadith/types";

export default function SearchResults({ query, items }: { query: string; items: Hadith[] }) {
  if (!items.length) {
    return (
      <div className="reader-card p-8 text-center">
        <p className="text-black/55 dark:text-white/55">
          No results found for &ldquo;{query}&rdquo;.
        </p>
        <p className="text-xs text-black/45 mt-1">
          Try a different keyword or check your spelling.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map((h) => (
        <li key={h.id} className="reader-card p-5 sm:p-6">
          <header className="flex items-center justify-between mb-3 text-xs">
            <span className="reader-pill rounded-md px-2 py-1 font-medium">
              {h.collection} {h.hadithNumber}
            </span>
            {h.chapter && <span className="text-black/45">{h.chapter}</span>}
          </header>
          {h.arabic && (
            <p dir="rtl" lang="ar" className="reader-arabic text-lg text-black/85 dark:text-white/90 mb-3 line-clamp-2">
              {h.arabic}
            </p>
          )}
          <p className="text-sm text-black/70 dark:text-white/80 line-clamp-3">
            &ldquo;{h.english}&rdquo;
          </p>
          <footer className="mt-3 flex items-center gap-3">
            <Link href={`/read/${h.collectionSlug}/${h.id}`}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--reader-green)] hover:underline">
              Open in Reader
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
            </Link>
            <Link href={`/focus/hadith/${h.id}`}
              className="inline-flex items-center gap-1.5 text-xs text-black/55 hover:text-[var(--reader-green)]">
              Focus mode
            </Link>
          </footer>
        </li>
      ))}
    </ul>
  );
}
