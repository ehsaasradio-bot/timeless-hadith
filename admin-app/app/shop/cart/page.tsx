'use client';

// app/shop/cart/page.tsx
// localStorage cart page — no server required

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { CartItem } from '@/types/shop';
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  getCartSubtotal,
  getShippingCost,
  getCartTotal,
} from '@/lib/cart';

// ─── Minimal inner-page nav ────────────────────────────────────────────────────

function ShopNav({ cartCount }: { cartCount: number }) {
  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'rgba(238,244,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(200,217,245,0.5)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link
          href="/shop"
          className="flex items-center gap-2 text-[14px] font-semibold"
          style={{ color: 'var(--color-text)' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M11 14L6 9l5-5" stroke="var(--color-blue)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Continue Shopping
        </Link>

        <span className="text-[13px] font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
          Your Cart
        </span>

        <span
          className="text-[13px] font-semibold px-3 py-1 rounded-full"
          style={{ background: 'rgba(52,113,255,0.1)', color: 'var(--color-blue)' }}
        >
          {cartCount} {cartCount === 1 ? 'item' : 'items'}
        </span>
      </div>
    </header>
  );
}

// ─── Empty cart ────────────────────────────────────────────────────────────────

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: 'rgba(52,113,255,0.08)' }}
      >
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <path
            d="M4 4h4l4 14h14l3-9H9"
            stroke="var(--color-blue)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="15" cy="28" r="2" fill="var(--color-blue)" />
          <circle cx="25" cy="28" r="2" fill="var(--color-blue)" />
        </svg>
      </div>
      <h2
        className="text-[22px] font-bold mb-2"
        style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}
      >
        Your cart is empty
      </h2>
      <p className="text-[15px] mb-8 max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
        Discover our collection of premium gold and silver coins.
      </p>
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
        style={{ background: 'var(--color-blue)' }}
      >
        Browse Coins
      </Link>
    </div>
  );
}

// ─── Cart row ──────────────────────────────────────────────────────────────────

