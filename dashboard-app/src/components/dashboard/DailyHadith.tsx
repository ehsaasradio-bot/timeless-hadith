import { dailyHadith } from "@/src/lib/dashboard/mock-data";

export default function DailyHadith() {
  const h = dailyHadith;

  return (
    <section
      aria-label="Daily hadith"
      className={[
        "rounded-2xl p-5 sm:p-6",
        "bg-gradient-to-br from-[#f0faf3] via-white to-[#f0faf3]",
        "dark:from-[#1f5132]/20 dark:via-[#0f1318] dark:to-[#1f5132]/10",
        "border border-[#bce5c8]/50 dark:border-[#1f5132]/40",
        "shadow-[0_1px_2px_rgba(15,19,24,0.04),0_8px_24px_-12px_rgba(58,158,94,0.18)]",
      ].join(" ")}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            aria-hidden="true"
            className="grid h-9 w-9 place-items-center rounded-full bg-white dark:bg-white/10 text-[#1f5132] dark:text-[#bce5c8]"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-[#1f5132] dark:text-[#bce5c8]">
            Daily Hadith
          </p>
        </div>

        <div className="flex-1 min-w-0 text-center lg:text-left">
          <p
            dir="rtl"
            lang="ar"
            className="text-[18px] sm:text-[20px] leading-loose text-ink-900 dark:text-white font-medium"
          >
            {h.arabic}
          </p>
          <p className="mt-2 text-sm text-black/70 dark:text-white/70">
            {h.english}
          </p>
        </div>

        <div className="flex items-center gap-2 lg:ml-auto justify-end">
          <span className="text-xs text-black/55 dark:text-white/55 mr-1">
            {h.reference}
          </span>
          <button
            type="button"
            aria-label="Copy hadith"
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/70 dark:bg-white/10 hover:bg-white text-black/60 dark:text-white/70"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V5a2 2 0 012-2h10" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Share hadith"
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/70 dark:bg-white/10 hover:bg-white text-black/60 dark:text-white/70"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="12" r="2.5" />
              <circle cx="18" cy="6" r="2.5" />
              <circle cx="18" cy="18" r="2.5" />
              <path d="M8 11l8-4M8 13l8 4" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Bookmark hadith"
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/70 dark:bg-white/10 hover:bg-white text-black/60 dark:text-white/70"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4h12v16l-6-4-6 4z" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
