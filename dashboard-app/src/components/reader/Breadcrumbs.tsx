import Link from "next/link";

export type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-black/55 dark:text-white/55">
      <Link href="/" aria-label="Home" className="hover:text-[var(--reader-green)]">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-5v-6h-4v6H5a1 1 0 01-1-1z" />
        </svg>
      </Link>
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="text-black/30 dark:text-white/30">/</span>
          {it.href ? (
            <Link href={it.href} className="hover:text-[var(--reader-green)]">{it.label}</Link>
          ) : (
            <span className="text-[var(--reader-ink)] dark:text-white font-medium">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
