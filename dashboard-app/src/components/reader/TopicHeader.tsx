export default function TopicHeader({
  title,
  description,
  count,
}: {
  title: string;
  description?: string;
  count: number;
}) {
  return (
    <section className="reader-card p-6 sm:p-8 bg-[var(--reader-green-faint)] border-[var(--reader-green)]/20">
      <div className="flex items-start gap-5">
        <div aria-hidden className="hidden sm:grid h-16 w-16 place-items-center rounded-2xl bg-white border border-[var(--reader-green)]/20 text-[var(--reader-green)]">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v6 M8 5l4-3 4 3 M5 12c4-1 10-1 14 0 M5 18c4-1 10-1 14 0" />
          </svg>
        </div>
        <div className="flex-1">
          <h1 className="reader-display text-3xl sm:text-4xl font-semibold text-[var(--reader-ink)] dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm sm:text-base text-black/65 dark:text-white/70 max-w-2xl">
              {description}
            </p>
          )}
          <div className="mt-4">
            <span className="inline-flex items-center gap-2 reader-pill rounded-full px-3 py-1.5 text-xs font-medium">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19V5a2 2 0 012-2h11l3 3v13a2 2 0 01-2 2H6a2 2 0 01-2-2z"/></svg>
              {count} reference{count === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
