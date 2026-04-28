'use client';
// app/shop/admin/customers/page.tsx — Customer list

import { useEffect, useState, useCallback } from 'react';

interface Customer {
  name: string;
  email: string;
  orderCount: number;
  totalSpent: number;
  lastOrder: string;
}

interface OrderItem { product_title: string; quantity: number; line_total: number }
interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  shop_order_items: OrderItem[];
}

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

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const url = `/api/admin/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      setCustomers(json.data);
      setTotal(json.total);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(t);
  }, [fetchCustomers]);

  const openCustomer = async (c: Customer) => {
    setSelected(c);
    setOrders([]);
    setOrdersLoading(true);
    const res = await fetch(`/api/admin/customers?email=${encodeURIComponent(c.email)}`);
    if (res.ok) setOrders(await res.json());
    setOrdersLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[1.6rem] font-bold text-[#1C1C1E] tracking-tight">Customers</h1>
          <p className="text-[13px] text-[#888] mt-1">{total} total customers</p>
        </div>
      </div>

      <div className="relative mb-5">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AAA]" viewBox="0 0 14 14" width="14" height="14" fill="none">
          <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M9 9L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <input type="search" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by email..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8DDD0] rounded-xl text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C] transition-all"/>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#0D4A3C] border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#F0E8DC] bg-[#FAF7F2]">
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Customer</th>
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Orders</th>
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Total Spent</th>
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Last Order</th>
                <th className="px-5 py-3"/>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.email} className="border-b border-[#F0E8DC] last:border-0 hover:bg-[#FAF7F2] transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-medium text-[#1C1C1E]">{c.name}</div>
                    <div className="text-[11px] text-[#888]">{c.email}</div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-[#1C1C1E]">{c.orderCount}</td>
                  <td className="px-5 py-3 font-semibold text-[#1C1C1E]">${c.totalSpent.toFixed(2)}</td>
                  <td className="px-5 py-3 text-[#888]">{formatDate(c.lastOrder)}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => openCustomer(c)} className="text-[12px] text-[#0D4A3C] font-medium hover:underline">View Orders</button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-[13px] text-[#888]">No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer order history modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1C1C1E]/40 backdrop-blur-sm" onClick={() => setSelected(null)}/>
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-[#E8DDD0] flex items-center justify-between">
              <div>
                <div className="font-bold text-[#1C1C1E]">{selected.name}</div>
                <div className="text-[12px] text-[#888]">{selected.email}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#888] hover:text-[#1C1C1E]">
                <svg viewBox="0 0 16 16" width="18" height="18" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="px-6 py-2 bg-[#FAF7F2] border-b border-[#E8DDD0] flex gap-6">
              <div className="text-center py-3">
                <div className="text-[18px] font-bold text-[#0D4A3C]">{selected.orderCount}</div>
                <div className="text-[11px] text-[#888]">Orders</div>
              </div>
              <div className="text-center py-3">
                <div className="text-[18px] font-bold text-[#0D4A3C]">${selected.totalSpent.toFixed(2)}</div>
                <div className="text-[11px] text-[#888]">Total Spent</div>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {ordersLoading ? (
                <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-[#0D4A3C] border-t-transparent rounded-full animate-spin"/></div>
              ) : (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div key={order.id} className="border border-[#E8DDD0] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-[#0D4A3C] text-[12px]">{order.order_number}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-500'}`}>{order.status}</span>
                      </div>
                      <div className="text-[12px] text-[#888] mb-2">{formatDate(order.created_at)}</div>
                      <div className="space-y-1">
                        {order.shop_order_items?.map((item, i) => (
                          <div key={i} className="flex justify-between text-[12px]">
                            <span className="text-[#3A3A3C]">{item.product_title} × {item.quantity}</span>
                            <span className="font-medium">${Number(item.line_total).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between pt-2 border-t border-[#F0E8DC] mt-2">
                        <span className="text-[12px] font-bold">Total</span>
                        <span className="text-[13px] font-bold text-[#0D4A3C]">${Number(order.total).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-[13px] text-[#888] text-center py-6">No orders found.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
