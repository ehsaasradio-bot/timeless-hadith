'use client';

// app/shop/admin/orders/page.tsx — Order management

import { useEffect, useState, useCallback } from 'react';

interface OrderItem { product_title: string; quantity: number; unit_price: number; line_total: number }
interface AdminOrder {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  customer_name: string;
  customer_email: string;
  total: number;
  currency: string;
  tracking_number: string | null;
  carrier: string | null;
  created_at: string;
  shop_order_items: OrderItem[];
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-500',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [updating, setUpdating] = useState(false);
  const [trackingForm, setTrackingForm] = useState({ status: '', tracking: '', carrier: '', notes: '' });
  const [updateError, setUpdateError] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const url = `/api/admin/orders${statusFilter ? `?status=${statusFilter}` : ''}`;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      setOrders(json.data);
      setTotal(json.total);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openOrder = (order: AdminOrder) => {
    setSelected(order);
    setTrackingForm({
      status: order.status,
      tracking: order.tracking_number ?? '',
      carrier: order.carrier ?? '',
      notes: '',
    });
    setUpdateError('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setUpdating(true);
    setUpdateError('');

    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: selected.id,
        status: trackingForm.status,
        trackingNumber: trackingForm.tracking || undefined,
        carrier: trackingForm.carrier || undefined,
        notes: trackingForm.notes || undefined,
      }),
    });

    setUpdating(false);

    if (!res.ok) {
      const err = await res.json();
      setUpdateError(err.error ?? 'Update failed');
      return;
    }

    setSelected(null);
    fetchOrders();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[1.6rem] font-bold text-[#1C1C1E] tracking-tight">Orders</h1>
          <p className="text-[13px] text-[#888] mt-1">{total} total orders</p>
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-[#E8DDD0] rounded-xl text-[13px] bg-white text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Orders table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#0D4A3C] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#F0E8DC] bg-[#FAF7F2]">
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Order</th>
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Customer</th>
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Total</th>
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-[#F0E8DC] last:border-0 hover:bg-[#FAF7F2] transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-mono font-semibold text-[#0D4A3C] text-[12px]">{order.order_number}</div>
                    <div className="text-[11px] text-[#888]">{order.shop_order_items?.length ?? 0} item(s)</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-[#1C1C1E]">{order.customer_name}</div>
                    <div className="text-[11px] text-[#888]">{order.customer_email}</div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-[#1C1C1E]">${Number(order.total).toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#888]">{formatDate(order.created_at)}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => openOrder(order)}
                      className="text-[12px] text-[#0D4A3C] font-medium hover:underline"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[13px] text-[#888]">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1C1C1E]/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E8DDD0] flex items-center justify-between">
              <div>
                <div className="font-mono font-bold text-[#0D4A3C]">{selected.order_number}</div>
                <div className="text-[12px] text-[#888]">{selected.customer_name} · {selected.customer_email}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#888] hover:text-[#1C1C1E]" aria-label="Close">
                <svg viewBox="0 0 16 16" width="18" height="18" fill="none" aria-hidden="true">
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {/* Order items */}
              <div>
                <h3 className="text-[12px] font-semibold text-[#888] uppercase tracking-wide mb-3">Items</h3>
                <div className="space-y-2">
                  {selected.shop_order_items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-[#F0E8DC] last:border-0">
                      <div className="text-[13px] text-[#1C1C1E]">{item.product_title} × {item.quantity}</div>
                      <div className="text-[13px] font-semibold text-[#1C1C1E]">${Number(item.line_total).toFixed(2)}</div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2">
                    <span className="text-[13px] font-bold text-[#1C1C1E]">Total</span>
                    <span className="text-[15px] font-bold text-[#0D4A3C]">${Number(selected.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Update form */}
              <form onSubmit={handleUpdate} className="space-y-4 border-t border-[#F0E8DC] pt-4">
                <h3 className="text-[12px] font-semibold text-[#888] uppercase tracking-wide">Update Order</h3>

                {updateError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[12px] text-red-700">{updateError}</div>
                )}

                <div>
                  <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Status</label>
                  <select value={trackingForm.status} onChange={(e) => setTrackingForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20">
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {trackingForm.status === 'shipped' && (
                  <>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Tracking Number</label>
                      <input type="text" value={trackingForm.tracking} onChange={(e) => setTrackingForm((f) => ({ ...f, tracking: e.target.value }))}
                        className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Carrier</label>
                      <input type="text" value={trackingForm.carrier} onChange={(e) => setTrackingForm((f) => ({ ...f, carrier: e.target.value }))}
                        placeholder="USPS, UPS, FedEx, DHL..."
                        className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20" />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Internal Note (optional)</label>
                  <textarea rows={2} value={trackingForm.notes} onChange={(e) => setTrackingForm((f) => ({ ...f, notes: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20" />
                </div>

                <div className="flex gap-3">
                  <button type="submit" disabled={updating}
                    className="flex-1 py-2.5 bg-[#0D4A3C] text-white text-[13px] font-semibold rounded-xl hover:bg-[#1A6B54] transition-colors disabled:opacity-50">
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setSelected(null)}
                    className="px-4 py-2.5 border border-[#E8DDD0] text-[#3A3A3C] text-[13px] rounded-xl hover:bg-[#FAF7F2] transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
