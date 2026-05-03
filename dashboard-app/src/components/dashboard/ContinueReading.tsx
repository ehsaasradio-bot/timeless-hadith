import { card } from "@/src/lib/design/tokens";
import { continueReading } from "@/src/lib/dashboard/mock-data";

export default function ContinueReading() {
  const c = continueReading;

  return (
    <section className={card.default} aria-label="Continue reading">
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-ink">
          Continue Reading
        </h2>
        <button
          type="button"
          className="text-xs text-[#3a5ce0] dark:text-[#a0baff] hover:underline"
        >
          View All
        </button>
      </header>

      <div className="mt-4 flex items-start gap-4">
        <div
          aria-hidden="true"
          className="shrink-0 h-[88px] w-[68px] rounded-xl grid place-items-center text-white text-[22px] font-serif"
          style={{
            background:
              "linear-gradient(135deg, #3a5ce0 0%, #3a5ce0 60%, #3a5ce0 100%)",
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.25)",
          }}
        >
          ﷽
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium text-ink truncate">
            {c.collection}
          </p>
          <p className="mt-0.5 text-xs text-black/55 dark:text-white/55 truncate">
            {c.bookName}
          </p>
          <p className="mt-1.5 text-xs text-black/70 dark:text-white/70">
            Hadith {c.hadithNumber}
          </p>
          <p
            dir="rtl"
            lang="ar"
            className="mt-2 text-[13px] leading-relaxed text-black/75 dark:text-white/75 line-clamp-1"
          >
            {c.arabicSnippet}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-black/55 dark:text-white/55">
          <span>{c.progressPct}% Completed</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#4f72f8] to-[#7c5ce6]"
            style={{ width: `${c.progressPct}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#3a5ce0] hover:bg-[#3a5ce0] text-white text-sm font-medium py-2.5 transition-colors"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
          Continue Reading
        </button>
        <button
          type="button"
          aria-label="Bookmark"
          className="grid h-10 w-10 place-items-center rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-black/60 dark:text-white/60 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4h12v16l-6-4-6 4z" />
          </svg>
        </button>
      </div>
    </section>
  );
}
