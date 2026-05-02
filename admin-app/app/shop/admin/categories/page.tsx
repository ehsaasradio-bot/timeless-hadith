'use client';
// app/shop/admin/categories/page.tsx — Category management

import { useEffect, useState } from 'react';

interface AdminCategory {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string | null;
  image_alt: string | null;
  sort_order: number;
  featured: boolean;
  is_active: boolean;
  created_at: string;
  shop_products: { count: number }[];
}

const EMPTY_FORM = {
  title: '',
  slug: '',
  description: '',
  image_url: '',
  image_alt: '',
  sort_order: 0,
  featured: false,
  is_active: true,
};

function Badge({ active }: { active: boolean }) {
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
      {active ? 'Active' : 'Hidden'}
    </span>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetch_ = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/categories');
    if (res.ok) setCategories(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (c: AdminCategory) => {
    setForm({
      title: c.title,
      slug: c.slug,
      description: c.description ?? '',
      image_url: c.image_url ?? '',
      image_alt: c.image_alt ?? '',
      sort_order: c.sort_order,
      featured: c.featured,
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
      title: form.title.trim(),
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: form.description || null,
      image_url: form.image_url || null,
      image_alt: form.image_alt || null,
      sort_order: Number(form.sort_order),
      featured: form.featured,
      is_active: form.is_active,
    };
    const res = await fetch('/api/admin/categories', {
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
    const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
    if (res.ok) { setDeleteConfirm(null); fetch_(); }
    else { const j = await res.json(); alert(j.error ?? 'Cannot delete — category may have products.'); }
  };

  const productCount = (c: AdminCategory) => c.shop_products?.[0]?.count ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[1.6rem] font-bold text-[#1C1C1E] tracking-tight">Categories</h1>
          <p className="text-[13px] text-[#888] mt-1">{categories.length} categories</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0D4A3C] text-white text-[13px] font-semibold rounded-xl hover:bg-[#1A6B54] transition-colors">
          <svg viewBox="0 0 14 14" width="14" height="14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#0D4A3C] border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#F0E8DC] bg-[#FAF7F2]">
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Slug</th>
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Products</th>
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Order</th>
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Status</th>
                <th className="px-5 py-3"/>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-[#F0E8DC] last:border-0 hover:bg-[#FAF7F2] transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-medium text-[#1C1C1E]">{cat.title}</div>
                    {cat.featured && <span className="text-[10px] text-[#0D4A3C] bg-[#0D4A3C]/10 px-1.5 py-0.5 rounded">Featured</span>}
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px] text-[#888]">{cat.slug}</td>
                  <td className="px-5 py-3 text-[#1C1C1E] font-semibold">{productCount(cat)}</td>
                  <td className="px-5 py-3 text-[#888]">{cat.sort_order}</td>
                  <td className="px-5 py-3"><Badge active={cat.is_active}/></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(cat)} className="text-[12px] text-[#0D4A3C] font-medium hover:underline">Edit</button>
                      {deleteConfirm === cat.id ? (
                        <>
                          <button onClick={() => handleDelete(cat.id)} className="text-[12px] text-red-600 font-medium hover:underline">Confirm</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-[12px] text-[#888] hover:underline">Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => setDeleteConfirm(cat.id)} className="text-[12px] text-[#AAA] hover:text-red-500">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-[13px] text-[#888]">No categories yet.</td></tr>
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
              <h2 className="text-[15px] font-bold text-[#1C1C1E]">{editingId ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowForm(false)} className="text-[#888] hover:text-[#1C1C1E]">
                <svg viewBox="0 0 16 16" width="18" height="18" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[13px] text-red-700">{error}</div>}

              <div>
                <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Name *</label>
                <input required type="text" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                  className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C]"/>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Slug</label>
                <input type="text" value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))}
                  placeholder="auto-generated from name"
                  className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C]"/>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C]"/>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Image URL</label>
                <input type="url" value={form.image_url} onChange={e => setForm(f => ({...f, image_url: e.target.value}))}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C]"/>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Image Alt Text</label>
                <input type="text" value={form.image_alt} onChange={e => setForm(f => ({...f, image_alt: e.target.value}))}
                  className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C]"/>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Sort Order</label>
                <input type="number" min="0" value={form.sort_order} onChange={e => setForm(f => ({...f, sort_order: Number(e.target.value)}))}
                  className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C]"/>
              </div>

              <div className="space-y-3 pt-1">
                {[
                  { key: 'is_active', label: 'Active (visible in shop)' },
                  { key: 'featured', label: 'Featured on homepage' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                      onChange={e => setForm(f => ({...f, [key]: e.target.checked}))}
                      className="w-4 h-4 rounded border-[#E8DDD0] text-[#0D4A3C] focus:ring-[#0D4A3C]"/>
                    <span className="text-[13px] text-[#3A3A3C]">{label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#F0E8DC]">
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-[#0D4A3C] text-white text-[13px] font-semibold rounded-xl hover:bg-[#1A6B54] transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
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
