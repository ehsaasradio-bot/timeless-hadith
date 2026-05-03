"use client";

import Link from "next/link";
import { useState } from "react";
import type { Hadith } from "@/src/lib/hadith/types";
import ArabicText from "./ArabicText";
import TranslationText from "./TranslationText";

export default function FocusReader({
  hadith,
  prevId,
  nextId,
  position,
  total,
}: {
  hadith: Hadith;
  prevId?: string | null;
  nextId?: string | null;
  position?: number;
  total?: number;
}) {
  const [size, setSize] = useState<"md" | "lg" | "xl">("xl");
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <div className="reader-page min-h-dvh">
      <div className="px-4 sm:px-6 py-5 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-[var(--reader-green)] reader-display font-semibold">
          <span aria-hidden className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--reader-green)] text-white text-sm">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 L14 9 L21 9 L15.5 13 L17.5 20 L12 16 L6.5 20 L8.5 13 L3 9 L10 9 Z"/></svg>
          </span>
          Timeless Hadith
        </Link>
        <Link href={`/read/${hadith.collectionSlug}/${hadith.id}`} className="text-sm text-black/55 hover:text-[var(--reader-green)]">
          Exit Focus
        </Link>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8 sm:py-16 text-center">
        <p className="reader-display text-[var(--reader-green)] text-sm tracking-wide mb-8">
          Hadith {hadith.hadithNumber}
        </p>

        <ArabicText text={hadith.arabic} size={size} className="mb-12" />

        <div className="flex justify-center my-8 text-[var(--reader-green)]/40" aria-hidden>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2 L14 9 L21 9 L15.5 13 L17.5 20 L12 16 L6.5 20 L8.5 13 L3 9 L10 9 Z"/></svg>
        </div>

        <TranslationText text={hadith.english} narrator={hadith.narrator} size="lg" className="max-w-2xl mx-auto" />

        <p className="reader-display italic text-sm text-black/55 dark:text-white/55 mt-8">
          {hadith.collection} {hadith.hadithNumber}
        </p>
      </main>

      <div className="max-w-3xl mx-auto px-6 pb-8 flex items-center justify-center gap-3 no-print">
        <div className="inline-flex rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
          {(["md", "lg", "xl"] as const).map((s) => (
            <button key={s} onClick={() => setSize(s)}
              className={`px-3 py-1.5 text-sm ${size === s ? "bg-[var(--reader-green)] text-white" : "text-black/60 dark:text-white/70 hover:bg-black/[0.03]"}`}>
              {s === "md" ? "A-" : s === "lg" ? "A" : "A+"}
            </button>
          ))}
        </div>
        <button className="grid h-12 w-12 place-items-center rounded-full bg-[var(--reader-green)] text-white hover:bg-[var(--reader-green-soft)]" aria-label="Listen">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <button onClick={() => setBookmarked(!bookmarked)}
          className={`grid h-10 w-10 place-items-center rounded-xl border ${bookmarked ? "bg-[var(--reader-green-tint)] border-[var(--reader-green)]/30 text-[var(--reader-green)]" : "border-black/10 dark:border-white/10 text-black/60 dark:text-white/70 hover:bg-black/[0.03]"}`}
          aria-label="Bookmark">
          <svg viewBox="0 0 24 24" width="14" height="14" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8"><path d="M6 4h12v16l-6-4-6 4z"/></svg>
        </button>
      </div>

      {(prevId || nextId) && (
        <nav className="max-w-3xl mx-auto px-6 pb-12 flex items-center justify-between gap-4 no-print">
          {prevId ? (
            <Link href={`/focus/hadith/${prevId}`} className="reader-card flex items-center gap-3 px-4 py-3 hover:border-[var(--reader-green)]/30">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6"/></svg>
              <span><span className="block text-[10px] uppercase tracking-wider text-black/45">Previous</span><span className="text-sm text-black/75 dark:text-white/85">Hadith</span></span>
            </Link>
          ) : <span />}
          {position && total && (
            <span className="text-xs text-black/45">{position} of {total}</span>
          )}
          {nextId ? (
            <Link href={`/focus/hadith/${nextId}`} className="reader-card flex items-center gap-3 px-4 py-3 hover:border-[var(--reader-green)]/30">
              <span className="text-right"><span className="block text-[10px] uppercase tracking-wider text-black/45">Next</span><span className="text-sm text-black/75 dark:text-white/85">Hadith</span></span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
            </Link>
          ) : <span />}
        </nav>
      )}
    </div>
  );
}
