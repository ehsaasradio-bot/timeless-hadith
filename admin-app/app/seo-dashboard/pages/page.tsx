'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

type AuditRow = {
  id: string;
  url: string;
  status: string;
  health_score: number | null;
  seo_score: number | null;
  issues_critical: number | null;
  issues_high: number | null;
  issues_medium: number | null;
  created_at: string;
  seo_sites?: { domain: string; name: string | null } | null;
};

type ScoreFilter = 'all' | 'good' | 'needs-work' | 'poor';

const PAGE_SIZE = 20;

function ScorePill({ score }: { score: number | null }) {
  if (score == null) return <span className="text-gray-300 text-[13px]">—</span>;
  const cls = score >= 70
    ? 'bg-green-50 text-green-700 border border-green-200'
    : score >= 40
    ? 'bg-amber-50 text-amber-700 border border-amber-200'
    : 'bg-red-50 text-red-700 border border-red-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-bold ${cls}`}>
      {score}
    </span>
  );
}

export default function PagesPage() {
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all');
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetch('/api/seo/audit')
      .then(r => r.json())
      .then(d => { setAudits(d.audits ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [search, scoreFilter]);

  const filtered = useMemo(() => {
    return audits.filter(a => {
      const matchesSearch = !search.trim() || a.url.toLowerCase().includes(search.toLowerCase());
      const score = a.seo_score ?? a.health_score;
      const matchesScore =
        scoreFilter === 'all' ? true :
        scoreFilter === 'good' ? (score != null && score >= 70) :
        scoreFilter === 'needs-work' ? (score != null && score >= 40 && score < 70) :
        scoreFilter === 'poor' ? (score != null && score < 40) : true;
      return matchesSearch && matchesScore;
    });
  }, [audits, search, scoreFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const SCORE_FILTERS: { value: ScoreFilter; label: string }[] = [
    { value: 'all',        label: 'All Pages' },
    { value: 'good',       label: 'Good (≥70)' },
    { value: 'needs-work', label: 'Needs Work (40–69)' },
    { value: 'poor',       label: 'Poor (<40)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crawled Pages</h1>
          <p className="text-[13px] text-gray-400 mt-1">
            All pages audited so far — filter by URL or score.
          </p>
        </div>
        <Link
          href="/seo-dashboard/audit"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-[13px] font-semibold hover:bg-indigo-700 transition-all"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          Audit New URL
        </Link>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by URL…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {/* Score filter */}
        <div className="flex gap-1.5 flex-wrap">
          {SCORE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setScoreFilter(f.value)}
              className={`px-3 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                scoreFilter === f.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <div className="text-[12px] text-gray-400">
          Showing {paginated.length} of {filtered.length} pages
          {search && ` matching "${search}"`}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-[13px] text-gray-400">Loading pages…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-3">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-[13px] text-gray-400">
              {audits.length === 0
                ? 'No pages crawled yet.'
                : 'No pages match your current filters.'}
            </p>
            {audits.length === 0 && (
              <Link href="/seo-dashboard/audit" className="mt-3 inline-block text-[13px] font-semibold text-indigo-600 hover:underline">
                Run your first audit →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">URL</th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Title / Site</th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">SEO Score</th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Issues</th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Last Crawled</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {paginated.map(a => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800 max-w-[220px]">
                      <div className="truncate" title={a.url}>{a.url}</div>
                    </td>
                    <td className="px-3 py-3 text-gray-500 max-w-[160px]">
                      <div className="truncate text-[12px]">
                        {a.seo_sites?.name ?? a.seo_sites?.domain ?? '—'}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <ScorePill score={a.seo_score} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5 text-[12px]">
                        {(a.issues_critical ?? 0) > 0 && (
                          <span className="font-bold text-red-600">{a.issues_critical}C</span>
                        )}
                        {(a.issues_high ?? 0) > 0 && (
                          <span className="font-semibold text-orange-500">{a.issues_high}H</span>
                        )}
                        {(a.issues_medium ?? 0) > 0 && (
                          <span className="text-amber-500">{a.issues_medium}M</span>
                        )}
                        {!(a.issues_critical ?? 0) && !(a.issues_high ?? 0) && !(a.issues_medium ?? 0) && (
                          <span className="text-gray-300">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      {a.status === 'complete' && (
                        <Link
                          href={`/seo-dashboard/audit/${a.id}`}
                          className="text-[12px] font-semibold text-indigo-600 hover:underline whitespace-nowrap"
                        >
                          View →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-400">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
