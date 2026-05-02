'use client';

import { useState } from 'react';

type ScoreCategory = {
  label: string;
  score: number;
  message: string;
};

type ContentResult = {
  overall_score: number;
  categories: ScoreCategory[];
  tips: string[];
};

function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  const r    = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = Math.max(0, Math.min(score, 100)) / 100;
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  const label = score >= 70 ? 'Good' : score >= 40 ? 'Needs Work' : 'Poor';
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f4f6" strokeWidth="12" />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="12"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{score}</span>
          <span className="text-[10px] text-gray-400 font-medium">/100</span>
        </div>
      </div>
      <span className="text-[13px] font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-400' : 'bg-red-400';
  const dot   = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className={`h-1.5 rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[12px] font-semibold text-gray-600 w-7 text-right">{score}</span>
    </div>
  );
}

export default function ContentOptimizerPage() {
  const [form, setForm] = useState({
    focus_keyword: '',
    url: '',
    title: '',
    meta_description: '',
    content: '',
    secondary_keywords: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContentResult | null>(null);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/seo/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed');
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Optimizer</h1>
        <p className="text-[13px] text-gray-400 mt-1">
          Analyze your page content for SEO quality — keyword usage, readability, meta tags, and more.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-[14px] font-semibold text-gray-700 mb-5">Page Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1">
                Focus Keyword <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="focus_keyword"
                value={form.focus_keyword}
                onChange={handleChange}
                required
                placeholder="e.g. best running shoes"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1">
                Page URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="url"
                value={form.url}
                onChange={handleChange}
                required
                placeholder="https://example.com/page"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1">Page Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Best Running Shoes 2025 | Brand"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              {form.title && (
                <div className={`mt-1 text-[10px] font-medium ${form.title.length < 50 ? 'text-amber-500' : form.title.length > 60 ? 'text-red-500' : 'text-green-600'}`}>
                  {form.title.length} / 60 chars
                </div>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1">Meta Description</label>
              <input
                type="text"
                name="meta_description"
                value={form.meta_description}
                onChange={handleChange}
                placeholder="Write a compelling 150–160 char description"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              {form.meta_description && (
                <div className={`mt-1 text-[10px] font-medium ${form.meta_description.length < 120 ? 'text-amber-500' : form.meta_description.length > 160 ? 'text-red-500' : 'text-green-600'}`}>
                  {form.meta_description.length} / 160 chars
                </div>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1">
                Content Body <span className="text-gray-400 font-normal">(paste your page content)</span>
              </label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={10}
                placeholder="Paste the full body text of your page here for analysis…"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-y min-h-[160px]"
              />
              {form.content && (
                <div className="mt-1 text-[10px] text-gray-400">
                  {form.content.split(/\s+/).filter(Boolean).length} words
                </div>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1">
                Secondary Keywords <span className="text-gray-400 font-normal">(comma-separated)</span>
              </label>
              <input
                type="text"
                name="secondary_keywords"
                value={form.secondary_keywords}
                onChange={handleChange}
                placeholder="e.g. trail running shoes, lightweight running shoes"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-700 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !form.focus_keyword.trim() || !form.url.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white text-[14px] font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Analyzing Content…
                </>
              ) : 'Analyze Content'}
            </button>
          </form>
        </div>

        {/* Right: Results */}
        <div className="space-y-5">
          {!result && !loading && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-3">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p className="text-[13px] text-gray-400">Fill in the form and click Analyze Content to see your SEO score and recommendations.</p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
              <svg className="animate-spin mx-auto mb-3 text-indigo-500" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              <p className="text-[13px] text-gray-400">Analyzing your content for SEO signals…</p>
            </div>
          )}

          {result && !loading && (
            <>
              {/* Overall score */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-3">
                <ScoreRing score={result.overall_score} size={110} />
                <div className="text-[13px] font-medium text-gray-500 text-center">Overall SEO Score</div>
              </div>

              {/* Category breakdown */}
              {result.categories && result.categories.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-[13px] font-semibold text-gray-700 mb-4">Score Breakdown</h3>
                  <div className="space-y-3">
                    {result.categories.map((cat, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-gray-700">{cat.label}</span>
                        </div>
                        <ScoreBar score={cat.score} />
                        <p className="text-[11px] text-gray-400 pl-4">{cat.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {result.tips && result.tips.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Improvement Tips</h3>
                  <ul className="space-y-2">
                    {result.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
