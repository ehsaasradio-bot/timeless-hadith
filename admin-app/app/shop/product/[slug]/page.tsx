'use client';

// app/shop/product/[slug]/page.tsx
// Product detail page — reads slug, finds product from static data
// 'use client' required for addToCart interaction

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BEST_SELLERS, REVIEWS } from '@/lib/shop-data';
import { addToCart, getCart } from '@/lib/cart';
import type { Product } from '@/types/shop';

// ─── Minimal nav ───────────────────────────────────────────────────────────────

function ShopNav({ product, cartCount }: { product: Product; cartCount: number }) {
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
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            <li>
              <Link href="/" className="hover:underline">Home</Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <Link href="/shop" className="hover:underline">Shop</Link>
            </li>
            <li aria-hidden="true">›</li>
            <li className="font-medium truncate max-w-[140px] sm:max-w-xs" style={{ color: 'var(--color-text)' }}>
              {product.title}
            </li>
          </ol>
        </nav>

        {/* Cart */}
        <Link
          href="/shop/cart"
          className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'var(--color-blue)' }}
          aria-label={`Cart (${cartCount} items)`}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path d="M1 1h2l2 6h6l2-4.5H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6.5" cy="12.5" r="1" fill="currentColor" />
            <circle cx="11.5" cy="12.5" r="1" fill="currentColor" />
          </svg>
          <span className="hidden sm:inline">Cart</span>
          {cartCount > 0 && (
            <span
              className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
              style={{ background: 'var(--color-gold)', color: 'white' }}
            >
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

// ─── Star rating ───────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="14" height="14" viewBox="0 0 12 12">
          <path
            d="M6 1l1.5 3 3.3.5-2.4 2.3.6 3.3L6 8.6 3 10.1l.6-3.3L1.2 4.5 4.5 4z"
            fill={n <= Math.round(rating) ? 'var(--color-gold)' : 'rgba(200,217,245,0.6)'}
          />
        </svg>
      ))}
    </div>
  );
}

// ─── Coin spec pill ────────────────────────────────────────────────────────────

function SpecPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col items-center px-4 py-3 rounded-xl text-center"
      style={{ background: 'rgba(52,113,255,0.06)', border: '1px solid rgba(200,217,245,0.5)' }}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </span>
      <span className="text-[13px] font-bold" style={{ color: 'var(--color-text)' }}>
        {value}
      </span>
    </div>
  );
}

// ─── Not found ────────────────────────────────────────────────────────────────

