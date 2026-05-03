"use client";

import { useState } from "react";

export default function ReadingToolsPanel() {
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  return (
    <aside className="reader-card p-5 no-print">
      <h2 className="text-base font-semibold text-[var(--reader-ink)] dark:text-white mb-3">
        Reading Tools
      </h2>
      <div className="flex items-center justify-between text-sm text-black/65 dark:text-white/70 mb-2">
        Font Size
        <div className="inline-flex rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
          {(["sm", "md", "lg"] as const).map((s) => (
            <button key={s} onClick={() => setSize(s)}
              className={`px-3 py-1.5 text-sm ${size === s ? "bg-[var(--reader-green)] text-white" : "text-black/60 dark:text-white/70 hover:bg-black/[0.03]"}`}>
              {s === "sm" ? "A-" : s === "md" ? "A" : "A+"}
            </button>
          ))}
        </div>
      </div>
      <button className="mt-3 inline-flex items-center gap-2 w-full justify-center rounded-xl bg-[var(--reader-green)] text-white py-2.5 text-sm font-medium hover:bg-[var(--reader-green-soft)] transition-colors">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        Listen
      </button>
      <p className="mt-3 text-[11px] text-black/45 dark:text-white/45 leading-relaxed">
        Audio narration is being prepared. We will enable it once the audio source is integrated.
      </p>
    </aside>
  );
}
