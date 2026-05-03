export const runtime = "edge";
import type { Metadata } from "next";
import ReaderShell from "@/src/components/reader/ReaderShell";
import Breadcrumbs from "@/src/components/reader/Breadcrumbs";
import TopicHeader from "@/src/components/reader/TopicHeader";
import TopicResults from "@/src/components/reader/TopicResults";
import { searchHadiths } from "@/src/lib/hadith/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return { title: `${title} · Topics · Timeless Hadith`, description: `Hadiths on ${title}.` };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const keyword = slug.replace(/-/g, " ");
  const title = keyword.replace(/\b\w/g, (c) => c.toUpperCase());
  const items = await searchHadiths(keyword, 30);
  return (
    <ReaderShell>
      <div className="flex flex-col gap-5">
        <Breadcrumbs items={[{ label: "Topics", href: "/topics/index" }, { label: title }]} />
        <TopicHeader
          title={title}
          description={`A curated set of authentic narrations referencing "${keyword}". Topic taxonomy is text-derived for now and will improve as the dataset grows.`}
          count={items.length}
        />
        <TopicResults items={items} />
      </div>
    </ReaderShell>
  );
}
