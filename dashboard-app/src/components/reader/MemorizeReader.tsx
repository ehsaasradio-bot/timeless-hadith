"use client";

import { useState } from "react";
import type { Hadith } from "@/src/lib/hadith/types";
import ArabicText from "./ArabicText";
import TranslationText from "./TranslationText";

const STEPS = ["Listen", "Read", "Repeat", "Recall", "Review"] as const;

export default function MemorizeReader({ hadith }: { hadith: Hadith }) {
  const [step, setStep] = useState(2); // 1-indexed; 2 = Read by default
  const [hideTranslation, setHideTranslation] = useState(false);
  const [hideWords, setHideWords] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [reps, setReps] = useState(6);
  const overall = Math.round(((step - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="reader-page">
      <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-6xl mx-auto">
        <nav className="text-sm text-black/55 mb-4">
          <span>{hadith.collection}</span>
          <span className="mx-2 text-black/25">/</span>
          <span>{hadith.chapter || "Chapter"}</span>
          <span className="mx-2 text-black/25">/</span>
          <span>Hadith {hadith.hadithNumber}</span>
          <span className="mx-2 text-black/25">/</span>
          <span className="text-[var(--reader-ink)] dark:text-white font-medium">Memorize</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          <div className="reader-card p-5 sm:p-7">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm">
                <span className="text-black/50">Step {step} of 5</span>
                <span className="ml-2 font-semibold text-[var(--reader-ink)] dark:text-white">{STEPS[step - 1]}</span>
              </p>
              <button className="text-xs text-black/55 hover:text-[var(--reader-green)]">
                Exit
              </button>
            </div>

            <ol className="grid grid-cols-5 gap-2 mb-6 text-[11px]">
              {STEPS.map((label, i) => {
                const idx = i + 1;
                const done = idx < step;
                const cur = idx === step;
                return (
                  <li key={label} className="flex flex-col items-center gap-1.5">
                    <button
                      onClick={() => setStep(idx)}
                      className={`grid h-7 w-7 place-items-center rounded-full border text-xs font-medium
                        ${cur ? "bg-[var(--reader-green)] text-white border-[var(--reader-green)]"
                              : done ? "bg-[var(--reader-green-tint)] text-[var(--reader-green)] border-[var(--reader-green)]/30"
                                     : "bg-white text-black/45 border-black/15"}`}>
                      {done ? "✓" : idx}
                    </button>
                    <span className={cur ? "text-[var(--reader-green)] font-medium" : "text-black/55"}>{label}</span>
                  </li>
                );
              })}
            </ol>

            <div className="text-center mb-6">
              <ArabicText
                text={hideWords ? hadith.arabic.replace(/(\S+)/g, (m, _w, i) => (i % 3 === 0 ? "•••" : m)) : hadith.arabic}
                size="lg"
              />
            </div>

            {!hideTranslation && (
              <div className="max-w-xl mx-auto text-center mb-6">
                <TranslationText text={hadith.english} narrator={hadith.narrator} size="md" />
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
              <button className="inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 px-3 py-2 text-sm">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Repeat Audio
              </button>
              <button onClick={() => setHideTranslation(!hideTranslation)}
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 px-3 py-2 text-sm">
                {hideTranslation ? "Show Translation" : "Hide Translation"}
              </button>
              <button onClick={() => setHideWords(!hideWords)}
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 px-3 py-2 text-sm">
                {hideWords ? "Show All Words" : "Hide Certain Words"}
              </button>
              <button onClick={() => setRevealed(!revealed)}
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 px-3 py-2 text-sm">
                {revealed ? "Hide" : "Reveal"}
              </button>
              <button onClick={() => setReps(reps + 1)}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--reader-green)]/30 text-[var(--reader-green)] px-3 py-2 text-sm">
                Mark Memorized
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl bg-[var(--reader-green)] text-white px-3 py-2 text-sm hover:bg-[var(--reader-green-soft)]">
                Test Myself
              </button>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="reader-card p-5">
              <h3 className="text-sm font-semibold mb-3">Session Progress</h3>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20">
                  <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" className="text-black/[0.06]" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--reader-green)" strokeWidth="3"
                      strokeDasharray={`${overall} 100`} strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-sm font-semibold">{overall}%</div>
                </div>
                <ul className="text-xs flex-1 space-y-1">
                  {STEPS.map((s, i) => (
                    <li key={s} className={i + 1 <= step ? "text-[var(--reader-green)]" : "text-black/45"}>
                      {i + 1 <= step ? "✓ " : `${i + 1} `} {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="reader-card p-5">
              <h3 className="text-sm font-semibold mb-3">Session Stats</h3>
              <ul className="text-xs space-y-2">
                <li className="flex justify-between"><span>Repetitions Today</span><span className="font-medium">{reps}</span></li>
                <li className="flex justify-between"><span>Time Spent</span><span className="font-medium">14m</span></li>
                <li className="flex justify-between"><span>Accuracy</span><span className="font-medium">—</span></li>
                <li className="flex justify-between"><span>Current Streak</span><span className="font-medium">2 days</span></li>
              </ul>
            </div>

            <div className="reader-card p-5">
              <h3 className="text-sm font-semibold">Mastery Progress</h3>
              <p className="mt-2 text-sm font-medium text-[var(--reader-green)]">Familiar</p>
              <p className="text-[11px] text-black/55">Keep practicing to reach Proficient</p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-black/[0.06] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--reader-green)]" style={{ width: `${overall}%` }} aria-hidden />
              </div>
            </div>

            <div className="reader-card p-5">
              <h3 className="text-sm font-semibold">Tips</h3>
              <p className="mt-2 text-xs text-black/65">
                Try to recall the hadith without looking. Then check and repeat until it sticks.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
