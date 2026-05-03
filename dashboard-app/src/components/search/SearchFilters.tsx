"use client";

import { useRouter, useSearchParams } from "next/navigation";

const TYPES = [
  { id: "all", label: "All" },
  { id: "hadith", label: "Hadith" },
  { id: "narrator", label: "Narrator" },
  { id: "topic", label: "Topic" },
] as const;

export default function SearchFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("type") || "all";
  const q = params.get("q") || "";

  const setType = (id: string) => {
    const next = new URLSearchParams(params.toString());
    if (id === "all") next.delete("type"); else next.set("type", id);
    router.replace(`/search?${next.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4 no-print">
      {TYPES.map((t) => (
        <button key={t.id} onClick={() => setType(t.id)}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition-colors
            ${current === t.id ? "bg-[var(--reader-green)] text-white border-[var(--reader-green)]"
                               : "border-black/10 dark:border-white/10 text-black/65 dark:text-white/75 hover:bg-black/[0.03]"}`}>
          {t.label}
        </button>
      ))}
      <span className="ml-auto text-xs text-black/45">
        Searching for: <span className="font-medium text-[var(--reader-ink)] dark:text-white">"{q}"</span>
      </span>
    </div>
  );
}
