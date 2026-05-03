import { card, statusBg, type StatusAccent } from "@/src/lib/design/tokens";

type StatIcon = "book" | "check" | "hourglass" | "bookmark";

const ICONS: Record<StatIcon, React.ReactNode> = {
  book: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5a2 2 0 012-2h7v18H5a2 2 0 01-2-2V5z M21 5a2 2 0 00-2-2h-7v18h7a2 2 0 002-2V5z" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  ),
  hourglass: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12 M6 21h12 M6 3v3a6 6 0 0012 0V3 M6 21v-3a6 6 0 0112 0v3" />
    </svg>
  ),
  bookmark: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h12v16l-6-4-6 4z" />
    </svg>
  ),
};

export default function StatCard({
  label,
  value,
  delta,
  deltaTone = "neutral",
  accent = "brand",
  icon = "book",
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  accent?: StatusAccent;
  icon?: StatIcon;
}) {
  const deltaColor =
    deltaTone === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : deltaTone === "down"
      ? "text-rose-600 dark:text-rose-400"
      : "text-black/50 dark:text-white/50";

  return (
    <div className={card.default}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-black/55 dark:text-white/55 truncate">
            {label}
          </p>
          <p className="mt-2 text-3xl sm:text-[34px] font-semibold tracking-tight text-ink tabular-nums">
            {value}
          </p>
        </div>
        <div
          aria-hidden="true"
          className={[
            "shrink-0 grid place-items-center h-10 w-10 rounded-xl",
            statusBg[accent],
          ].join(" ")}
        >
          {ICONS[icon]}
        </div>
      </div>
      {delta && (
        <p className={["mt-3 text-xs flex items-center gap-1", deltaColor].join(" ")}>
          {deltaTone === "up" && (
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l5-5 5 5 M7 12l5-5 5 5" />
            </svg>
          )}
          {deltaTone === "down" && (
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 7l5 5 5-5 M7 12l5 5 5-5" />
            </svg>
          )}
          {delta}
        </p>
      )}
    </div>
  );
}
