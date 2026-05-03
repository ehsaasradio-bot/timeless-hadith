import { card } from "@/src/lib/design/tokens";
import { weeklyReading, type WeeklyBar } from "@/src/lib/dashboard/mock-data";

export default function ReadingAnalytics({
  data = weeklyReading,
  title = "Reading Analytics",
  rangeLabel = "This Week",
}: {
  data?: WeeklyBar[];
  title?: string;
  rangeLabel?: string;
}) {
  const max = Math.max(...data.map((d) => d.count));
  const ticks = [0, 40, 80, 120, 160];

  return (
    <section className={card.default} aria-label={title}>
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight text-ink-900 dark:text-white">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] px-3 py-1.5 text-xs text-black/70 dark:text-white/70 hover:bg-black/[0.06]"
          >
            {rangeLabel}
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Toggle view"
            className="grid h-8 w-8 place-items-center rounded-lg border border-black/[0.08] dark:border-white/[0.08] text-black/60 dark:text-white/60"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19V9 M10 19V5 M16 19v-7" />
            </svg>
          </button>
        </div>
      </header>

      <div className="mt-5 grid grid-cols-[36px_1fr] gap-3">
        {/* Y axis */}
        <div className="flex flex-col-reverse justify-between text-[11px] text-black/40 dark:text-white/40 py-1">
          {ticks.map((t) => (
            <span key={t} className="tabular-nums">
              {t}
            </span>
          ))}
        </div>

        {/* Bars */}
        <div className="relative h-[200px]">
          {/* Gridlines */}
          <div className="absolute inset-0 flex flex-col-reverse justify-between pointer-events-none">
            {ticks.map((t) => (
              <div
                key={t}
                className="border-t border-dashed border-black/[0.06] dark:border-white/[0.06]"
              />
            ))}
          </div>

          <ul className="relative z-10 grid grid-cols-7 items-end h-full gap-2 sm:gap-3">
            {data.map((d) => {
              const h = Math.max(6, (d.count / 160) * 100); // % of 160 ceiling
              return (
                <li key={d.day} className="flex flex-col items-center gap-2 h-full">
                  <span className="mt-auto text-[11px] font-medium text-black/55 dark:text-white/55 tabular-nums">
                    {d.count}
                  </span>
                  <div
                    role="img"
                    aria-label={`${d.day}: ${d.count} hadith`}
                    className="w-full rounded-t-xl bg-gradient-to-t from-[#5cb87d] to-[#bce5c8] dark:from-[#3a9e5e] dark:to-[#2c7f4a]"
                    style={{ height: `${h}%` }}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <ul className="grid grid-cols-7 gap-2 sm:gap-3 pl-[48px] mt-2 text-[11px] text-black/55 dark:text-white/55">
        {data.map((d) => (
          <li key={d.day} className="text-center">
            {d.day}
          </li>
        ))}
      </ul>
    </section>
  );
}
