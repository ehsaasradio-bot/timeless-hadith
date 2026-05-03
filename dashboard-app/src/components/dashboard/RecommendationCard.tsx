import { card } from "@/src/lib/design/tokens";
import type { RecommendedHadith } from "@/src/lib/dashboard/mock-data";

export default function RecommendationCard({
  rec,
}: {
  rec: RecommendedHadith;
}) {
  return (
    <article
      className={[card.default, "flex flex-col gap-4 hover:-translate-y-0.5 transition-transform"].join(" ")}
      aria-label={`Recommended: ${rec.collection} ${rec.hadithNumber}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#3a5ce0] dark:text-[#a0baff]">
            {rec.collection}
          </p>
          <p className="mt-0.5 text-xs text-black/55 dark:text-white/55">
            Hadith {rec.hadithNumber} · {rec.topic}
          </p>
        </div>
        <span
          aria-label={`Match score ${rec.score}`}
          className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#eef2ff] dark:bg-[#3a5ce0]/30 text-[#3a5ce0] dark:text-[#a0baff] text-[11px] font-medium px-2.5 py-1"
        >
          <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" aria-hidden="true">
            <path d="M12 2l2.6 6.5H22l-5.4 4 2 6.5L12 15l-6.6 4 2-6.5L2 8.5h7.4z" />
          </svg>
          {rec.score}% match
        </span>
      </header>

      <div>
        <p
          dir="rtl"
          lang="ar"
          className="text-base leading-relaxed text-ink font-medium line-clamp-2"
        >
          {rec.arabic}
        </p>
        <p className="mt-2 text-sm text-black/70 dark:text-white/70 line-clamp-3">
          “{rec.english}”
        </p>
      </div>

      <p className="text-[11px] text-black/50 dark:text-white/50 italic-off">
        {rec.reason}
      </p>

      <footer className="mt-auto flex items-center gap-2">
        <button
          type="button"
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#3a5ce0] hover:bg-[#3a5ce0] text-white text-xs font-medium py-2 transition-colors"
        >
          Read Hadith
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Save"
          className="grid h-9 w-9 place-items-center rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-black/60 dark:text-white/60 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4h12v16l-6-4-6 4z" />
          </svg>
        </button>
      </footer>
    </article>
  );
}
