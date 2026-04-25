'use client';

// app/shop/admin/products/page.tsx — Product management

import { useEffect, useState } from 'react';

interface AdminProduct {
  id: string;
  slug: string;
  title: string;
  sku: string;
  price: number;
  original_price: number | null;
  badge: string | null;
  is_active: boolean;
  is_digital: boolean;
  created_at: string;
  shop_categories: { slug: string; title: string } | null;
  shop_inventory: { quantity_on_hand: number; quantity_reserved: number; low_stock_threshold: number } | null;
}

interface Category { id: string; slug: string; title: string }

const BADGE_OPTIONS = ['', 'bestseller', 'new', 'limited', 'sale', 'eid', 'ramadan'];

const STATUS_PILL = (active: boolean) =>
  active
    ? 'bg-green-100 text-green-700'
    : 'bg-gray-100 text-gray-500';

function StockBadge({ qty }: { qty: number }) {
  if (qty <= 0) return <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Out</span>;
  if (qty <= 5) return <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{qty} low</span>;
  return <span className="text-[11px] font-medium text-[#555]">{qty}</span>;
}

const EMPTY_FORM = {
  title: '',
  slug: '',
  description: '',
  price: '',
  original_price: '',
  sku: '',
  category_id: '',
  badge: '',
  tags: '',
  is_active: true,
  is_digital: false,
  free_shipping: false,
  initial_quantity: '',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([
      fetch('/api/admin/products'),
      fetch('/api/shop/categories'),
    ]);
    if (pRes.ok) setProducts(await pRes.json());
    if (cRes.ok) setCategories(await cRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (p: AdminProduct) => {
    setForm({
      title: p.title,
      slug: p.slug,
      description: '',
      price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : '',
      sku: p.sku,
      category_id: p.shop_categories ? '' : '', // resolved from category join
      badge: p.badge ?? '',
      tags: '',
      is_active: p.is_active,
      is_digital: p.is_digital,
      free_shipping: false,
      initial_quantity: String(p.shop_inventory?.quantity_on_hand ?? 0),
    });
    setEditingId(p.id);
    setError('');
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...(editingId ? { id: editingId } : {}),
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: form.description,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      sku: form.sku,
      category_id: form.category_id || undefined,
      badge: form.badge || null,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      is_active: form.is_active,
      is_digital: form.is_digital,
      free_shipping: form.free_shipping,
      ...(form.initial_quantity ? { initial_quantity: parseInt(form.initial_quantity, 10) } : {}),
      ...(editingId && form.initial_quantity ? { quantity_on_hand: parseInt(form.initial_quantity, 10) } : {}),
    };

    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch('/api/admin/products', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? 'Failed to save product');
      return;
    }

    setShowForm(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setDeleteConfirm(null);
      fetchProducts();
    }
  };

  const filtered = products.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[1.6rem] font-bold text-[#1C1C1E] tracking-tight">Products</h1>
          <p className="text-[13px] text-[#888] mt-1">{products.length} total products</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0D4A3C] text-white text-[13px] font-semibold rounded-xl hover:bg-[#1A6B54] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]"
        >
          <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden="true">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AAA]" viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden="true">
          <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3" />
          <path d="M9 9L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or SKU..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8DDD0] rounded-xl text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C] transition-all"
        />
      </div>

      {/* Product table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#0D4A3C] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#F0E8DC] bg-[#FAF7F2]">
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Product</th>
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">SKU</th>
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Price</th>
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Stock</th>
                <th className="text-left px-5 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-[#F0E8DC] last:border-0 hover:bg-[#FAF7F2] transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-medium text-[#1C1C1E] leading-tight">{product.title}</div>
                    {product.badge && (
                      <span className="text-[10px] text-[#0D4A3C] bg-[#0D4A3C]/10 px-1.5 py-0.5 rounded capitalize">
                        {product.badge}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-[#888] font-mono text-[11px]">{product.sku}</td>
                  <td className="px-5 py-3 font-semibold text-[#1C1C1E]">
                    ${Number(product.price).toFixed(2)}
                    {product.original_price && (
                      <span className="text-[#AAA] line-through ml-1.5 font-normal">${Number(product.original_price).toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {product.is_digital ? (
                      <span className="text-[11px] text-[#0D4A3C] bg-[#0D4A3C]/10 px-2 py-0.5 rounded-full">Digital</span>
                    ) : (
                      <StockBadge qty={product.shop_inventory?.quantity_on_hand ?? 0} />
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_PILL(product.is_active)}`}>
                      {product.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(product)}
                        className="text-[12px] text-[#0D4A3C] font-medium hover:underline focus:outline-none"
                      >
                        Edit
                      </button>
                      {deleteConfirm === product.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-[12px] text-red-600 font-medium hover:underline"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-[12px] text-[#888] hover:underline"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="text-[12px] text-[#AAA] font-medium hover:text-red-500 focus:outline-none"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[13px] text-[#888]">
                    {search ? 'No products match your search.' : 'No products yet. Add your first product!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Product form drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div className="absolute inset-0 bg-[#1C1C1E]/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#E8DDD0] px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-[15px] font-bold text-[#1C1C1E]">
                {editingId ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-[#888] hover:text-[#1C1C1E] transition-colors"
                aria-label="Close"
              >
                <svg viewBox="0 0 16 16" width="18" height="18" fill="none" aria-hidden="true">
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[13px] text-red-700">
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Title *</label>
                <input type="text" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C]" />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">URL Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="auto-generated from title"
                  className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C]" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C] resize-none" />
              </div>

              {/* Price row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Price (USD) *</label>
                  <input type="number" required min="0" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C]" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Original Price</label>
                  <input type="number" min="0" step="0.01" value={form.original_price} onChange={(e) => setForm((f) => ({ ...f, original_price: e.target.value }))}
                    placeholder="for strike-through"
                    className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C]" />
                </div>
              </div>

              {/* SKU */}
              <div>
                <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">SKU *</label>
                <input type="text" required value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C]" />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Category</label>
                <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C] bg-white">
                  <option value="">Select category...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              {/* Badge */}
              <div>
                <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Badge</label>
                <select value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C] bg-white">
                  {BADGE_OPTIONS.map((b) => <option key={b} value={b}>{b || 'None'}</option>)}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Tags (comma-separated)</label>
                <input type="text" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="Islamic gifts, Quran art, wall decor"
                  className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C]" />
              </div>

              {/* Stock */}
              {!form.is_digital && (
                <div>
                  <label className="block text-[12px] font-semibold text-[#3A3A3C] mb-1.5">Stock Quantity</label>
                  <input type="number" min="0" value={form.initial_quantity} onChange={(e) => setForm((f) => ({ ...f, initial_quantity: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C]" />
                </div>
              )}

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                {[
                  { key: 'is_active', label: 'Active (visible in shop)' },
                  { key: 'is_digital', label: 'Digital product (no shipping)' },
                  { key: 'free_shipping', label: 'Free shipping' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                      className="w-4 h-4 rounded border-[#E8DDD0] text-[#0D4A3C] focus:ring-[#0D4A3C]" />
                    <span className="text-[13px] text-[#3A3A3C]">{label}</span>
                  </label>
                ))}
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4 border-t border-[#F0E8DC]">
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-[#0D4A3C] text-white text-[13px] font-semibold rounded-xl hover:bg-[#1A6B54] transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]">
                  {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
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
