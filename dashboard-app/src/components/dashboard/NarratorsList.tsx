import { card } from "@/src/lib/design/tokens";
import { topNarrators } from "@/src/lib/dashboard/mock-data";

export default function NarratorsList() {
  return (
    <section className={card.default} aria-label="Top narrators">
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-ink">
          Top Narrators
        </h2>
        <button
          type="button"
          className="text-xs text-[#3a5ce0] dark:text-[#a0baff] hover:underline"
        >
          View All
        </button>
      </header>

      <ul className="mt-4 flex flex-col">
        {topNarrators.map((n, i) => (
          <li
            key={n.id}
            className={[
              "flex items-center gap-3 py-2.5",
              i === 0 ? "" : "border-t border-black/[0.05] dark:border-white/[0.05]",
            ].join(" ")}
          >
            <div
              aria-hidden="true"
              className="shrink-0 grid h-10 w-10 place-items-center rounded-full text-white text-sm font-semibold"
              style={{
                background: `linear-gradient(135deg, ${n.hue} 0%, #3a5ce0 100%)`,
              }}
            >
              {n.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink truncate">
                {n.name}
              </p>
              <p
                lang="ar"
                dir="rtl"
                className="text-[11px] text-black/50 dark:text-white/50 truncate"
              >
                ({n.honorific === "raḍiyallāhu ʿanhumā" ? "رضي الله عنهما" : "رضي الله عنه"})
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#eef2ff] dark:bg-[#3a5ce0]/30 text-[#3a5ce0] dark:text-[#a0baff] text-[11px] font-medium px-2.5 py-1 tabular-nums">
              {n.hadithCount.toLocaleString()} Hadith
            </span>
            <button
              type="button"
              aria-label={`View ${n.name}`}
              className="text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
