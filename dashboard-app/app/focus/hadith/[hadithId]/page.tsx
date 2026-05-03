export const runtime = "edge";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import FocusReader from "@/src/components/reader/FocusReader";
import { fetchHadithById, fetchAdjacentHadiths } from "@/src/lib/hadith/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hadithId: string }>;
}): Promise<Metadata> {
  const { hadithId } = await params;
  const h = await fetchHadithById(hadithId);
  if (!h) return { title: "Hadith not found" };
  return {
    title: `${h.collection} ${h.hadithNumber} · Focus Mode`,
    description: h.english.slice(0, 160),
  };
}

export default async function FocusPage({
  params,
}: {
  params: Promise<{ hadithId: string }>;
}) {
  const { hadithId } = await params;
  const hadith = await fetchHadithById(hadithId);
  if (!hadith) notFound();
  const adj = await fetchAdjacentHadiths(hadith);
  return (
    <FocusReader
      hadith={hadith}
      prevId={adj.prev?.id}
      nextId={adj.next?.id}
      position={Number(hadith.hadithNumber) || undefined}
      total={adj.total}
    />
  );
}
