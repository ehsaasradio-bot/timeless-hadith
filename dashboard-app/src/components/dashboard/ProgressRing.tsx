import { card } from "@/src/lib/design/tokens";
import { overallProgress } from "@/src/lib/dashboard/mock-data";

export default function ProgressRing({
  pct = overallProgress.pct,
  completed = overallProgress.completed,
  inProgress = overallProgress.inProgress,
  remaining = overallProgress.remaining,
}: {
  pct?: number;
  completed?: number;
  inProgress?: number;
  remaining?: number;
}) {
  const size = 168;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <section className={card.default} aria-label="Reading progress">
      <header>
        <h2 className="text-base font-semibold tracking-tight text-ink">
          Reading Progress
        </h2>
      </header>

      <div className="mt-3 flex items-center gap-5">
        <div
          className="relative shrink-0"
          style={{ width: size, height: size }}
          role="img"
          aria-label={`Overall progress ${pct}%`}
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <linearGradient id="progress-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7c5ce6" />
                <stop offset="100%" stopColor="#3a5ce0" />
              </linearGradient>
            </defs>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              className="text-black/[0.06] dark:text-white/[0.06]"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#progress-grad)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-3xl font-semibold tracking-tight text-ink tabular-nums">
                {pct}%
              </p>
              <p className="text-[11px] text-black/55 dark:text-white/55">
                Overall Progress
              </p>
            </div>
          </div>
        </div>

        <ul className="flex-1 min-w-0 flex flex-col gap-3 text-sm">
          {[
            { label: "Completed", value: completed, dot: "#4f72f8" },
            { label: "In Progress", value: inProgress, dot: "#a0baff" },
            { label: "Remaining", value: remaining, dot: "#dde1e6" },
          ].map((row) => (
            <li key={row.label} className="flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className="mt-1.5 inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: row.dot }}
              />
              <div className="min-w-0">
                <p className="text-ink">{row.label}</p>
                <p className="text-xs text-black/55 dark:text-white/55 tabular-nums">
                  {row.value.toLocaleString()} Hadith
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
