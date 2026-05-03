import Link from "next/link";
import type { Hadith } from "@/src/lib/hadith/types";

export default function RelatedHadiths({ items }: { items: Hadith[] }) {
  if (!items.length) return null;
  return (
    <aside className="reader-card p-5 no-print">
      <h2 className="text-base font-semibold text-[var(--reader-ink)] dark:text-white mb-3">
        Related Hadiths
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map((h) => (
          <li key={h.id}>
            <Link
              href={`/read/${h.collectionSlug}/${h.id}`}
              className="flex items-start gap-3 rounded-lg p-2 -mx-2 hover:bg-[var(--reader-green-faint)] transition-colors"
            >
              <span className="shrink-0 reader-pill rounded-md text-xs px-2 py-1 mt-0.5 tabular-nums">
                {h.hadithNumber || "?"}
              </span>
              <span className="text-sm text-black/75 dark:text-white/85 line-clamp-2">
                {h.english || h.chapter || "View hadith"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
