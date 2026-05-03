import type { Metadata } from "next";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import RecommendationCard from "@/src/components/dashboard/RecommendationCard";
import { card } from "@/src/lib/design/tokens";
import { getRecommendations } from "@/src/lib/recommendations/getRecommendations";

export const metadata: Metadata = {
  title: "Recommendations · Timeless Hadith",
  description:
    "Personalised hadith recommendations based on your reading, bookmarks, and topics.",
};

export default async function RecommendationsPage() {
  // Server-side mock signal — once OpenAI/Supabase is wired in,
  // this can be replaced with real user signals from auth + DB.
  const recs = await getRecommendations({
    userId: "demo",
    progress: [
      { collection: "Sahih al-Bukhari", topic: "Faith", pct: 65 },
      { collection: "Sahih Muslim", topic: "Sincerity", pct: 18 },
    ],
    bookmarks: [{ topic: "Sincerity" }, { topic: "Compassion" }],
    notes: [{ topic: "Intentions" }],
    preferredTopics: ["Faith", "Sincerity", "Compassion", "Trust in Allah"],
    recentNarrators: ["abu-hurairah"],
    dailyMinutes: 25,
  });

  return (
    <DashboardShell>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">
            Recommendations
          </h1>
          <p className="mt-1 text-sm text-black/55 dark:text-white/55">
            Curated for you based on your topics, progress, bookmarks, and recent reading.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcf2e1] dark:bg-[#1f5132]/30 text-[#1f5132] dark:text-[#bce5c8] text-xs font-medium px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3a9e5e] animate-pulse" />
            AI-assisted
          </span>
        </div>
      </div>

      <section
        className={[card.default, "mb-5"].join(" ")}
        aria-label="Why these recommendations"
      >
        <h2 className="text-sm font-semibold text-ink-900 dark:text-white">
          Why these were picked
        </h2>
        <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-black/65 dark:text-white/65">
          <li className="flex items-start gap-2">
            <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#3a9e5e]" />
            Same topic family as your current reading
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#5cb87d]" />
            Continues a collection you have unfinished
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#8dd1a3]" />
            Connects to topics you have bookmarked
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#bce5c8]" />
            Introduces a new narrator
          </li>
        </ul>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {recs.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </div>
    </DashboardShell>
  );
}
