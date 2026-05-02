'use client';
// app/shop/admin/settings/page.tsx — Shop settings

import { useEffect, useState } from 'react';

interface Settings {
  shop_name?: string;
  shop_tagline?: string;
  contact_email?: string;
  currency?: string;
  free_shipping_threshold?: number;
  default_low_stock_threshold?: number;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
}

const CURRENCIES = ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'AED', 'SAR'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden">
      <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E8DDD0]">
        <h2 className="text-[13px] font-bold text-[#1C1C1E]">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 items-start">
      <div className="pt-2.5">
        <label className="block text-[13px] font-semibold text-[#3A3A3C]">{label}</label>
        {hint && <p className="text-[11px] text-[#888] mt-0.5">{hint}</p>}
      </div>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 border border-[#E8DDD0] rounded-xl text-[13px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C] transition-all";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.ok ? r.json() : {})
      .then(data => { setSettings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const set = (key: keyof Settings, value: string | number) =>
    setSettings(s => ({ ...s, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (!res.ok) { setError((await res.json()).error ?? 'Failed to save'); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#0D4A3C] border-t-transparent rounded-full animate-spin"/></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[1.6rem] font-bold text-[#1C1C1E] tracking-tight">Settings</h1>
        <p className="text-[13px] text-[#888] mt-1">Configure your shop preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General */}
        <Section title="General">
          <Field label="Shop Name" hint="Shown in emails and receipts">
            <input type="text" value={settings.shop_name ?? ''} onChange={e => set('shop_name', e.target.value)}
              placeholder="Timeless Hadith Shop" className={inputCls}/>
          </Field>
          <Field label="Tagline" hint="Short description of your shop">
            <input type="text" value={settings.shop_tagline ?? ''} onChange={e => set('shop_tagline', e.target.value)}
              placeholder="Premium Islamic gifts & collectibles" className={inputCls}/>
          </Field>
          <Field label="Contact Email" hint="Customer replies go here">
            <input type="email" value={settings.contact_email ?? ''} onChange={e => set('contact_email', e.target.value)}
              placeholder="shop@timelesshadith.com" className={inputCls}/>
          </Field>
          <Field label="Currency">
            <select value={settings.currency ?? 'USD'} onChange={e => set('currency', e.target.value)}
              className={inputCls}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </Section>

        {/* Shipping */}
        <Section title="Shipping">
          <Field label="Free Shipping Threshold" hint="Orders above this amount get free shipping (0 = always charge)">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888] text-[13px]">$</span>
              <input type="number" min="0" step="0.01"
                value={settings.free_shipping_threshold ?? 75}
                onChange={e => set('free_shipping_threshold', parseFloat(e.target.value))}
                className={`${inputCls} pl-7`}/>
            </div>
          </Field>
        </Section>

        {/* Inventory */}
        <Section title="Inventory">
          <Field label="Low Stock Alert Threshold" hint="Show alert when stock falls below this number">
            <input type="number" min="0"
              value={settings.default_low_stock_threshold ?? 5}
              onChange={e => set('default_low_stock_threshold', parseInt(e.target.value))}
              className={inputCls}/>
          </Field>
        </Section>

        {/* Social */}
        <Section title="Social Media">
          {[
            { key: 'social_facebook' as keyof Settings, label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
            { key: 'social_instagram' as keyof Settings, label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
            { key: 'social_twitter' as keyof Settings, label: 'Twitter / X', placeholder: 'https://x.com/yourhandle' },
          ].map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <input type="url" value={(settings[key] as string) ?? ''} onChange={e => set(key, e.target.value)}
                placeholder={placeholder} className={inputCls}/>
            </Field>
          ))}
        </Section>

        {/* Save bar */}
        <div className="flex items-center gap-4 pt-2">
          <button type="submit" disabled={saving}
            className="px-8 py-3 bg-[#0D4A3C] text-white text-[13px] font-semibold rounded-xl hover:bg-[#1A6B54] transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && <span className="text-[13px] text-[#0D4A3C] font-medium">✓ Settings saved</span>}
          {error && <span className="text-[13px] text-red-600">{error}</span>}
        </div>
      </form>
    </div>
  );
}
