// app/shop/cancel/page.tsx
// Stripe redirects here when the customer cancels payment.
// Server component — no interactivity needed.

export const runtime = 'edge';

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Payment Cancelled | Timeless Hadith Shop',
  robots: { index: false },
};

export default function CancelPage() {
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
        {/* Cancel icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'rgba(90,106,138,0.08)' }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <circle cx="18" cy="18" r="17" stroke="var(--color-text-muted)" strokeWidth="2" />
            <path d="M13 18h10" stroke="var(--color-text-muted)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        <h1
          className="text-[28px] sm:text-[34px] font-bold mb-3"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}
        >
          Payment Cancelled
        </h1>

        <p className="text-[16px] mb-2 max-w-sm" style={{ color: 'var(--color-text-muted)' }}>
          No charge was made. Your cart is still saved.
        </p>

        <p className="text-[14px] mb-8 max-w-sm" style={{ color: 'var(--color-text-muted)' }}>
          You can go back and try again whenever you&apos;re ready.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/shop/cart"
            className="px-6 py-3 rounded-xl text-[14px] font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--color-blue)' }}
          >
            Return to Cart
          </Link>
          <Link
            href="/shop"
            className="px-6 py-3 rounded-xl text-[14px] font-semibold border transition-all hover:bg-[rgba(52,113,255,0.04)]"
            style={{ borderColor: 'rgba(200,217,245,0.6)', color: 'var(--color-text)' }}
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    </>
  );
}
