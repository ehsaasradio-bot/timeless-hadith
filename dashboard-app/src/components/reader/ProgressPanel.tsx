import type { Hadith } from "@/src/lib/hadith/types";

export default function ProgressPanel({
  hadith,
  total,
}: {
  hadith: Hadith;
  total: number;
}) {
  const num = Number(hadith.hadithNumber) || 0;
  const pct = total > 0 ? Math.min(100, Math.round((num / total) * 100)) : 0;
  return (
    <aside className="reader-card p-5 no-print">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-base font-semibold text-[var(--reader-ink)] dark:text-white">
          Your Progress
        </h2>
        <span className="text-[11px] text-black/45 dark:text-white/45">This collection</span>
      </div>
      <p className="text-3xl font-semibold text-[var(--reader-green)] tabular-nums">
        {pct}%
      </p>
      <p className="text-xs text-black/55 dark:text-white/55">
        {num} of {total || "?"} hadiths read
      </p>
      <div className="mt-3 h-1.5 w-full rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
        <div className="h-full rounded-full bg-[var(--reader-green)]" style={{ width: `${pct}%` }} aria-hidden />
      </div>
    </aside>
  );
}
