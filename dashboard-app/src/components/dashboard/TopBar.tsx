"use client";

import { useEffect, useState } from "react";
import { userProfile } from "@/src/lib/dashboard/mock-data";

export default function TopBar({
  onMenuClick,
}: {
  onMenuClick?: () => void;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof document === "undefined") return;
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "dark" || current === "light") setTheme(current);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("th-theme", next);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <header
      className={[
        "sticky top-0 z-20",
        "bg-[var(--nav-bg)] backdrop-blur-xl",
        "border-b border-black/[0.06] dark:border-white/[0.06]",
      ].join(" ")}
    >
      <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 py-3.5">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="md:hidden grid h-9 w-9 place-items-center rounded-xl text-black/70 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex-1 max-w-2xl">
          <label className="relative block">
            <span className="sr-only">Search</span>
            <span className="absolute inset-y-0 left-3 grid place-items-center text-black/40 dark:text-white/40 pointer-events-none">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 19a8 8 0 100-16 8 8 0 000 16z M21 21l-4.3-4.3" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Search hadith, collections, scholars..."
              className="w-full rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] pl-10 pr-16 py-2.5 text-sm text-black/80 dark:text-white/80 placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#4f72f8]/40 focus:border-[#4f72f8]/40 transition-shadow"
            />
            <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 rounded-md border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-black/50 dark:text-white/50">
              CMD K
            </kbd>
          </label>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="grid h-10 w-10 place-items-center rounded-xl text-black/70 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
          >
            {theme === "light" ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.8A9 9 0 0111.2 3a7 7 0 109.8 9.8z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            )}
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-xl text-black/70 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 1112 0c0 7 3 7 3 9H3c0-2 3-2 3-9z M10 21a2 2 0 004 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-[#4f72f8] text-white text-[10px] font-medium px-1">
              3
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-2.5 pl-2 ml-1">
            <div
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#4f72f8] to-[#7c5ce6] text-white text-sm font-semibold"
            >
              {userProfile.initials}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium text-black/85 dark:text-white/90">
                {userProfile.name}
              </p>
              <p className="text-xs text-black/50 dark:text-white/50">
                {userProfile.email}
              </p>
            </div>
            <button
              type="button"
              aria-label="Account menu"
              className="text-black/40 dark:text-white/40 px-1"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
