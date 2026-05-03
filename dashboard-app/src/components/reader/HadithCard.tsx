import type { Hadith } from "@/src/lib/hadith/types";
import ArabicText from "./ArabicText";
import TranslationText from "./TranslationText";

export default function HadithCard({ hadith }: { hadith: Hadith }) {
  return (
    <article className="reader-card p-6 sm:p-10">
      <div className="flex flex-wrap gap-2 mb-6 text-xs">
        <span className="reader-pill rounded-lg px-3 py-1.5">Collection: {hadith.collection}</span>
        {hadith.narrator && <span className="reader-pill rounded-lg px-3 py-1.5">Narrator: {hadith.narrator}</span>}
        <span className="reader-pill rounded-lg px-3 py-1.5">Grade: {hadith.grade}</span>
        {hadith.chapter && <span className="reader-pill rounded-lg px-3 py-1.5">Chapter: {hadith.chapter}</span>}
      </div>

      {hadith.arabic && (
        <div className="my-6 sm:my-10 text-center">
          <ArabicText text={hadith.arabic} size="xl" />
        </div>
      )}

      <div className="flex justify-center my-6 text-[var(--reader-green)]/40" aria-hidden>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 2 L14 9 L21 9 L15.5 13 L17.5 20 L12 16 L6.5 20 L8.5 13 L3 9 L10 9 Z" />
        </svg>
      </div>

      {hadith.english && (
        <div className="max-w-2xl mx-auto text-center">
          <TranslationText text={hadith.english} narrator={hadith.narrator} size="md" />
        </div>
      )}

      <p className="text-center text-xs text-black/50 dark:text-white/50 mt-6 reader-display italic">
        {hadith.collection} {hadith.hadithNumber}
      </p>
    </article>
  );
}