function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-[28px] font-bold mb-3" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}>
        Product Not Found
      </h1>
      <p className="mb-8" style={{ color: 'var(--color-text-muted)' }}>
        We couldn&apos;t find that coin. It may have sold out or been removed.
      </p>
      <Link
        href="/shop"
        className="px-6 py-3 rounded-xl text-[14px] font-semibold text-white"
        style={{ background: 'var(--color-blue)' }}
      >
        Back to Shop
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const product = BEST_SELLERS.find((p) => p.slug === slug) ?? null;

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const update = () => setCartCount(getCart().reduce((s, i) => s + i.quantity, 0));
    update();
    const handler = (e: Event) => {
      const items = (e as CustomEvent).detail?.items;
      if (items) setCartCount(items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0));
    };
    window.addEventListener('cart:updated', handler);
    return () => window.removeEventListener('cart:updated', handler);
  }, []);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (!product) {
    return (
      <>
        <ShopNav product={{ title: 'Not Found', slug: '' } as Product} cartCount={0} />
        <main id="main-content">
          <ProductNotFound />
        </main>
      </>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // Products from the same category as related
  const related = BEST_SELLERS.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 3);

  // Product reviews
  const productReviews = REVIEWS.filter((r) => r.productId === product.id);

  return (
    <>
      <ShopNav product={product} cartCount={cartCount} />

      <main id="main-content" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Product detail grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">

          {/* Images */}
          <div>
            <div
              className="aspect-square rounded-2xl overflow-hidden mb-3"
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(200,217,245,0.6)',
              }}
            >
              <Image
                src={product.images[activeImg]?.src ?? product.images[0].src}
                alt={product.images[activeImg]?.alt ?? product.images[0].alt}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className="w-16 h-16 rounded-xl overflow-hidden border-2 transition-all"
                    style={{
                      borderColor: activeImg === i ? 'var(--color-blue)' : 'rgba(200,217,245,0.4)',
                    }}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {/* Category + badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span
                className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(52,113,255,0.08)', color: 'var(--color-blue)' }}
              >
                {product.category}
              </span>
              {product.badge === 'bestseller' && (
                <span className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-white"
                  style={{ background: 'var(--color-blue)' }}>
                  Bestseller
                </span>
              )}
              {product.badge === 'limited' && (
                <span className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-white"
                  style={{ background: '#B44A2A' }}>
                  Limited Edition
                </span>
              )}
              {product.badge === 'new' && (
                <span className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-white"
                  style={{ background: '#1C1C1E' }}>
                  New
                </span>
              )}
              {product.freeShipping && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
                  Free Shipping
                </span>
              )}
            </div>

            <h1
              className="text-[26px] sm:text-[30px] font-bold leading-tight mb-3"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}
            >
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <Stars rating={product.rating} />
              <span className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                {product.rating} ({product.reviewCount.toLocaleString()} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-[28px] font-bold" style={{ color: 'var(--color-text)' }}>
                ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-[18px] line-through" style={{ color: 'var(--color-text-muted)' }}>
                    ${product.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  {discount && (
                    <span className="text-[13px] font-bold px-2 py-0.5 rounded-lg text-white"
                      style={{ background: 'var(--color-gold)' }}>
                      -{discount}%
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Coin specs */}
            {(product.metal || product.weight || product.purity || product.year || product.condition || product.mintage) && (
              <div className="grid grid-cols-3 gap-2 mb-5">
                {product.metal && <SpecPill label="Metal" value={product.metal} />}
                {product.weight && <SpecPill label="Weight" value={product.weight} />}
                {product.purity && <SpecPill label="Purity" value={product.purity} />}
                {product.year && <SpecPill label="Year" value={String(product.year)} />}
                {product.condition && <SpecPill label="Condition" value={product.condition} />}
                {product.mintage && <SpecPill label="Mintage" value={product.mintage} />}
              </div>
            )}

            {/* Description */}
            <p className="text-[14px] leading-relaxed mb-6" style={{ color: 'var(--color-text-muted)' }}>
              {product.description}
            </p>

            {/* SKU */}
            <p className="text-[11px] mb-5" style={{ color: 'var(--color-text-light)' }}>
              SKU: {product.sku}
            </p>

            {/* Add to cart */}
            {product.inStock ? (
              <div className="flex gap-3 items-center">
                {/* Qty stepper */}
                <div
                  className="inline-flex items-center rounded-xl border overflow-hidden"
                  style={{ borderColor: 'rgba(200,217,245,0.6)' }}
                >
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-11 flex items-center justify-center text-[18px] font-medium transition-colors hover:bg-[rgba(52,113,255,0.06)]"
                    style={{ color: 'var(--color-text)' }}
                    aria-label="Decrease"
                  >
                    −
                  </button>
                  <span
                    className="w-10 h-11 flex items-center justify-center text-[14px] font-semibold border-l border-r"
                    style={{ color: 'var(--color-text)', borderColor: 'rgba(200,217,245,0.6)' }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-11 flex items-center justify-center text-[18px] font-medium transition-colors hover:bg-[rgba(52,113,255,0.06)]"
                    style={{ color: 'var(--color-text)' }}
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 rounded-xl text-[14px] font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                  style={{ background: added ? '#16a34a' : 'var(--color-blue)' }}
                >
                  {added ? '✓ Added to Cart' : 'Add to Cart'}
                </button>
              </div>
            ) : (
              <div
                className="w-full py-3 rounded-xl text-[14px] font-semibold text-center"
                style={{ background: 'rgba(200,217,245,0.3)', color: 'var(--color-text-muted)' }}
              >
                Out of Stock
              </div>
            )}

            {/* Go to cart */}
            {added && (
              <Link
                href="/shop/cart"
                className="block text-center mt-3 text-[13px] font-semibold underline"
                style={{ color: 'var(--color-blue)' }}
              >
                View Cart →
              </Link>
            )}
          </div>
        </div>

        {/* ── Reviews ── */}
        {productReviews.length > 0 && (
          <section className="mb-16">
            <h2 className="text-[22px] font-bold mb-6" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}>
              Customer Reviews
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {productReviews.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl border"
                  style={{
                    background: 'rgba(255,255,255,0.65)',
                    backdropFilter: 'blur(12px)',
                    borderColor: 'rgba(200,217,245,0.5)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Stars rating={r.rating} />
                    <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(r.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-[13px] font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{r.title}</p>
                  <p className="text-[13px] leading-relaxed mb-3" style={{ color: 'var(--color-text-muted)' }}>{r.body}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold" style={{ color: 'var(--color-text)' }}>{r.authorName}</span>
                    <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{r.authorLocation}</span>
                    {r.verified && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Related products ── */}
        {related.length > 0 && (
          <section>
            <h2 className="text-[22px] font-bold mb-6" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}>
              More {product.category} Coins
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/shop/product/${p.slug}`}
                  className="group rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-lg block"
                  style={{
                    background: 'rgba(255,255,255,0.65)',
                    backdropFilter: 'blur(12px)',
                    borderColor: 'rgba(200,217,245,0.5)',
                  }}
                >
                  <div className="aspect-square overflow-hidden" style={{ background: 'rgba(238,244,255,0.6)' }}>
                    <Image
                      src={p.images[0].src}
                      alt={p.images[0].alt}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[13px] font-semibold leading-snug mb-1" style={{ color: 'var(--color-text)' }}>
                      {p.title}
                    </p>
                    <p className="text-[15px] font-bold" style={{ color: 'var(--color-blue)' }}>
                      ${p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
