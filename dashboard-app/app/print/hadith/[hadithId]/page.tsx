import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PrintPreview from "@/src/components/reader/PrintPreview";
import { fetchHadithById } from "@/src/lib/hadith/queries";

export const metadata: Metadata = {
  title: "Print · Timeless Hadith",
};

export default async function PrintPage({
  params,
}: {
  params: Promise<{ hadithId: string }>;
}) {
  const { hadithId } = await params;
  const hadith = await fetchHadithById(hadithId);
  if (!hadith) notFound();
  return <PrintPreview hadith={hadith} />;
}