function CartRow({
  item,
  onQtyChange,
  onRemove,
}: {
  item: CartItem;
  onQtyChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const { product, quantity } = item;

  return (
    <div
      className="flex gap-4 py-5 border-b"
      style={{ borderColor: 'rgba(200,217,245,0.4)' }}
    >
      {/* Image */}
      <Link
        href={`/shop/product/${product.slug}`}
        className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden block"
        style={{ background: 'rgba(255,255,255,0.7)' }}
      >
        <Image
          src={product.images[0].src}
          alt={product.images[0].alt}
          width={80}
          height={80}
          className="w-full h-full object-cover"
        />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider block mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {product.category}
            </span>
            <Link
              href={`/shop/product/${product.slug}`}
              className="text-[14px] font-semibold leading-snug hover:underline block"
              style={{ color: 'var(--color-text)' }}
            >
              {product.title}
            </Link>
            {(product.metal || product.purity || product.weight) && (
              <span className="text-[12px] mt-0.5 block" style={{ color: 'var(--color-text-muted)' }}>
                {[product.metal, product.weight, product.purity].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>

          {/* Price */}
          <span className="text-[15px] font-bold flex-shrink-0" style={{ color: 'var(--color-text)' }}>
            ${(product.price * quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3">
          {/* Quantity stepper */}
          <div
            className="inline-flex items-center rounded-xl overflow-hidden border"
            style={{ borderColor: 'rgba(200,217,245,0.6)' }}
          >
            <button
              onClick={() => onQtyChange(product.id, quantity - 1)}
              className="w-8 h-8 flex items-center justify-center text-[16px] font-medium transition-colors hover:bg-[rgba(52,113,255,0.08)]"
              style={{ color: 'var(--color-text)' }}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span
              className="w-8 h-8 flex items-center justify-center text-[13px] font-semibold border-l border-r"
              style={{ color: 'var(--color-text)', borderColor: 'rgba(200,217,245,0.6)' }}
            >
              {quantity}
            </span>
            <button
              onClick={() => onQtyChange(product.id, quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-[16px] font-medium transition-colors hover:bg-[rgba(52,113,255,0.08)]"
              style={{ color: 'var(--color-text)' }}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Remove */}
          <button
            onClick={() => onRemove(product.id)}
            className="text-[12px] font-medium transition-colors hover:underline"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label={`Remove ${product.title} from cart`}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Order summary ─────────────────────────────────────────────────────────────

function OrderSummary({
  cart,
  subtotal,
  shipping,
  total,
  onCheckout,
  loading,
}: {
  cart: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  onCheckout: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-6 border sticky top-20"
      style={{
        background: 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'rgba(200,217,245,0.6)',
        boxShadow: '0 8px 32px rgba(31,75,180,0.08)',
      }}
    >
      <h2 className="text-[16px] font-bold mb-5" style={{ color: 'var(--color-text)' }}>
        Order Summary
      </h2>

      <div className="space-y-3 mb-5">
        <div className="flex justify-between text-[14px]">
          <span style={{ color: 'var(--color-text-muted)' }}>
            Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)
          </span>
          <span style={{ color: 'var(--color-text)' }}>
            ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-between text-[14px]">
          <span style={{ color: 'var(--color-text-muted)' }}>Shipping</span>
          <span style={{ color: shipping === 0 ? '#22c55e' : 'var(--color-text)' }}>
            {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
          </span>
        </div>

        {shipping > 0 && (
          <p className="text-[11px] px-3 py-2 rounded-lg" style={{ background: 'rgba(52,113,255,0.06)', color: 'var(--color-blue)' }}>
            Add ${(200 - subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })} more for free shipping
          </p>
        )}
      </div>

      <div
        className="flex justify-between py-4 border-t border-b mb-5 text-[15px] font-bold"
        style={{ borderColor: 'rgba(200,217,245,0.4)', color: 'var(--color-text)' }}
      >
        <span>Total</span>
        <span>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>

      <button
        onClick={onCheckout}
        disabled={loading || cart.length === 0}
        className="w-full py-3.5 rounded-xl text-[14px] font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background: 'var(--color-blue)' }}
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Redirecting…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M1 8h14" stroke="currentColor" strokeWidth="1.4" />
              <path d="M5 2v4M11 2v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Proceed to Checkout
          </>
        )}
      </button>

      {/* Trust signals */}
      <div className="mt-4 flex items-center justify-center gap-4 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
        <span className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M6 1L7.5 4H11L8.5 6l1 3.5L6 8l-3.5 1.5 1-3.5L1 4h3.5L6 1z" fill="var(--color-gold)" />
          </svg>
          Secure Checkout
        </span>
        <span className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M6 1L7.5 4H11L8.5 6l1 3.5L6 8l-3.5 1.5 1-3.5L1 4h3.5L6 1z" fill="var(--color-gold)" />
          </svg>
          30-Day Returns
        </span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCart(getCart());
    setMounted(true);

    const handler = (e: Event) => {
      setCart((e as CustomEvent<{ items: CartItem[] }>).detail.items);
    };
    window.addEventListener('cart:updated', handler);
    return () => window.removeEventListener('cart:updated', handler);
  }, []);

  const handleQtyChange = useCallback((id: string, qty: number) => {
    setCart(updateCartQuantity(id, qty));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setCart(removeFromCart(id));
  }, []);

  const handleCheckout = useCallback(async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Checkout failed');
      }

      const data = await res.json() as { url?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  }, [cart]);

  if (!mounted) {
    // SSR/hydration-safe blank
    return (
      <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
        <div className="max-w-5xl mx-auto px-4 py-20 flex justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[rgba(52,113,255,0.3)] border-t-[rgba(52,113,255,0.9)] animate-spin" />
        </div>
      </div>
    );
  }

  const subtotal = getCartSubtotal(cart);
  const shipping = getShippingCost(cart);
  const total = getCartTotal(cart);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <ShopNav cartCount={cartCount} />

      <main
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        id="main-content"
      >
        {cart.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <h1
              className="text-[28px] sm:text-[32px] font-bold mb-8"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}
            >
              Your Cart
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
              {/* Items */}
              <div>
                {cart.map((item) => (
                  <CartRow
                    key={item.product.id}
                    item={item}
                    onQtyChange={handleQtyChange}
                    onRemove={handleRemove}
                  />
                ))}
              </div>

              {/* Summary */}
              <OrderSummary
                cart={cart}
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                onCheckout={handleCheckout}
                loading={loading}
              />
            </div>
          </>
        )}
      </main>
    </>
  );
}
