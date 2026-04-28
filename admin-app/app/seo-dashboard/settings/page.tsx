'use client';

import { useState } from 'react';

type ToastType = 'success' | 'error';

function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  function show(message: string, type: ToastType = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  return { toast, show };
}

function Toast({ toast }: { toast: { message: string; type: 'success' | 'error' } | null }) {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-[13px] font-medium transition-all ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
      {toast.type === 'success' ? (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      )}
      {toast.message}
    </div>
  );
}

type Site = { id: string; domain: string; name: string };

export default function SettingsPage() {
  const { toast, show } = useToast();

  // AI settings
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [savingAI, setSavingAI] = useState(false);

  // Crawl settings
  const [maxPages, setMaxPages] = useState(50);
  const [crawlDelay, setCrawlDelay] = useState(500);
  const [userAgent, setUserAgent] = useState('SEOCommandCenter/1.0 (+https://timelesshadith.com)');
  const [savingCrawl, setSavingCrawl] = useState(false);

  // Site management
  const [newDomain, setNewDomain] = useState('');
  const [newName, setNewName] = useState('');
  const [addingSite, setAddingSite] = useState(false);
  const [sites, setSites] = useState<Site[]>([
    { id: '1', domain: 'timelesshadith.com', name: 'Timeless Hadith' },
  ]);

  function handleSaveAI(e: React.FormEvent) {
    e.preventDefault();
    setSavingAI(true);
    console.log('AI settings saved:', { apiKey: apiKey ? '***' : '', model });
    setTimeout(() => {
      setSavingAI(false);
      show('AI settings saved successfully');
    }, 600);
  }

  function handleSaveCrawl(e: React.FormEvent) {
    e.preventDefault();
    setSavingCrawl(true);
    console.log('Crawl settings saved:', { maxPages, crawlDelay, userAgent });
    setTimeout(() => {
      setSavingCrawl(false);
      show('Crawl settings saved successfully');
    }, 600);
  }

  function handleAddSite(e: React.FormEvent) {
    e.preventDefault();
    if (!newDomain.trim()) return;
    setAddingSite(true);
    console.log('Adding site:', { domain: newDomain, name: newName });
    setTimeout(() => {
      setSites(prev => [...prev, {
        id: Date.now().toString(),
        domain: newDomain.trim(),
        name: newName.trim() || newDomain.trim(),
      }]);
      setNewDomain('');
      setNewName('');
      setAddingSite(false);
      show('Site added successfully');
    }, 600);
  }

  function handleRemoveSite(id: string) {
    setSites(prev => prev.filter(s => s.id !== id));
    show('Site removed');
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <Toast toast={toast} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-[13px] text-gray-400 mt-1">
          Configure your AI provider, crawl behavior, and managed sites.
        </p>
      </div>

      {/* AI Settings */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h2 className="text-[14px] font-semibold text-gray-800">AI Settings</h2>
        </div>
        <form onSubmit={handleSaveAI} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-…"
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition font-mono"
            />
            <p className="mt-1 text-[11px] text-gray-400">
              Your key is stored locally and never sent to any third party. Required for AI recommendations, content analysis, and report generation.
            </p>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Model</label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
            >
              <option value="gpt-4o-mini">GPT-4o Mini (faster, cheaper)</option>
              <option value="gpt-4o">GPT-4o (more powerful, higher cost)</option>
            </select>
            <p className="mt-1 text-[11px] text-gray-400">
              GPT-4o Mini is recommended for most tasks. Use GPT-4o for more complex content analysis.
            </p>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={savingAI}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {savingAI ? (
                <>
                  <svg className="animate-spin" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Saving…
                </>
              ) : 'Save AI Settings'}
            </button>
          </div>
        </form>
      </section>

      {/* Crawl Settings */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <h2 className="text-[14px] font-semibold text-gray-800">Crawl Settings</h2>
        </div>
        <form onSubmit={handleSaveCrawl} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                Max Pages per Crawl
              </label>
              <input
                type="number"
                value={maxPages}
                onChange={e => setMaxPages(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))}
                min={1}
                max={200}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              <p className="mt-1 text-[11px] text-gray-400">1–200 pages</p>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                Crawl Delay (ms)
              </label>
              <input
                type="number"
                value={crawlDelay}
                onChange={e => setCrawlDelay(Math.max(0, parseInt(e.target.value) || 0))}
                min={0}
                step={100}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              <p className="mt-1 text-[11px] text-gray-400">Delay between requests</p>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">User Agent String</label>
            <input
              type="text"
              value={userAgent}
              onChange={e => setUserAgent(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition font-mono"
            />
            <p className="mt-1 text-[11px] text-gray-400">
              Used when making HTTP requests during audits. Include a contact URL so site owners can reach you.
            </p>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={savingCrawl}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {savingCrawl ? (
                <>
                  <svg className="animate-spin" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Saving…
                </>
              ) : 'Save Crawl Settings'}
            </button>
          </div>
        </form>
      </section>

      {/* Site Management */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
          </svg>
          <h2 className="text-[14px] font-semibold text-gray-800">Site Management</h2>
        </div>
        <div className="px-6 py-5 space-y-5">
          {/* Add site form */}
          <form onSubmit={handleAddSite} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Domain</label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={e => setNewDomain(e.target.value)}
                  placeholder="example.com"
                  required
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Site Name (optional)</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="My Website"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={addingSite || !newDomain.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {addingSite ? (
                <>
                  <svg className="animate-spin" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Adding…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add Site
                </>
              )}
            </button>
          </form>

          {/* Sites list */}
          {sites.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Managed Sites</div>
              <ul className="space-y-2">
                {sites.map(site => (
                  <li key={site.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-gray-800">{site.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{site.domain}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveSite(site.id)}
                      className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove site"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
