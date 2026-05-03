import type { Hadith } from "@/src/lib/hadith/types";
import ArabicText from "./ArabicText";
import TranslationText from "./TranslationText";
import { OrnamentRow } from "./Ornament";

export default function HadithCard({ hadith }: { hadith: Hadith }) {
  return (
    <article className="reader-card p-6 sm:p-10">
      {/* Hadith N with ornament flourishes — matches mockups */}
      <OrnamentRow label={`Hadith ${hadith.hadithNumber || "—"}`} className="mb-6" />

      <div className="flex flex-wrap gap-2 mb-6 text-xs justify-center">
        <span className="reader-pill rounded-lg px-3 py-1.5">
          Collection: {hadith.collection}
        </span>
        {hadith.narrator && (
          <span className="reader-pill rounded-lg px-3 py-1.5">
            Narrator: {hadith.narrator}
          </span>
        )}
        <span className="reader-pill rounded-lg px-3 py-1.5">
          Grade: {hadith.grade}
        </span>
        {hadith.chapter && (
          <span className="reader-pill rounded-lg px-3 py-1.5">
            Chapter: {hadith.chapter}
          </span>
        )}
      </div>

      {hadith.arabic && (
        <div className="my-8 sm:my-12 text-center">
          <ArabicText text={hadith.arabic} size="xl" />
        </div>
      )}

      <OrnamentRow className="my-6" />

      {hadith.english && (
        <div className="max-w-2xl mx-auto text-center">
          <TranslationText
            text={hadith.english}
            narrator={hadith.narrator}
            size="md"
          />
        </div>
      )}

      <p className="text-center text-xs text-black/55 dark:text-white/55 mt-6 reader-display italic">
        {hadith.collection} {hadith.hadithNumber}
      </p>
    </article>
  );
}
