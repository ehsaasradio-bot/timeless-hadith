'use client';

import { useState, useEffect } from 'react';

type AuditRow = {
  id: string;
  url: string;
  status: string;
  health_score: number | null;
  seo_score: number | null;
  issues_critical: number | null;
  created_at: string;
};

export default function ReportsPage() {
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [loadingAudits, setLoadingAudits] = useState(true);

  // Weekly plan state
  const [weeklyPlan, setWeeklyPlan] = useState('');
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [planError, setPlanError] = useState('');

  // Blog ideas state
  const [blogKeyword, setBlogKeyword] = useState('');
  const [blogDomain, setBlogDomain] = useState('');
  const [blogIdeas, setBlogIdeas] = useState('');
  const [loadingBlogIdeas, setLoadingBlogIdeas] = useState(false);
  const [blogIdeasError, setBlogIdeasError] = useState('');

  // FAQ schema state
  const [faqTopic, setFaqTopic] = useState('');
  const [faqKeyword, setFaqKeyword] = useState('');
  const [faqSchema, setFaqSchema] = useState('');
  const [loadingFaq, setLoadingFaq] = useState(false);
  const [faqError, setFaqError] = useState('');

  useEffect(() => {
    fetch('/api/seo/audit')
      .then(r => r.json())
      .then(d => { setAudits(d.audits ?? []); setLoadingAudits(false); })
      .catch(() => setLoadingAudits(false));
  }, []);

  const totalAudits = audits.length;
  const completeAudits = audits.filter(a => a.status === 'complete');
  const avgHealth = completeAudits.length
    ? Math.round(completeAudits.reduce((s, a) => s + (a.health_score ?? 0), 0) / completeAudits.length)
    : 0;
  const totalCritical = audits.reduce((s, a) => s + (a.issues_critical ?? 0), 0);

  async function generateWeeklyPlan() {
    setPlanError('');
    setLoadingPlan(true);
    try {
      const res = await fetch('/api/seo/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'weekly_plan' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate plan');
      setWeeklyPlan(data.result ?? data.plan ?? JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      setPlanError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoadingPlan(false);
    }
  }

  async function generateBlogIdeas(e: React.FormEvent) {
    e.preventDefault();
    setBlogIdeasError('');
    setLoadingBlogIdeas(true);
    try {
      const res = await fetch('/api/seo/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'blog_ideas', keyword: blogKeyword, domain: blogDomain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate ideas');
      setBlogIdeas(data.result ?? data.ideas ?? JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      setBlogIdeasError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoadingBlogIdeas(false);
    }
  }

  async function generateFaqSchema(e: React.FormEvent) {
    e.preventDefault();
    setFaqError('');
    setLoadingFaq(true);
    try {
      const res = await fetch('/api/seo/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'faq_schema', topic: faqTopic, keyword: faqKeyword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate schema');
      const schema = data.result ?? data.schema ?? data;
      setFaqSchema(typeof schema === 'string' ? schema : JSON.stringify(schema, null, 2));
    } catch (err: unknown) {
      setFaqError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoadingFaq(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-[13px] text-gray-400 mt-1">
            SEO summary, AI weekly plan, blog ideas, and FAQ schema generator.
          </p>
        </div>
        <button
          onClick={() => alert('Full report export coming soon')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-[13px] font-semibold hover:bg-indigo-700 transition-all"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Generate Report
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Audits Run',      value: loadingAudits ? '…' : totalAudits,   color: 'text-indigo-600', sub: 'all time' },
          { label: 'Avg Health Score',      value: loadingAudits ? '…' : (completeAudits.length ? avgHealth : '—'), color: avgHealth >= 70 ? 'text-green-600' : avgHealth >= 40 ? 'text-amber-600' : 'text-red-600', sub: `from ${completeAudits.length} complete audits` },
          { label: 'Total Critical Issues', value: loadingAudits ? '…' : totalCritical, color: totalCritical > 0 ? 'text-red-600' : 'text-green-600', sub: 'across all pages' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{s.label}</div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[11px] text-gray-400 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Audit timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-[14px] font-semibold text-gray-700 mb-4">Audit History</h2>
        {loadingAudits ? (
          <div className="text-[13px] text-gray-400 py-4">Loading…</div>
        ) : audits.length === 0 ? (
          <div className="text-[13px] text-gray-400 py-4">No audits run yet.</div>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-100" />
            <ul className="space-y-4 pl-8">
              {audits.slice(0, 15).map((a, i) => (
                <li key={a.id} className="relative">
                  <div className={`absolute -left-5 w-2.5 h-2.5 rounded-full border-2 border-white ${a.status === 'complete' ? 'bg-green-400' : a.status === 'running' ? 'bg-indigo-400 animate-pulse' : a.status === 'failed' ? 'bg-red-400' : 'bg-gray-300'}`} style={{ top: 4 }} />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-gray-800 truncate">{a.url}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {a.health_score != null && ` · Health: ${a.health_score}`}
                        {a.issues_critical != null && a.issues_critical > 0 && (
                          <span className="text-red-500"> · {a.issues_critical} critical</span>
                        )}
                      </div>
                    </div>
                    <span className={`flex-shrink-0 inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                      a.status === 'complete' ? 'bg-green-100 text-green-700' :
                      a.status === 'running'  ? 'bg-indigo-100 text-indigo-700' :
                      a.status === 'failed'   ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            {audits.length > 15 && (
              <p className="text-[12px] text-gray-400 pl-8 mt-3">
                + {audits.length - 15} more audits not shown
              </p>
            )}
          </div>
        )}
      </div>

      {/* AI Weekly Plan */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-[14px] font-semibold text-gray-700">AI Weekly SEO Plan</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">Generate a prioritized 7-day action plan based on your audit data.</p>
          </div>
          <button
            onClick={generateWeeklyPlan}
            disabled={loadingPlan}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-[13px] font-semibold hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {loadingPlan ? (
              <>
                <svg className="animate-spin" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Generating…
              </>
            ) : 'Generate Plan'}
          </button>
        </div>

        {planError && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-700 mb-3">{planError}</div>
        )}

        {weeklyPlan ? (
          <div className="rounded-xl bg-violet-50 border border-violet-100 px-5 py-4">
            <pre className="text-[12px] text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{weeklyPlan}</pre>
          </div>
        ) : !loadingPlan && (
          <div className="rounded-xl border border-dashed border-gray-200 px-5 py-6 text-center text-[12px] text-gray-400">
            Click Generate Plan to get a tailored weekly SEO action plan.
          </div>
        )}
      </div>

      {/* Blog Ideas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-[14px] font-semibold text-gray-700 mb-1">Blog Idea Generator</h2>
        <p className="text-[12px] text-gray-400 mb-4">Generate SEO-optimized blog post ideas for your keyword and domain.</p>
        <form onSubmit={generateBlogIdeas} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={blogKeyword}
            onChange={e => setBlogKeyword(e.target.value)}
            placeholder="Target keyword (e.g. hadith about patience)"
            required
            className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <input
            type="text"
            value={blogDomain}
            onChange={e => setBlogDomain(e.target.value)}
            placeholder="Your domain (e.g. timelesshadith.com)"
            className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={loadingBlogIdeas || !blogKeyword.trim()}
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-[13px] font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all whitespace-nowrap"
          >
            {loadingBlogIdeas ? (
              <>
                <svg className="animate-spin" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Generating…
              </>
            ) : 'Generate Ideas'}
          </button>
        </form>
        {blogIdeasError && (
          <div className="mt-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-700">{blogIdeasError}</div>
        )}
        {blogIdeas && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 px-5 py-4">
            <pre className="text-[12px] text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{blogIdeas}</pre>
          </div>
        )}
      </div>

      {/* FAQ Schema */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-[14px] font-semibold text-gray-700 mb-1">FAQ Schema Generator</h2>
        <p className="text-[12px] text-gray-400 mb-4">Generate FAQ JSON-LD structured data to add to your pages for rich results.</p>
        <form onSubmit={generateFaqSchema} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={faqTopic}
            onChange={e => setFaqTopic(e.target.value)}
            placeholder="Topic (e.g. The Five Pillars of Islam)"
            required
            className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <input
            type="text"
            value={faqKeyword}
            onChange={e => setFaqKeyword(e.target.value)}
            placeholder="Focus keyword (optional)"
            className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={loadingFaq || !faqTopic.trim()}
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white text-[13px] font-semibold hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all whitespace-nowrap"
          >
            {loadingFaq ? (
              <>
                <svg className="animate-spin" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Generating…
              </>
            ) : 'Generate Schema'}
          </button>
        </form>
        {faqError && (
          <div className="mt-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-700">{faqError}</div>
        )}
        {faqSchema && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold text-gray-600">JSON-LD Schema</span>
              <button
                onClick={() => { navigator.clipboard.writeText(faqSchema); }}
                className="text-[11px] font-medium text-indigo-600 hover:underline"
              >
                Copy
              </button>
            </div>
            <pre className="rounded-xl bg-gray-900 text-green-300 px-5 py-4 text-[11px] font-mono leading-relaxed overflow-x-auto">
              {faqSchema}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
