"use client";

import { useState, useTransition } from "react";
import type { Hadith } from "@/src/lib/hadith/types";
import { toggleBookmark } from "@/src/lib/reader/bookmarks";
import { markAsCompleted } from "@/src/lib/reader/progress";

export default function ReaderActions({
  hadith,
  initialBookmarked = false,
  totalInCollection = 0,
}: {
  hadith: Hadith;
  initialBookmarked?: boolean;
  totalInCollection?: number;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [completed, setCompleted] = useState(false);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const onBookmark = () => {
    start(async () => {
      const r = await toggleBookmark(hadith);
      if (!r.ok) {
        setMsg(r.reason === "not_authenticated" ? "Sign in to save bookmarks" : "Could not save");
        return;
      }
      setBookmarked(!!r.bookmarked);
      setMsg(null);
    });
  };

  const onCopy = async () => {
    try {
      const text = `${hadith.arabic}\n\n${hadith.english}\n\n— ${hadith.collection} ${hadith.hadithNumber}`;
      await navigator.clipboard.writeText(text);
      setMsg("Copied");
      setTimeout(() => setMsg(null), 1500);
    } catch {
      setMsg("Copy failed");
    }
  };

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: hadith.collection, text: hadith.english, url });
      } else {
        await navigator.clipboard.writeText(url);
        setMsg("Link copied");
        setTimeout(() => setMsg(null), 1500);
      }
    } catch { /* user cancelled */ }
  };

  const onMarkRead = () => {
    start(async () => {
      const r = await markAsCompleted(hadith, totalInCollection);
      if (!r.ok) {
        setMsg(r.reason === "not_authenticated" ? "Sign in to track progress" : "Could not save");
        return;
      }
      setCompleted(true);
      setMsg(null);
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-6 no-print">
      <button onClick={onBookmark} disabled={pending}
        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors
          ${bookmarked ? "bg-[var(--reader-green-tint)] border-[var(--reader-green)]/30 text-[var(--reader-green)]"
                       : "border-black/10 dark:border-white/10 text-black/70 dark:text-white/80 hover:bg-black/[0.03]"}`}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8"><path d="M6 4h12v16l-6-4-6 4z"/></svg>
        {bookmarked ? "Saved" : "Bookmark"}
      </button>
      <button onClick={onCopy} className="inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 px-4 py-2 text-sm text-black/70 dark:text-white/80 hover:bg-black/[0.03]">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>
        Copy
      </button>
      <button onClick={onShare} className="inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 px-4 py-2 text-sm text-black/70 dark:text-white/80 hover:bg-black/[0.03]">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 11l8-4M8 13l8 4"/></svg>
        Share
      </button>
      <button onClick={onMarkRead} disabled={pending || completed}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors
          ${completed ? "bg-[var(--reader-green)] text-white"
                      : "bg-[var(--reader-green)] text-white hover:bg-[var(--reader-green-soft)]"}`}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12l5 5L20 7"/></svg>
        {completed ? "Marked read" : "Mark as read"}
      </button>
      {msg && <span className="text-xs text-black/55 dark:text-white/55 ml-2">{msg}</span>}
    </div>
  );
}
