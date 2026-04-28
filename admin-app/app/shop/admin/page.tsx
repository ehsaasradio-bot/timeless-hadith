'use client';

// app/shop/admin/page.tsx — Admin Dashboard
// BMW M design system: black canvas, Inter, #CC0000 red accent, uppercase tracking, zero border-radius

import { useEffect, useState } from 'react';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  recentRevenue: number;
  totalProducts: number;
  totalSubscribers: number;
  ordersByStatus: Record<string, number>;
  lowStockItems: {
    product_id: string;
    quantity_on_hand: number;
    low_stock_threshold: number;
    shop_products: { title: string; sku: string } | null;
  }[];
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="bg-[#111111] border border-white/[0.06] p-6 flex flex-col gap-4 relative overflow-hidden"
      style={{ borderRadius: 0 }}
    >
      {/* Top accent bar */}
      {accent && <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#CC0000]" />}

      <div className="text-[10px] font-semibold tracking-[0.18em] text-white/40 uppercase">
        {label}
      </div>

      <div>
        <div className="text-[2rem] font-bold text-white leading-none tracking-tight">
          {value}
        </div>
        {sub && (
          <div className="text-[11px] text-white/30 mt-1.5 tracking-wide">{sub}</div>
        )}
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { bg: string; text: string }> = {
  pending:    { bg: 'bg-white/[0.07]',       text: 'text-white/60' },
  confirmed:  { bg: 'bg-white/[0.07]',       text: 'text-white/60' },
  processing: { bg: 'bg-white/[0.07]',       text: 'text-white/60' },
  shipped:    { bg: 'bg-white/[0.07]',       text: 'text-white/80' },
  delivered:  { bg: 'bg-white/[0.07]',       text: 'text-white/80' },
  cancelled:  { bg: 'bg-[#CC0000]/10',       text: 'text-[#CC0000]' },
  refunded:   { bg: 'bg-white/[0.04]',       text: 'text-white/30' },
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load stats');
        return r.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-5 h-5 border-2 border-[#CC0000] border-t-transparent animate-spin"
          style={{ borderRadius: '50%' }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="border border-[#CC0000]/30 bg-[#CC0000]/5 p-6"
        style={{ borderRadius: 0 }}
      >
        <p className="text-[10px] font-semibold tracking-[0.18em] text-[#CC0000] uppercase">{error}</p>
      </div>
    );
  }

  const totalRevenue   = stats?.totalRevenue   ?? 0;
  const recentRevenue  = stats?.recentRevenue  ?? 0;
  const totalOrders    = stats?.totalOrders    ?? 0;
  const totalSubscribers = stats?.totalSubscribers ?? 0;
  const ordersByStatus = stats?.ordersByStatus ?? {};
  const lowStockItems  = stats?.lowStockItems  ?? [];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="w-6 h-[2px] bg-[#CC0000] mb-5" />
        <h1 className="text-[22px] font-bold text-white tracking-tight uppercase">
          Dashboard
        </h1>
        <p className="text-[11px] tracking-[0.12em] text-white/30 mt-1 uppercase">
          Timeless Hadith Shop — Overview
        </p>
      </div>

      {/* ── Stat grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] mb-px">
        <StatCard
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          sub="All time"
          accent
        />
        <StatCard
          label="Last 30 Days"
          value={`$${recentRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          sub="Revenue"
        />
        <StatCard
          label="Total Orders"
          value={String(totalOrders)}
          sub="All statuses"
          accent
        />
        <StatCard
          label="Subscribers"
          value={String(totalSubscribers)}
          sub="Newsletter"
        />
      </div>

      {/* ── Two-column panels ─────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-px bg-white/[0.04] mt-px mb-8">

        {/* Orders by Status */}
        <div className="bg-[#111111] border border-white/[0.06] p-6" style={{ borderRadius: 0 }}>
          <div className="text-[10px] font-semibold tracking-[0.18em] text-white/40 uppercase mb-5">
            Orders by Status
          </div>
          <div className="divide-y divide-white/[0.04]">
            {Object.entries(ordersByStatus).map(([status, count]) => {
              const style = STATUS_MAP[status] ?? { bg: 'bg-white/[0.07]', text: 'text-white/60' };
              return (
                <div key={status} className="flex items-center justify-between py-3">
                  <span
                    className={`inline-flex px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase ${style.bg} ${style.text}`}
                    style={{ borderRadius: 0 }}
                  >
                    {status}
                  </span>
                  <span className="text-[16px] font-bold text-white tabular-nums">{count}</span>
                </div>
              );
            })}
            {Object.keys(ordersByStatus).length === 0 && (
              <p className="text-[11px] text-white/20 py-6 text-center tracking-wide">
                No orders yet
              </p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-[#111111] border border-white/[0.06] p-6" style={{ borderRadius: 0 }}>
          <div className="flex items-center justify-between mb-5">
            <div className="text-[10px] font-semibold tracking-[0.18em] text-white/40 uppercase">
              Low Stock Alerts
            </div>
            {lowStockItems.length > 0 && (
              <span
                className="px-2 py-0.5 bg-[#CC0000] text-white text-[10px] font-bold tracking-[0.1em]"
                style={{ borderRadius: 0 }}
              >
                {lowStockItems.length}
              </span>
            )}
          </div>

          <div className="divide-y divide-white/[0.04]">
            {lowStockItems.map((item) => (
              <div key={item.product_id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-[13px] font-medium text-white leading-tight">
                    {item.shop_products?.title ?? 'Unknown'}
                  </div>
                  <div className="text-[10px] text-white/30 mt-0.5 tracking-wide">
                    SKU: {item.shop_products?.sku}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[18px] font-bold text-[#CC0000] tabular-nums leading-none">
                    {item.quantity_on_hand}
                  </div>
                  <div className="text-[10px] text-white/30 mt-0.5">
                    min {item.low_stock_threshold}
                  </div>
                </div>
              </div>
            ))}

            {lowStockItems.length === 0 && (
              <div className="flex items-center gap-2.5 py-6 justify-center">
                {/* Checkmark icon */}
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
                  <rect x="1.5" y="1.5" width="13" height="13" stroke="#CC0000" strokeWidth="1.3" />
                  <path d="M4.5 8l2.5 2.5 4.5-5" stroke="#CC0000" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[11px] text-white/30 tracking-[0.1em] uppercase">
                  All stock levels healthy
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06] pt-6">
        <div className="text-[10px] font-semibold tracking-[0.18em] text-white/30 uppercase mb-4">
          Quick Actions
        </div>
        <div className="flex gap-3 flex-wrap">
          <a
            href="/shop/admin/products"
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#CC0000] text-white text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-[#E00000] transition-colors"
            style={{ borderRadius: 0 }}
          >
            {/* Plus icon */}
            <svg viewBox="0 0 14 14" width="12" height="12" fill="none" aria-hidden="true">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Add Product
          </a>
          <a
            href="/shop/admin/orders"
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-transparent border border-white/[0.12] text-white/60 text-[11px] font-bold tracking-[0.15em] uppercase hover:border-white/30 hover:text-white transition-colors"
            style={{ borderRadius: 0 }}
          >
            {/* Orders icon */}
            <svg viewBox="0 0 14 14" width="12" height="12" fill="none" aria-hidden="true">
              <path d="M1 1h2l2 6h6l1.5-4H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="5.5" cy="11.5" r="1" fill="currentColor" />
              <circle cx="10.5" cy="11.5" r="1" fill="currentColor" />
            </svg>
            Manage Orders
          </a>
          <a
            href="/shop/admin/reviews"
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-transparent border border-white/[0.12] text-white/60 text-[11px] font-bold tracking-[0.15em] uppercase hover:border-white/30 hover:text-white transition-colors"
            style={{ borderRadius: 0 }}
          >
            {/* Star icon */}
            <svg viewBox="0 0 14 14" width="12" height="12" fill="none" aria-hidden="true">
              <path d="M7 1l1.8 3.6L13 5.3l-3 2.9.7 4.1L7 10.4 3.3 12.3 4 8.2 1 5.3l4.2-.7z" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            Reviews
          </a>
        </div>
      </div>
    </div>
  );
}
