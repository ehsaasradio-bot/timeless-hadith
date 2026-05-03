export const runtime = "edge";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ReaderShell from "@/src/components/reader/ReaderShell";
import Breadcrumbs from "@/src/components/reader/Breadcrumbs";
import HadithCard from "@/src/components/reader/HadithCard";
import ReaderActions from "@/src/components/reader/ReaderActions";
import ReadingToolsPanel from "@/src/components/reader/ReadingToolsPanel";
import RelatedHadiths from "@/src/components/reader/RelatedHadiths";
import ProgressPanel from "@/src/components/reader/ProgressPanel";
import {
  fetchByCollectionAndNumber,
  fetchAdjacentHadiths,
  fetchRelatedByChapter,
} from "@/src/lib/hadith/queries";
import { isBookmarked } from "@/src/lib/reader/bookmarks";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string; hadithId: string }>;
}): Promise<Metadata> {
  const { collection, hadithId } = await params;
  const h = await fetchByCollectionAndNumber(collection, hadithId);
  if (!h) return { title: "Hadith not found · Timeless Hadith" };
  return {
    title: `${h.collection} ${h.hadithNumber} · Timeless Hadith`,
    description: h.english.slice(0, 160),
  };
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ collection: string; hadithId: string }>;
}) {
  const { collection, hadithId } = await params;
  const hadith = await fetchByCollectionAndNumber(collection, hadithId);
  if (!hadith) notFound();

  const [adjacent, related, bookmarked] = await Promise.all([
    fetchAdjacentHadiths(hadith),
    fetchRelatedByChapter(hadith, 4),
    isBookmarked(hadith.id),
  ]);

  return (
    <ReaderShell>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="flex flex-col gap-4">
          <Breadcrumbs items={[
            { label: hadith.collection, href: `/topics/${hadith.collectionSlug}` },
            { label: hadith.chapter || "Chapter" },
            { label: `Hadith ${hadith.hadithNumber}` },
          ]} />
          <HadithCard hadith={hadith} />
          <ReaderActions
            hadith={hadith}
            initialBookmarked={bookmarked}
            totalInCollection={adjacent.total}
          />
          <nav className="flex items-center justify-between mt-2 no-print gap-3">
            {adjacent.prev ? (
              <Link href={`/read/${adjacent.prev.collectionSlug}/${adjacent.prev.id}`}
                className="reader-card flex items-center gap-3 px-4 py-3 hover:border-[var(--reader-green)]/30">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6"/></svg>
                <span><span className="block text-[10px] uppercase tracking-wider text-black/45">Previous</span><span className="text-sm">Hadith {adjacent.prev.hadithNumber}</span></span>
              </Link>
            ) : <span />}
            {adjacent.next ? (
              <Link href={`/read/${adjacent.next.collectionSlug}/${adjacent.next.id}`}
                className="reader-card flex items-center gap-3 px-4 py-3 hover:border-[var(--reader-green)]/30">
                <span className="text-right"><span className="block text-[10px] uppercase tracking-wider text-black/45">Next</span><span className="text-sm">Hadith {adjacent.next.hadithNumber}</span></span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
              </Link>
            ) : <span />}
          </nav>
        </div>
        <div className="flex flex-col gap-4">
          <ReadingToolsPanel />
          <ProgressPanel hadith={hadith} total={adjacent.total} />
          <RelatedHadiths items={related} />
          <div className="reader-card p-4 text-xs text-black/55 no-print">
            <p className="font-semibold text-[var(--reader-ink)] dark:text-white mb-2">More ways to read</p>
            <Link href={`/focus/hadith/${hadith.id}`} className="block py-1.5 hover:text-[var(--reader-green)]">→ Focus mode</Link>
            <Link href={`/memorize/hadith/${hadith.id}`} className="block py-1.5 hover:text-[var(--reader-green)]">→ Memorize</Link>
            <Link href={`/print/hadith/${hadith.id}`} className="block py-1.5 hover:text-[var(--reader-green)]">→ Print &amp; PDF</Link>
          </div>
        </div>
      </div>
    </ReaderShell>
  );
}
