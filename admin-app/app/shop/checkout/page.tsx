'use client';

// app/shop/checkout/page.tsx
// Order review → Stripe redirect. Cart is read from localStorage.

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { CartItem } from '@/types/shop';
import {
  getCart,
  getCartSubtotal,
  getShippingCost,
  getCartTotal,
} from '@/lib/cart';

// ─── Minimal header ────────────────────────────────────────────────────────────

function Header() {
  return (
    <header
      className="w-full border-b"
      style={{
        background: 'rgba(238,244,255,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'rgba(200,217,245,0.5)',
      }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/shop" className="text-[15px] font-bold" style={{ color: 'var(--color-text)' }}>
          Timeless Hadith
        </Link>
        <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
          <span>Cart</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-semibold" style={{ color: 'var(--color-blue)' }}>Checkout</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Confirmation</span>
        </div>
      </div>
    </header>
  );
}

// ─── Empty redirect ────────────────────────────────────────────────────────────

function EmptyCheckout() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-[16px] mb-6" style={{ color: 'var(--color-text-muted)' }}>
        Your cart is empty. Nothing to check out.
      </p>
      <Link
        href="/shop"
        className="px-6 py-3 rounded-xl text-[14px] font-semibold text-white"
        style={{ background: 'var(--color-blue)' }}
      >
        Browse Coins
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCart(getCart());
    setMounted(true);
  }, []);

  const subtotal = getCartSubtotal(cart);
  const shipping = getShippingCost(cart);
  const total = getCartTotal(cart);

  const handlePay = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? `Server error ${res.status}`);
      }

      const data = await res.json() as { url?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No redirect URL returned from checkout');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <>
        <Header />
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-[rgba(52,113,255,0.3)] border-t-[rgba(52,113,255,0.9)] animate-spin" />
        </div>
      </>
    );
  }

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <EmptyCheckout />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10" id="main-content">
        <h1
          className="text-[26px] font-bold mb-8"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}
        >
          Review Your Order
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
          {/* Item list */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.65)',
              backdropFilter: 'blur(12px)',
              borderColor: 'rgba(200,217,245,0.5)',
            }}
          >
            {cart.map((item, i) => (
              <div
                key={item.product.id}
                className="flex items-center gap-4 p-4"
                style={{ borderBottom: i < cart.length - 1 ? '1px solid rgba(200,217,245,0.3)' : 'none' }}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'rgba(238,244,255,0.7)' }}>
                  <Image
                    src={item.product.images[0].src}
                    alt={item.product.images[0].alt}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                    {item.product.title}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {[item.product.metal, item.product.weight, item.product.purity].filter(Boolean).join(' · ')}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    Qty: {item.quantity}
                  </p>
                </div>
                <span className="text-[14px] font-bold flex-shrink-0" style={{ color: 'var(--color-text)' }}>
                  ${(item.product.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>

          {/* Summary + pay */}
          <div
            className="rounded-2xl border p-5"
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              borderColor: 'rgba(200,217,245,0.5)',
              boxShadow: '0 8px 32px rgba(31,75,180,0.08)',
            }}
          >
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-[13px]">
                <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                <span style={{ color: 'var(--color-text)' }}>
                  ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span style={{ color: 'var(--color-text-muted)' }}>Shipping</span>
                <span style={{ color: shipping === 0 ? '#16a34a' : 'var(--color-text)' }}>
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div
              className="flex justify-between py-3 border-t border-b mb-4 font-bold text-[15px]"
              style={{ borderColor: 'rgba(200,217,245,0.4)', color: 'var(--color-text)' }}
            >
              <span>Total</span>
              <span>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Test mode notice */}
            <div
              className="rounded-xl p-3 mb-4 text-[11px] leading-relaxed"
              style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#92700a' }}
            >
              <strong>Test mode:</strong> Use card <code>4242 4242 4242 4242</code>, any future date, any CVC.
            </div>

            {error && (
              <div
                className="rounded-xl p-3 mb-4 text-[12px]"
                style={{ background: 'rgba(180,74,42,0.08)', border: '1px solid rgba(180,74,42,0.2)', color: '#b44a2a' }}
              >
                {error}
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-[14px] font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'var(--color-blue)' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Redirecting to Stripe…
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                    <rect x="1" y="3" width="13" height="9" rx="2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M1 7h13" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                  Pay ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })} Securely
                </>
              )}
            </button>

            <Link
              href="/shop/cart"
              className="block text-center mt-3 text-[12px]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              ← Edit Cart
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
