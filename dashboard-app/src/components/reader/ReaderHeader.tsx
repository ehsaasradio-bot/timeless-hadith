"use client";
import Link from "next/link";

export default function ReaderHeader() {
  return (
    <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-xl border-b border-black/[0.05] dark:bg-[#0d1629]/85 dark:border-white/[0.06] no-print">
      <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--reader-green)] text-white">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2 L14 9 L21 9 L15.5 13 L17.5 20 L12 16 L6.5 20 L8.5 13 L3 9 L10 9 Z" />
            </svg>
          </span>
          <span className="reader-display font-semibold text-lg text-[var(--reader-ink)] dark:text-white">
            Timeless Hadith
          </span>
        </Link>
        <div className="flex-1 max-w-xl mx-4">
          <form action="/search" method="get" className="relative">
            <input
              name="q"
              type="search"
              placeholder="Search hadith, narrator, topic..."
              className="w-full rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--reader-green)]/30"
            />
            <span className="absolute inset-y-0 left-3 grid place-items-center text-black/40 pointer-events-none">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 19a8 8 0 100-16 8 8 0 000 16z M21 21l-4.3-4.3" />
              </svg>
            </span>
          </form>
        </div>
        <Link href="/dashboard" className="text-sm text-[var(--reader-green)] hover:underline hidden sm:inline">
          My Dashboard
        </Link>
      </div>
    </header>
  );
}
