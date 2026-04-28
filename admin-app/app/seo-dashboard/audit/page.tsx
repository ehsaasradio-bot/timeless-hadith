'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
};

function SeverityBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    complete: 'bg-green-100 text-green-700',
    running:  'bg-indigo-100 text-indigo-700',
    pending:  'bg-gray-100 text-gray-600',
    failed:   'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${map[s] ?? 'bg-gray-100 text-gray-600'}`}>
      {s}
    </span>
  );
}

const STATUS_MESSAGES = [
  'Connecting to URL…',
  'Crawling page structure…',
  'Checking meta tags and headings…',
  'Analyzing performance signals…',
  'Evaluating internal links…',
  'Scanning for broken resources…',
  'Running accessibility checks…',
  'Compiling results…',
];

export default function AuditPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusIdx, setStatusIdx] = useState(0);
  const [error, setError] = useState('');
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [auditsLoading, setAuditsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seo/audit')
      .then(r => r.json())
      .then(d => { setAudits(d.audits ?? []); setAuditsLoading(false); })
      .catch(() => setAuditsLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setStatusIdx(i => (i + 1) % STATUS_MESSAGES.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setError('');
    setLoading(true);
    setStatusIdx(0);
    try {
      const res = await fetch('/api/seo/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Audit failed');
      const id = data.audit?.id ?? data.id;
      if (id) {
        router.push(`/seo-dashboard/audit/${id}`);
      } else {
        throw new Error('No audit ID returned');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Technical Audit</h1>
        <p className="text-[13px] text-gray-400 mt-1">
          Enter a URL to run a full SEO and performance audit.
        </p>
      </div>

      {/* URL Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-[13px] font-semibold text-gray-700 mb-1">
            Page URL to Audit
          </label>
          <div className="flex gap-3 flex-col sm:flex-row">
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com/page"
              required
              disabled={loading}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 transition"
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-[14px] font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all whitespace-nowrap"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Running…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                  Run Audit
                </>
              )}
            </button>
          </div>

          {/* Loading progress */}
          {loading && (
            <div className="mt-4 rounded-xl bg-indigo-50 border border-indigo-100 px-5 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[13px] font-medium text-indigo-700 transition-all duration-500">
                  {STATUS_MESSAGES[statusIdx]}
                </span>
              </div>
              <div className="w-full bg-indigo-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1400"
                  style={{ width: `${((statusIdx + 1) / STATUS_MESSAGES.length) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-indigo-400">This may take 15–30 seconds depending on page size.</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-700 font-medium">
              {error}
            </div>
          )}
        </form>
      </div>

      {/* Recent audits */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold text-gray-700">Recent Audits</h2>
          <span className="text-[12px] text-gray-400">{audits.length} total</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {auditsLoading ? (
            <div className="p-8 text-center text-[13px] text-gray-400">Loading audits…</div>
          ) : audits.length === 0 ? (
            <div className="p-10 text-center">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-3">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-[13px] text-gray-400">No audits run yet. Enter a URL above to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">URL</th>
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Status</th>
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Health</th>
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">SEO</th>
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Issues</th>
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Date</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {audits.map(a => (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800 max-w-[200px] truncate">{a.url}</td>
                      <td className="px-3 py-3"><SeverityBadge s={a.status} /></td>
                      <td className="px-3 py-3">
                        {a.health_score != null ? (
                          <span className={`font-bold ${a.health_score >= 70 ? 'text-green-600' : a.health_score >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                            {a.health_score}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-3">
                        {a.seo_score != null ? (
                          <span className={`font-bold ${a.seo_score >= 70 ? 'text-green-600' : a.seo_score >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                            {a.seo_score}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-red-600 font-semibold">{a.issues_critical ?? 0}</span>
                        <span className="text-gray-300 mx-1">/</span>
                        <span className="text-orange-500">{a.issues_high ?? 0}</span>
                        <span className="text-gray-300 mx-1">/</span>
                        <span className="text-amber-500">{a.issues_medium ?? 0}</span>
                      </td>
                      <td className="px-3 py-3 text-gray-400">{new Date(a.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        {a.status === 'complete' && (
                          <Link href={`/seo-dashboard/audit/${a.id}`} className="text-[12px] font-semibold text-indigo-600 hover:underline">
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
      </div>
    </div>
  );
}
