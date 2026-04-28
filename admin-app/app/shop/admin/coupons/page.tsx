'use client';
// app/shop/admin/coupons/page.tsx — Coupon / discount code management

import { useEffect, useState } from 'react';

interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order_value: number | null;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

const EMPTY_FORM = {
  code: '',
  type: 'percent' as 'percent' | 'fixed',
  value: '',
  min_order_value: '',
  max_uses: '',
  expires_at: '',
  is_active: true,
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isExpired(iso: string | null) {
  if (!iso) return false;
  return new Date(iso) < new Date();
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetch_ = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/coupons');
    if (res.ok) setCoupons(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      min_order_value: c.min_order_value ? String(c.min_order_value) : '',
      max_uses: c.max_uses ? String(c.max_uses) : '',
      expires_at: c.expires_at ? c.expires_at.slice(0, 10) : '',
      is_active: c.is_active,
    });
    setEditingId(c.id);
    setError('');
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...(editingId ? { id: editingId } : {}),
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: parseFloat(form.value),
      min_order_value: form.min_order_value ? parseFloat(form.min_order_value) : null,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_active: form.is_active,
    };
    const res = await fetch('/api/admin/coupons', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) { setError((await res.json()).error ?? 'Failed to save'); return; }
    setShowForm(false);
    fetch_();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
    setDeleteConfirm(null);
    fetch_();
  };

  const toggleActive = async (coupon: Coupon) => {
    await fetch('/api/admin/coupons', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: coupon.id, is_active: !coupon.is_active }),
    });
    fetch_();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[1.6rem] font-bold text-[#1C1C1E] tracking-tight">Coupons</h1>
          <p className="text-[13px] text-[#888] mt-1">{coupons.length} discount codes</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0D4A3C] text-white text-[13px] font-semibold rounded-xl hover:bg-[#1A6B54] transition-colors">
          <svg viewBox="0 0 14 14" width="14" height="14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Add Coupon
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#0D4A3C] border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#F0E8DC] bg-[#FAF7F2]">
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Code</th>
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Discount</th>
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Usage</th>
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Expires</th>
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Status</th>
                <th className="px-5 py-3"/>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => {
                const expired = isExpired(coupon.expires_at);
                return (
                  <tr key={coupon.id} className="border-b border-[#F0E8DC] last:border-0 hover:bg-[#FAF7F2] transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-mono font-bold text-[#0D4A3C] bg-[#0D4A3C]/5 px-2 py-0.5 rounded text-[12px]">{coupon.code}</span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#1C1C1E]">
                      {coupon.type === 'percent' ? `${coupon.value}%` : `$${Number(coupon.value).toFixed(2)}`}
                      {coupon.min_order_value && <span className="text-[11px] text-[#888] font-normal ml-1">min ${coupon.min_order_value}</span>}
                    </td>
                    <td className="px-5 py-3 text-[#888]">
                      {coupon.uses_count}{coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
                    </td>
                    <td className={`px-5 py-3 ${expired ? 'text-red-500' : 'text-[#888]'}`}>{formatDate(coupon.expires_at)}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => toggleActive(coupon)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors ${coupon.is_active && !expired ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        {expired ? 'Expired' : coupon.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(coupon)} className="text-[12px] text-[#0D4A3C] font-medium hover:underline">Edit</button>
                        {deleteConfirm === coupon.id ? (
                          <>
                            <button onClick={() => handleDelete(coupon.id)} className="text-[12px] text-red-600 font-medium hover:underline">Confirm</button>
                            <button onClick={() => setDeleteConfirm(null)} className="text-[12px] text-[#888] hover:underline">Cancel</button>
                          </>
                        ) : (
                          <button onClick={() => setDeleteConfirm(coupon.id)} className="text-[12px] text-[#AAA] hover:text-red-500">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {coupons.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-[13px] text-[#888]">No coupons yet. Create your first discount code!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div className="absolute inset-0 bg-[#1C1C1E]/40 backdrop-blur-sm" onClick={() => setShowForm(false)}/>
          <div className="relative w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#E8DDD0] px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-[15px] font-bold text-[#1C1C1E]">{editingId ? 'Edit Coupon' : 'Add Coupon'}</h2>
              <button onClick={() => setShowForm(false)} className="text-[#888] hover:text-[#1C1C1E]">
                <svg viewBox="0 0 16 16" width="18" height="18" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[13px] text-red-700">{error}</div>}

              <div>
                <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Coupon Code *</label>
                <input required type="text" value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))}
                  placeholder="e.g. SAVE20"
                  className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C]"/>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Discount Type *</label>
                <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value as 'percent' | 'fixed'}))}
                  className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C]">
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">
                  Discount Value * {form.type === 'percent' ? '(%)' : '(USD)'}
                </label>
                <input required type="number" min="0" step="0.01" value={form.value} onChange={e => setForm(f => ({...f, value: e.target.value}))}
                  placeholder={form.type === 'percent' ? '20' : '10.00'}
                  className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C]"/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Min Order ($)</label>
                  <input type="number" min="0" step="0.01" value={form.min_order_value} onChange={e => setForm(f => ({...f, min_order_value: e.target.value}))}
                    placeholder="No minimum"
                    className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C]"/>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Max Uses</label>
                  <input type="number" min="0" value={form.max_uses} onChange={e => setForm(f => ({...f, max_uses: e.target.value}))}
                    placeholder="Unlimited"
                    className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C]"/>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Expiry Date</label>
                <input type="date" value={form.expires_at} onChange={e => setForm(f => ({...f, expires_at: e.target.value}))}
                  className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C]"/>
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-1">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked}))}
                  className="w-4 h-4 rounded border-[#E8DDD0] text-[#0D4A3C] focus:ring-[#0D4A3C]"/>
                <span className="text-[13px] text-[#3A3A3C]">Active (can be used at checkout)</span>
              </label>

              <div className="flex gap-3 pt-4 border-t border-[#F0E8DC]">
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-[#0D4A3C] text-white text-[13px] font-semibold rounded-xl hover:bg-[#1A6B54] transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-3 border border-[#E8DDD0] text-[#3A3A3C] text-[13px] font-medium rounded-xl hover:bg-[#FAF7F2] transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
