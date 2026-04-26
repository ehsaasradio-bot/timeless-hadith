'use client';

// app/shop/success/page.tsx
// Post-payment confirmation. Clears localStorage cart on mount.
// Stripe passes ?session_id=cs_... in the URL.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { clearCart } from '@/lib/cart';

export default function SuccessPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Clear the cart now that payment was captured
    clearCart();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-[rgba(52,113,255,0.3)] border-t-[rgba(52,113,255,0.9)] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Minimal header */}
      <header
        className="w-full border-b"
        style={{
          background: 'rgba(238,244,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(200,217,245,0.5)',
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link href="/shop" className="text-[15px] font-bold" style={{ color: 'var(--color-text)' }}>
            Timeless Hadith
          </Link>
        </div>
      </header>

      <main
        id="main-content"
        className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center"
      >
        {/* Success icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'rgba(34,197,94,0.1)' }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <circle cx="18" cy="18" r="17" stroke="#16a34a" strokeWidth="2" />
            <path d="M11 18l5 5 9-10" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1
          className="text-[30px] sm:text-[36px] font-bold mb-3"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}
        >
          Order Confirmed
        </h1>

        <p className="text-[16px] mb-2 max-w-md" style={{ color: 'var(--color-text-muted)' }}>
          Thank you for your order. Your payment was received successfully.
        </p>

        <p className="text-[14px] mb-8 max-w-sm" style={{ color: 'var(--color-text-muted)' }}>
          A confirmation email will be sent to you shortly. For gold and silver coins, please allow 1–3 business days for processing before shipment.
        </p>

        {/* Order details notice */}
        <div
          className="rounded-2xl border p-5 mb-8 max-w-sm w-full text-left"
          style={{
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(200,217,245,0.5)',
          }}
        >
          <div className="space-y-3">
            {[
              { icon: '📦', label: 'Processing Time', value: '1–3 business days' },
              { icon: '🚚', label: 'Shipping', value: 'Fully insured delivery' },
              { icon: '🛡️', label: 'Insurance', value: 'All shipments insured' },
              { icon: '📬', label: 'Tracking', value: 'Emailed when dispatched' },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="text-[16px]">{icon}</span>
                <div>
                  <p className="text-[12px] font-semibold" style={{ color: 'var(--color-text)' }}>{label}</p>
                  <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/shop"
            className="px-6 py-3 rounded-xl text-[14px] font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--color-blue)' }}
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl text-[14px] font-semibold border transition-all hover:bg-[rgba(52,113,255,0.04)]"
            style={{ borderColor: 'rgba(200,217,245,0.6)', color: 'var(--color-text)' }}
          >
            Back to Timeless Hadith
          </Link>
        </div>
      </main>
    </>
  );
}
