'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { SeoAuditRow } from '@/lib/seo/types';

type AuditWithSite = SeoAuditRow & { seo_sites?: { domain: string; name: string | null } | null };

function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r   = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = score / 100;
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        className="rotate-90" style={{ fontSize: size * 0.22, fontWeight: 700, fill: '#111827', transform: `rotate(90deg) translate(0, 0)` }}>
      </text>
    </svg>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="text-[12px] font-medium text-gray-400 mb-1">{label}</div>
      <div className={`text-3xl font-bold ${color ?? 'text-gray-900'}`}>{value}</div>
      {sub && <div className="text-[12px] text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function SeverityBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    critical: 'bg-red-100 text-red-700',
    high:     'bg-orange-100 text-orange-700',
    medium:   'bg-amber-100 text-amber-700',
    low:      'bg-blue-100 text-blue-700',
    complete: 'bg-green-100 text-green-700',
    running:  'bg-indigo-100 text-indigo-700',
    pending:  'bg-gray-100 text-gray-600',
    failed:   'bg-red-100 text-red-700',
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${map[s] ?? 'bg-gray-100 text-gray-600'}`}>{s}</span>;
}

export default function SeoDashboardPage() {
  const [audits, setAudits] = useState<AuditWithSite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seo/audit')
      .then(r => r.json())
      .then(d => { setAudits(d.audits ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const latest = audits.find(a => a.status === 'complete');
  const totalCritical = audits.reduce((s, a) => s + (a.issues_critical ?? 0), 0);
  const totalHigh     = audits.reduce((s, a) => s + (a.issues_high ?? 0), 0);

  const quickActions = [
    { label: 'Run Full Audit',     icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',  href: '/seo-dashboard/audit',              color: 'bg-indigo-600 text-white hover:bg-indigo-700' },
    { label: 'Optimize Content',   icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', href: '/seo-dashboard/content-optimizer',  color: 'bg-violet-600 text-white hover:bg-violet-700' },
    { label: 'View Reports',       icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', href: '/seo-dashboard/reports',            color: 'bg-emerald-600 text-white hover:bg-emerald-700' },
    { label: 'Settings',           icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', href: '/seo-dashboard/settings', color: 'bg-gray-700 text-white hover:bg-gray-800' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Command Center</h1>
          <p className="text-[13px] text-gray-400 mt-1">Ahrefs-style auditing · Yoast-style content · AI recommendations</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-[12px] font-semibold text-amber-700">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
          Development Mode
        </span>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <div className="relative">
            <ScoreRing score={latest?.health_score ?? 0} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-900">{latest?.health_score ?? '--'}</span>
            </div>
          </div>
          <div className="text-[12px] font-medium text-gray-400 mt-2">Health Score</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <div className="relative">
            <ScoreRing score={latest?.seo_score ?? 0} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-900">{latest?.seo_score ?? '--'}</span>
            </div>
          </div>
          <div className="text-[12px] font-medium text-gray-400 mt-2">SEO Score</div>
        </div>
        <StatCard label="Critical Issues" value={totalCritical} color={totalCritical > 0 ? 'text-red-600' : 'text-green-600'} sub={`${totalHigh} high severity`} />
        <StatCard label="Audits Run" value={audits.length} sub={latest ? `Last: ${new Date(latest.created_at).toLocaleDateString()}` : 'No audits yet'} />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-[14px] font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(a => (
            <Link key={a.href} href={a.href} className={`flex flex-col items-center gap-2 p-4 rounded-2xl font-semibold text-[13px] transition-all ${a.color}`}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={a.icon} />
              </svg>
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent audits */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold text-gray-700">Recent Audits</h2>
          <Link href="/seo-dashboard/audit" className="text-[12px] font-medium text-indigo-600 hover:text-indigo-800">+ New Audit</Link>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[13px] text-gray-400">Loading audits…</div>
          ) : audits.length === 0 ? (
            <div className="p-8 text-center">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-3"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <p className="text-[13px] text-gray-400">No audits yet.</p>
              <Link href="/seo-dashboard/audit" className="mt-3 inline-block text-[13px] font-semibold text-indigo-600 hover:underline">Run your first audit →</Link>
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">URL</th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Status</th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Health</th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Issues</th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {audits.map(a => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800 truncate max-w-[200px]">{a.url}</td>
                    <td className="px-3 py-3"><SeverityBadge s={a.status} /></td>
                    <td className="px-3 py-3">
                      {a.health_score != null ? (
                        <span className={`font-bold ${a.health_score >= 70 ? 'text-green-600' : a.health_score >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{a.health_score}</span>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-red-600 font-semibold">{a.issues_critical}</span>
                      <span className="text-gray-300 mx-1">/</span>
                      <span className="text-orange-500">{a.issues_high}</span>
                      <span className="text-gray-300 mx-1">/</span>
                      <span className="text-amber-500">{a.issues_medium}</span>
                    </td>
                    <td className="px-3 py-3 text-gray-400">{new Date(a.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      {a.status === 'complete' && (
                        <Link href={`/seo-dashboard/audit/${a.id}`} className="text-[12px] font-semibold text-indigo-600 hover:underline">View →</Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
