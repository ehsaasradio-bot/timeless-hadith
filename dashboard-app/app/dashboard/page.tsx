import type { Metadata } from "next";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import StatCard from "@/src/components/dashboard/StatCard";
import ReadingAnalytics from "@/src/components/dashboard/ReadingAnalytics";
import ContinueReading from "@/src/components/dashboard/ContinueReading";
import NarratorsList from "@/src/components/dashboard/NarratorsList";
import ProgressRing from "@/src/components/dashboard/ProgressRing";
import ReadingTime from "@/src/components/dashboard/ReadingTime";
import DailyHadith from "@/src/components/dashboard/DailyHadith";
import { stats, userProfile } from "@/src/lib/dashboard/mock-data";

export const metadata: Metadata = {
  title: "Dashboard · Timeless Hadith",
  description:
    "Track your hadith reading journey, progress, bookmarks, and personalised recommendations.",
};

export default function DashboardHome() {
  return (
    <DashboardShell>
      {/* Greeting */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">
            Assalamu alaikum, {userProfile.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-black/55 dark:text-white/55">
            Keep your journey of knowledge consistent. You&apos;re doing great.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1f5132] hover:bg-[#25653c] text-white text-sm font-medium px-4 py-2.5 transition-colors"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Note
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-ink-900 dark:text-white text-sm font-medium px-4 py-2.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12" />
            </svg>
            Import Data
          </button>
        </div>
      </div>

      {/* Stats grid */}
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

      {/* Analytics + Continue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mt-5">
        <div className="lg:col-span-2">
          <ReadingAnalytics />
        </div>
        <ContinueReading />
      </div>

      {/* Narrators + Progress + Reading Time */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mt-5">
        <NarratorsList />
        <ProgressRing />
        <ReadingTime />
      </div>

      {/* Daily Hadith */}
      <div className="mt-5">
        <DailyHadith />
      </div>
    </DashboardShell>
  );
}
