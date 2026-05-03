import { card } from "@/src/lib/design/tokens";
import {
  readingTimeWeek,
  totalReadingTime,
  type ReadingTimeBar,
} from "@/src/lib/dashboard/mock-data";

export default function ReadingTime({
  total = totalReadingTime,
  data = readingTimeWeek,
  weekDelta = "12% from last week",
}: {
  total?: string;
  data?: ReadingTimeBar[];
  weekDelta?: string;
}) {
  const max = Math.max(...data.map((d) => d.minutes));

  return (
    <section className={card.default} aria-label="Reading time">
      <header className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight text-ink-900 dark:text-white">
          Reading Time
        </h2>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] px-2.5 py-1 text-[11px] text-black/70 dark:text-white/70"
        >
          This Week
          <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </header>

      <div className="mt-3 flex items-center gap-3">
        <div
          aria-hidden="true"
          className="grid h-12 w-12 place-items-center rounded-2xl bg-[#dcf2e1] dark:bg-[#1f5132]/30 text-[#1f5132] dark:text-[#bce5c8]"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight text-ink-900 dark:text-white tabular-nums">
            {total}
          </p>
          <p className="text-xs text-black/55 dark:text-white/55">
            Total time spent reading
          </p>
          <p className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l5-5 5 5 M7 12l5-5 5 5" />
            </svg>
            {weekDelta}
          </p>
        </div>
      </div>

      <ul className="mt-5 grid grid-cols-7 items-end gap-2 h-[72px]">
        {data.map((d) => {
          const h = Math.max(8, (d.minutes / max) * 100);
          return (
            <li key={d.day} className="flex flex-col items-center gap-1 h-full">
              <span className="mt-auto text-[10px] text-black/55 dark:text-white/55 tabular-nums leading-none">
                {d.label}
              </span>
              <div
                role="img"
                aria-label={`${d.day}: ${d.label}`}
                className="w-full rounded-md bg-gradient-to-t from-[#5cb87d] to-[#bce5c8] dark:from-[#3a9e5e] dark:to-[#2c7f4a]"
                style={{ height: `${h}%` }}
              />
            </li>
          );
        })}
      </ul>
      <ul className="grid grid-cols-7 gap-2 mt-2 text-[10px] text-black/55 dark:text-white/55">
        {data.map((d) => (
          <li key={d.day} className="text-center">
            {d.day}
          </li>
        ))}
      </ul>
    </section>
  );
}
