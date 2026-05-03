import Link from "next/link";
import type { Hadith } from "@/src/lib/hadith/types";

export default function TopicResults({ items }: { items: Hadith[] }) {
  if (!items.length) {
    return (
      <div className="reader-card p-8 text-center">
        <p className="text-black/55 dark:text-white/55">
          No results yet for this topic. Try our search to explore related hadith.
        </p>
        <Link href="/search" className="mt-3 inline-block text-sm text-[var(--reader-green)] hover:underline">
          Open search
        </Link>
      </div>
    );
  }

  return (
    <section className="reader-card p-5 sm:p-6">
      <header className="flex items-baseline justify-between mb-4">
        <h2 className="text-base font-semibold text-[var(--reader-ink)] dark:text-white">Hadiths</h2>
        <span className="text-xs text-black/45 dark:text-white/45">{items.length} shown</span>
      </header>
      <ul className="flex flex-col divide-y divide-black/[0.06] dark:divide-white/[0.06]">
        {items.map((h) => (
          <li key={h.id} className="py-4 first:pt-0 last:pb-0">
            <p className="text-xs text-[var(--reader-green)] font-medium">
              {h.collection} {h.hadithNumber}
            </p>
            {h.arabic && (
              <p dir="rtl" lang="ar" className="reader-arabic text-base text-black/80 dark:text-white/85 mt-1 line-clamp-2">
                {h.arabic}
              </p>
            )}
            <p className="text-sm text-black/65 dark:text-white/70 mt-1 line-clamp-2">
              &ldquo;{h.english}&rdquo;
            </p>
            <div className="mt-2">
              <Link href={`/read/${h.collectionSlug}/${h.id}`}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--reader-green)] hover:underline">
                Open in Reader
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
