'use client';

// app/shop/admin/layout.tsx
// Protected admin layout — sidebar on desktop, hamburger drawer on mobile

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// ─── Auth Context ─────────────────────────────────────────────────────────────

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
    if (res.ok) {
      onLogin();
    } else {
      setError('Invalid admin password. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E8DDD0] shadow-sm p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#0D4A3C] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
              <path d="M12 2L4 6v6c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V6L12 2z" fill="white" opacity="0.9" />
            </svg>
          </div>
          <h1 className="text-[18px] font-bold text-[#1C1C1E]">Admin Access</h1>
          <p className="text-[13px] text-[#888] mt-1">Timeless Hadith Shop</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-2" htmlFor="admin-secret">
            Admin Password
          </label>
          <input
            id="admin-secret"
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            autoFocus
            autoComplete="current-password"
            className="w-full px-4 py-3 border border-[#E8DDD0] rounded-xl text-[14px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C] transition-all mb-3"
            placeholder="••••••••"
            required
            disabled={loading}
          />
          {error && <p className="text-[12px] text-red-500 mb-3">{error}</p>}
          <button
            type="submit"
            disabled={loading || !secret}
            className="w-full py-3 bg-[#0D4A3C] text-white text-[14px] font-semibold rounded-xl hover:bg-[#1A6B54] transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#0D4A3C] focus:ring-offset-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Sidebar nav items ────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/shop/admin',
    icon: (
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    label: 'Products',
    href: '/shop/admin/products',
    icon: (
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Orders',
    href: '/shop/admin/orders',
    icon: (
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
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
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
        <path d="M8 1l2 4 4.5.7-3.3 3.2.8 4.5L8 11.3 4 13.4l.8-4.5L1.5 5.7 6 5z" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
];

// ─── Shared sidebar content ───────────────────────────────────────────────────

function SidebarContent({
  pathname,
  onLogout,
  onNavClick,
}: {
  pathname: string;
  onLogout: () => void;
  onNavClick?: () => void;
}) {
  return (
    <>
      {/* Brand */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="text-[15px] font-bold text-white tracking-tight">Timeless Hadith</div>
        <div className="text-[11px] text-white/50 mt-0.5">Admin Panel</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/[0.08] hover:text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: back to shop + logout */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/shop"
          target="_blank"
          onClick={onNavClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
            <path d="M10 2h4v4M14 2L8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M7 4H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          View Shop
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all text-left"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
            <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sign Out
        </button>
      </div>
    </>
  );
}

// ─── Admin Layout ─────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking]           = useState(true);
  const [drawerOpen, setDrawerOpen]       = useState(false);
  const pathname = usePathname();
  const router   = useRouter();

  // Verify session on mount
  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => {
        setAuthenticated(r.ok);
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setAuthenticated(false);
    router.push('/shop/admin');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0D4A3C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return <LoginGate onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <AdminAuthContext.Provider value={{ logout: handleLogout }}>
      <div className="min-h-screen bg-[#F5F0EA] flex">

        {/* ── Desktop sidebar (hidden on mobile) ───────────────────────────── */}
        <aside
          className="hidden md:flex w-56 bg-[#0D4A3C] flex-col flex-shrink-0"
          aria-label="Admin navigation"
        >
          <SidebarContent pathname={pathname} onLogout={handleLogout} />
        </aside>

        {/* ── Mobile drawer backdrop ────────────────────────────────────────── */}
        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── Mobile drawer panel ───────────────────────────────────────────── */}
        <aside
          className={`
            fixed top-0 left-0 z-50 h-full w-64 bg-[#0D4A3C] flex flex-col flex-shrink-0
            transition-transform duration-300 ease-in-out
            md:hidden
            ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          aria-label="Admin navigation"
          aria-hidden={!drawerOpen}
        >
          {/* Close button inside drawer */}
          <button
            onClick={() => setDrawerOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close navigation"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          <SidebarContent
            pathname={pathname}
            onLogout={handleLogout}
            onNavClick={() => setDrawerOpen(false)}
          />
        </aside>

        {/* ── Main content ──────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-auto">
          {/* Mobile top bar with hamburger */}
          <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-[#E8DDD0] flex-shrink-0">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-xl hover:bg-[#F5F0EA] transition-colors"
              aria-label="Open navigation"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <span className="text-[14px] font-semibold text-[#1C1C1E]">Admin Panel</span>
          </header>

          {/* Page content */}
          <main className="flex-1">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminAuthContext.Provider>
  );
}
