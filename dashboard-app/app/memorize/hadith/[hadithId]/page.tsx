export const runtime = "edge";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MemorizeReader from "@/src/components/reader/MemorizeReader";
import { fetchHadithById } from "@/src/lib/hadith/queries";

export const metadata: Metadata = {
  title: "Memorize · Timeless Hadith",
};

export default async function MemorizePage({
  params,
}: {
  params: Promise<{ hadithId: string }>;
}) {
  const { hadithId } = await params;
  const hadith = await fetchHadithById(hadithId);
  if (!hadith) notFound();
  return <MemorizeReader hadith={hadith} />;
}
