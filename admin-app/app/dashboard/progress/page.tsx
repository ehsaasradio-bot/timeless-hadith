import type { Metadata } from "next";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import ReadingAnalytics from "@/src/components/dashboard/ReadingAnalytics";
import ProgressRing from "@/src/components/dashboard/ProgressRing";
import ReadingTime from "@/src/components/dashboard/ReadingTime";
import StatCard from "@/src/components/dashboard/StatCard";
import { card } from "@/src/lib/design/tokens";
import { stats } from "@/src/lib/dashboard/mock-data";

export const metadata: Metadata = {
  title: "Reading Progress · Timeless Hadith",
  description: "Detailed view of your hadith reading progress and analytics.",
};

const collectionsProgress = [
  { name: "Sahih al-Bukhari", read: 4200, total: 7563, pct: 56 },
  { name: "Sahih Muslim", read: 1820, total: 7563, pct: 24 },
  { name: "Sunan Abi Dawud", read: 980, total: 5274, pct: 19 },
  { name: "Jami` at-Tirmidhi", read: 540, total: 3956, pct: 14 },
];

export default function ProgressPage() {
  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">
          Reading Progress
        </h1>
        <p className="mt-1 text-sm text-black/55 dark:text-white/55">
          Detailed analytics across your collections and reading sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((s) => (
          <StatCard
            key={s.id}
            label={s.label}
            value={s.value}
            delta={s.delta}
            deltaTone={s.deltaTone}
            accent={s.accent}
            icon={s.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mt-5">
        <div className="lg:col-span-2">
          <ReadingAnalytics />
        </div>
        <ProgressRing />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mt-5">
        <ReadingTime />
        <section className={[card.default, "lg:col-span-2"].join(" ")} aria-label="Collections progress">
          <header className="flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight text-ink-900 dark:text-white">
              Collections
            </h2>
            <span className="text-xs text-black/55 dark:text-white/55">
              {collectionsProgress.length} active
            </span>
          </header>
          <ul className="mt-4 flex flex-col gap-4">
            {collectionsProgress.map((c) => (
              <li key={c.name} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-ink-900 dark:text-white truncate">
                    {c.name}
                  </span>
                  <span className="text-xs text-black/55 dark:text-white/55 tabular-nums">
                    {c.read.toLocaleString()} / {c.total.toLocaleString()} ·{" "}
                    {c.pct}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#3a9e5e] to-[#5cb87d]"
                    style={{ width: `${c.pct}%` }}
                    aria-hidden="true"
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </DashboardShell>
  );
}
