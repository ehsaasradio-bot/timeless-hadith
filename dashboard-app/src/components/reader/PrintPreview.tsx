"use client";

import { useState } from "react";
import type { Hadith } from "@/src/lib/hadith/types";

export default function PrintPreview({ hadith }: { hadith: Hadith }) {
  const [size, setSize] = useState<"A4" | "Letter">("A4");
  const [orient, setOrient] = useState<"portrait" | "landscape">("portrait");
  const [includeNotes, setIncludeNotes] = useState(true);

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div className="reader-page">
      <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4 no-print">
          <button onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--reader-green)] text-white px-4 py-2 text-sm font-medium hover:bg-[var(--reader-green-soft)]">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9V3h12v6 M6 14h12v7H6z M18 12h2"/></svg>
            Print
          </button>
          <button onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 px-4 py-2 text-sm">
            Download PDF
          </button>
          <select value={size} onChange={(e) => setSize(e.target.value as "A4" | "Letter")}
            className="rounded-xl border border-black/10 dark:border-white/10 px-3 py-2 text-sm bg-transparent">
            <option value="A4">A4 (210 × 297 mm)</option>
            <option value="Letter">Letter (8.5 × 11 in)</option>
          </select>
          <div className="inline-flex rounded-xl border border-black/10 dark:border-white/10 overflow-hidden">
            <button onClick={() => setOrient("portrait")}
              className={`px-3 py-2 text-sm ${orient === "portrait" ? "bg-[var(--reader-green)] text-white" : ""}`}>Portrait</button>
            <button onClick={() => setOrient("landscape")}
              className={`px-3 py-2 text-sm ${orient === "landscape" ? "bg-[var(--reader-green)] text-white" : ""}`}>Landscape</button>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeNotes} onChange={(e) => setIncludeNotes(e.target.checked)} />
            Include notes
          </label>
        </div>

        <div className="reader-card p-8 max-w-2xl mx-auto" id="print-area">
          <header className="text-center mb-6">
            <p className="reader-display text-[var(--reader-green)] font-semibold">Timeless Hadith</p>
            <h1 className="reader-display text-3xl font-semibold mt-2">Hadith {hadith.hadithNumber}</h1>
            <div className="flex flex-wrap justify-center gap-2 mt-4 text-xs">
              <span className="reader-pill rounded-md px-2 py-1">Collection: {hadith.collection}</span>
              {hadith.chapter && <span className="reader-pill rounded-md px-2 py-1">Chapter: {hadith.chapter}</span>}
              <span className="reader-pill rounded-md px-2 py-1">Grade: {hadith.grade}</span>
            </div>
          </header>

          {hadith.arabic && (
            <div className="text-center my-6">
              <p dir="rtl" lang="ar" className="reader-arabic text-2xl">{hadith.arabic}</p>
            </div>
          )}

          {hadith.english && (
            <div className="text-center reader-display mt-4">
              {hadith.narrator && <p className="text-sm text-black/65 dark:text-white/65 mb-2"><span className="font-medium">{hadith.narrator}</span> reported:</p>}
              <p className="text-base leading-relaxed">&ldquo;{hadith.english}&rdquo;</p>
            </div>
          )}

          <p className="text-center reader-display italic text-sm text-black/55 mt-6">
            {hadith.collection} {hadith.hadithNumber}
          </p>

          {includeNotes && hadith.summary && (
            <section className="mt-8 pt-6 border-t border-black/[0.08]">
              <h2 className="text-sm font-semibold text-[var(--reader-green)] mb-2">Notes</h2>
              <p className="text-sm text-black/70 dark:text-white/75">{hadith.summary}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
