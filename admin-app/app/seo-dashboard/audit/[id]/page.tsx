'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type Issue = {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  affected_url?: string;
  how_to_fix?: string;
};

type Recommendation = {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action_items?: string[];
};

type AuditDetail = {
  id: string;
  url: string;
  status: string;
  health_score: number | null;
  seo_score: number | null;
  issues_critical: number | null;
  issues_high: number | null;
  issues_medium: number | null;
  issues_low: number | null;
  created_at: string;
};

type AuditData = {
  audit: AuditDetail;
  issues: Issue[];
  recommendations: Recommendation[];
};

function ScoreRing({ score, size = 80, label }: { score: number; size?: number; label: string }) {
  const r    = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = Math.max(0, Math.min(score, 100)) / 100;
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{score}</span>
        </div>
      </div>
      <span className="text-[11px] font-medium text-gray-400">{label}</span>
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
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${map[s] ?? 'bg-gray-100 text-gray-600'}`}>
      {s}
    </span>
  );
}

function PriorityBadge({ p }: { p: string }) {
  const map: Record<string, string> = {
    high:   'bg-red-50 text-red-600 border border-red-200',
    medium: 'bg-amber-50 text-amber-600 border border-amber-200',
    low:    'bg-blue-50 text-blue-600 border border-blue-200',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${map[p] ?? 'bg-gray-100 text-gray-600'}`}>
      {p}
    </span>
  );
}

const SEVERITY_ORDER: Issue['severity'][] = ['critical', 'high', 'medium', 'low'];

export default function AuditDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ critical: true, high: true, medium: false, low: false });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/seo/audit/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message ?? 'Failed to load audit');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[13px] text-gray-400">
        <svg className="animate-spin mr-2" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        Loading audit results…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 p-8 text-center">
        <p className="text-[14px] font-medium text-red-600 mb-4">{error || 'Audit not found'}</p>
        <Link href="/seo-dashboard/audit" className="text-[13px] font-semibold text-indigo-600 hover:underline">
          ← Back to Audits
        </Link>
      </div>
    );
  }

  const { audit, issues, recommendations } = data;

  const groupedIssues = SEVERITY_ORDER.reduce<Record<string, Issue[]>>((acc, sev) => {
    acc[sev] = issues.filter(i => i.severity === sev);
    return acc;
  }, {} as Record<string, Issue[]>);

  const severityColors: Record<string, string> = {
    critical: 'border-l-4 border-red-400',
    high:     'border-l-4 border-orange-400',
    medium:   'border-l-4 border-amber-400',
    low:      'border-l-4 border-blue-400',
  };

  const severityGroupColors: Record<string, string> = {
    critical: 'bg-red-50',
    high:     'bg-orange-50',
    medium:   'bg-amber-50',
    low:      'bg-blue-50',
  };

  return (
    <div className="space-y-7">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-gray-400">
        <Link href="/seo-dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/seo-dashboard/audit" className="hover:text-indigo-600 transition-colors">Audits</Link>
        <span>/</span>
        <span className="text-gray-600 font-medium truncate max-w-[200px]">{audit.url}</span>
      </div>

      {/* Top section: URL + scores */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h1 className="text-lg font-bold text-gray-900 break-all">{audit.url}</h1>
              <SeverityBadge s={audit.status} />
            </div>
            <p className="text-[12px] text-gray-400">
              Audited on {new Date(audit.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            {/* Issue summary */}
            <div className="flex gap-4 mt-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                <span className="text-[12px] text-gray-600"><b className="text-red-600">{audit.issues_critical ?? 0}</b> critical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
                <span className="text-[12px] text-gray-600"><b className="text-orange-500">{audit.issues_high ?? 0}</b> high</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span className="text-[12px] text-gray-600"><b className="text-amber-600">{audit.issues_medium ?? 0}</b> medium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
                <span className="text-[12px] text-gray-600"><b className="text-blue-600">{audit.issues_low ?? 0}</b> low</span>
              </div>
            </div>
          </div>

          {/* Score rings */}
          <div className="flex gap-6 flex-shrink-0">
            {audit.health_score != null && (
              <ScoreRing score={audit.health_score} label="Health Score" />
            )}
            {audit.seo_score != null && (
              <ScoreRing score={audit.seo_score} label="SEO Score" />
            )}
          </div>

          {/* Export placeholder */}
          <div className="flex-shrink-0">
            <button
              onClick={() => alert('Export coming soon')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Issues */}
      <div>
        <h2 className="text-[14px] font-semibold text-gray-700 mb-3">
          Issues <span className="text-gray-400 font-normal">({issues.length} total)</span>
        </h2>
        {issues.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-[13px] text-gray-400">
            No issues found. Great job!
          </div>
        ) : (
          <div className="space-y-3">
            {SEVERITY_ORDER.map(sev => {
              const group = groupedIssues[sev];
              if (group.length === 0) return null;
              const isOpen = expanded[sev];
              return (
                <div key={sev} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpanded(prev => ({ ...prev, [sev]: !prev[sev] }))}
                    className={`w-full flex items-center justify-between px-5 py-4 text-left ${severityGroupColors[sev]} hover:brightness-95 transition-all`}
                  >
                    <div className="flex items-center gap-3">
                      <SeverityBadge s={sev} />
                      <span className="text-[13px] font-semibold text-gray-700 capitalize">{sev} Issues</span>
                      <span className="text-[11px] bg-white/70 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                        {group.length}
                      </span>
                    </div>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="divide-y divide-gray-50">
                      {group.map(issue => (
                        <div key={issue.id} className={`px-5 py-4 ${severityColors[sev]}`}>
                          <div className="font-semibold text-[13px] text-gray-800 mb-1">{issue.title}</div>
                          <p className="text-[12px] text-gray-500 mb-2">{issue.description}</p>
                          {issue.affected_url && (
                            <div className="text-[11px] text-gray-400 mb-2">
                              <span className="font-semibold text-gray-600">Affected:</span>{' '}
                              <span className="font-mono bg-gray-50 px-1 py-0.5 rounded">{issue.affected_url}</span>
                            </div>
                          )}
                          {issue.how_to_fix && (
                            <div className="mt-2 bg-gray-50 rounded-lg px-3 py-2 text-[12px] text-gray-600">
                              <span className="font-semibold text-gray-700">How to fix: </span>
                              {issue.how_to_fix}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-[14px] font-semibold text-gray-700 mb-3">
            AI Recommendations <span className="text-gray-400 font-normal">({recommendations.length})</span>
          </h2>
          <div className="space-y-3">
            {recommendations.map(rec => (
              <div key={rec.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[13px] font-semibold text-gray-800">{rec.title}</span>
                      <PriorityBadge p={rec.priority} />
                    </div>
                    <p className="text-[12px] text-gray-500 mb-2">{rec.description}</p>
                    {rec.action_items && rec.action_items.length > 0 && (
                      <ul className="space-y-1 mt-2">
                        {rec.action_items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-[12px] text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back link */}
      <div className="pb-4">
        <Link href="/seo-dashboard/audit" className="text-[13px] font-medium text-gray-400 hover:text-indigo-600 transition-colors">
          ← Back to all audits
        </Link>
      </div>
    </div>
  );
}
