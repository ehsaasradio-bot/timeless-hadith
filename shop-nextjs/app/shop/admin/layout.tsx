'use client';

// app/shop/admin/layout.tsx
// BMW M-inspired admin layout — black canvas, Inter, red accent

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const AdminAuthContext = createContext<{ logout: () => void }>({ logout: () => {} });
export const useAdminAuth = () => useContext(AdminAuthContext);

// ─── Login Gate ───────────────────────────────────────────────────────────────

function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [secret, setSecret]   = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret }),
    });
    setLoading(false);
    if (res.ok) { onLogin(); } else { setError('INVALID PASSWORD. TRY AGAIN.'); }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-10">
          <div className="w-8 h-[3px] bg-[#CC0000] mb-6" />
          <div className="text-[10px] font-semibold tracking-[0.2em] text-white/40 uppercase mb-2">
            Timeless Hadith Shop
          </div>
          <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">
            ADMIN<br />ACCESS
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-[10px] font-semibold tracking-[0.18em] text-white/40 uppercase mb-2" htmlFor="admin-secret">
            Password
          </label>
          <input
            id="admin-secret"
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            autoFocus
            autoComplete="current-password"
            className="w-full px-4 py-3.5 bg-white/[0.05] border border-white/10 text-white text-[14px] tracking-wide focus:outline-none focus:border-[#CC0000] transition-colors mb-4 placeholder:text-white/20"
            placeholder="••••••••"
            required
            disabled={loading}
            style={{ borderRadius: 0 }}
          />
          {error && (
            <p className="text-[10px] font-semibold tracking-[0.15em] text-[#CC0000] mb-4 uppercase">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !secret}
            className="w-full py-3.5 bg-[#CC0000] text-white text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#E00000] transition-colors disabled:opacity-40"
            style={{ borderRadius: 0 }}
          >
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/[0.06]">
          <Link href="/shop" className="text-[10px] tracking-[0.15em] text-white/30 uppercase hover:text-white/60 transition-colors">
            ← Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Nav Items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/shop/admin',
    icon: (
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.4" />
        <rect x="9" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.4" />
        <rect x="1" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.4" />
        <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    label: 'Products',
    href: '/shop/admin/products',
    icon: (
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="12" height="12" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Orders',
    href: '/shop/admin/orders',
    icon: (
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
        <path d="M2 2h2l2 6h6l1.5-4H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6.5" cy="12.5" r="1" fill="currentColor" />
        <circle cx="11.5" cy="12.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'Reviews',
    href: '/shop/admin/reviews',
    icon: (
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
        <path d="M8 1l2 4 4.5.7-3.3 3.2.8 4.5L8 11.3 4 13.4l.8-4.5L1.5 5.7 6 5z" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function SidebarContent({ pathname, onLogout, onNavClick }: {
  pathname: string;
  onLogout: () => void;
  onNavClick?: () => void;
}) {
  return (
    <div className="flex flex-col h-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/[0.06]">
        <div className="w-6 h-[2px] bg-[#CC0000] mb-4" />
        <div className="text-[10px] font-semibold tracking-[0.2em] text-white/30 uppercase">Admin Panel</div>
        <div className="text-[13px] font-bold text-white mt-0.5 tracking-wide">TIMELESS HADITH</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-px" aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold tracking-[0.12em] uppercase transition-all ${
                isActive
                  ? 'bg-[#CC0000] text-white'
                  : 'text-white/40 hover:bg-white/[0.05] hover:text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/[0.06] space-y-px">
        <Link
          href="/shop"
          target="_blank"
          onClick={onNavClick}
          className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-white/30 hover:bg-white/[0.05] hover:text-white transition-all"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
            <path d="M10 2h4v4M14 2L8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M7 4H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          View Shop
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-white/30 hover:bg-white/[0.05] hover:text-white transition-all text-left"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
            <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── Admin Layout ─────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking]           = useState(true);
  const [drawerOpen, setDrawerOpen]       = useState(false);
  const pathname = usePathname();
  const router   = useRouter();

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => { setAuthenticated(r.ok); setChecking(false); })
      .catch(() => setChecking(false));
  }, []);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setAuthenticated(false);
    router.push('/shop/admin');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#CC0000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) return <LoginGate onLogin={() => setAuthenticated(true)} />;

  return (
    <AdminAuthContext.Provider value={{ logout: handleLogout }}>
      <div className="min-h-screen bg-[#0A0A0A] flex" style={{ fontFamily: 'Inter, sans-serif' }}>

        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-52 bg-[#111111] flex-col flex-shrink-0 border-r border-white/[0.06]">
          <SidebarContent pathname={pathname} onLogout={handleLogout} />
        </aside>

        {/* Mobile backdrop */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 bg-black/70 md:hidden" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
        )}

        {/* Mobile drawer */}
        <aside
          className={`fixed top-0 left-0 z-50 h-full w-56 bg-[#111111] flex flex-col flex-shrink-0 border-r border-white/[0.06] transition-transform duration-300 ease-in-out md:hidden ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
          aria-label="Admin navigation"
          aria-hidden={!drawerOpen}
        >
          <button
            onClick={() => setDrawerOpen(false)}
            className="absolute top-4 right-4 p-1.5 text-white/30 hover:text-white transition-colors"
            aria-label="Close navigation"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <SidebarContent pathname={pathname} onLogout={handleLogout} onNavClick={() => setDrawerOpen(false)} />
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 overflow-auto">
          {/* Mobile top bar */}
          <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#111111] border-b border-white/[0.06] flex-shrink-0">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 text-white/50 hover:text-white transition-colors"
              aria-label="Open navigation"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M1 3.5h14M1 8h14M1 12.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <span className="text-[11px] font-bold tracking-[0.18em] text-white uppercase">Admin Panel</span>
          </header>

          <main className="flex-1">
            <div className="max-w-6xl mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminAuthContext.Provider>
  );
}
