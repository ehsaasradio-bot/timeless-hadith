'use client';

// app/shop/admin/page.tsx — Admin Dashboard

import { useEffect, useState } from 'react';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  recentRevenue: number;
  totalProducts: number;
  totalSubscribers: number;
  ordersByStatus: Record<string, number>;
  lowStockItems: { product_id: string; quantity_on_hand: number; low_stock_threshold: number; shop_products: { title: string; sku: string } | null }[];
}

function StatCard({ label, value, sub, color = 'emerald' }: { label: string; value: string; sub?: string; color?: 'emerald' | 'gold' | 'red' }) {
  const colors = {
    emerald: 'bg-[#0D4A3C]/[0.08] text-[#0D4A3C]',
    gold: 'bg-[#C9A84C]/10 text-[#8B6B20]',
    red: 'bg-red-50 text-red-700',
  };
  return (
    <div className="bg-white rounded-2xl border border-[#E8DDD0] p-6">
      <div className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold mb-3 ${colors[color]}`}>
        {label}
      </div>
      <div className="text-[2rem] font-bold text-[#1C1C1E] tracking-tight leading-none">{value}</div>
      {sub && <div className="text-[12px] text-[#888] mt-1">{sub}</div>}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-600',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load');
        return r.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#0D4A3C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 text-[14px]">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[1.6rem] font-bold text-[#1C1C1E] tracking-tight">Dashboard</h1>
        <p className="text-[13px] text-[#888] mt-1">Welcome back, Syed.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Revenue"
          value={`$${(stats?.totalRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          sub="All time"
          color="emerald"
        />
        <StatCard
          label="Last 30 Days"
          value={`$${(stats?.recentRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          sub="Revenue"
          color="gold"
        />
        <StatCard
          label="Total Orders"
          value={String(stats?.totalOrders ?? 0)}
          sub="All statuses"
          color="emerald"
        />
        <StatCard
          label="Subscribers"
          value={String(stats?.totalSubscribers ?? 0)}
          sub="Newsletter"
          color="gold"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders by status */}
        <div className="bg-white rounded-2xl border border-[#E8DDD0] p-6">
          <h2 className="text-[14px] font-semibold text-[#1C1C1E] mb-4">Orders by Status</h2>
          <div className="space-y-2">
            {Object.entries(stats?.ordersByStatus ?? {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between py-2 border-b border-[#F0E8DC] last:border-0">
                <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {status}
                </span>
                <span className="text-[14px] font-bold text-[#1C1C1E]">{count}</span>
              </div>
            ))}
            {Object.keys(stats?.ordersByStatus ?? {}).length === 0 && (
              <p className="text-[13px] text-[#888] text-center py-4">No orders yet</p>
            )}
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="bg-white rounded-2xl border border-[#E8DDD0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-[#1C1C1E]">Low Stock Alerts</h2>
            {(stats?.lowStockItems?.length ?? 0) > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[11px] font-bold rounded-full">
                {stats!.lowStockItems.length}
              </span>
            )}
          </div>
          <div className="space-y-2">
            {(stats?.lowStockItems ?? []).map((item) => (
              <div key={item.product_id} className="flex items-center justify-between py-2 border-b border-[#F0E8DC] last:border-0">
                <div>
                  <div className="text-[13px] font-medium text-[#1C1C1E] leading-tight">
                    {item.shop_products?.title ?? 'Unknown'}
                  </div>
                  <div className="text-[11px] text-[#888]">SKU: {item.shop_products?.sku}</div>
                </div>
                <div className="text-right">
                  <div className="text-[16px] font-bold text-red-600">{item.quantity_on_hand}</div>
                  <div className="text-[11px] text-[#888]">of {item.low_stock_threshold} min</div>
                </div>
              </div>
            ))}
            {(stats?.lowStockItems ?? []).length === 0 && (
              <div className="flex items-center gap-2 text-[13px] text-[#888] py-4 justify-center">
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" stroke="#0D4A3C" strokeWidth="1.3" />
                  <path d="M5 8l2 2 4-4" stroke="#0D4A3C" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                All stock levels are healthy
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-6 flex gap-3 flex-wrap">
        <a
          href="/shop/admin/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D4A3C] text-white text-[13px] font-semibold rounded-xl hover:bg-[#1A6B54] transition-colors"
        >
          Add Product
        </a>
        <a
          href="/shop/admin/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E8DDD0] text-[#1C1C1E] text-[13px] font-semibold rounded-xl hover:bg-[#FAF7F2] transition-colors"
        >
          Manage Orders
        </a>
      </div>
    </div>
  );
}
