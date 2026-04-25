'use client';

// components/shop/ProductCard.tsx
// Reusable premium product card with wishlist, quick-add, rating, badge

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Product } from '@/types/shop';

const BADGE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  bestseller: { bg: 'bg-[#0D4A3C]', text: 'text-white', label: 'Bestseller' },
  new: { bg: 'bg-[#1C1C1E]', text: 'text-white', label: 'New' },
  limited: { bg: 'bg-[#B44A2A]', text: 'text-white', label: 'Limited' },
  sale: { bg: 'bg-[#C9A84C]', text: 'text-white', label: 'Sale' },
  eid: { bg: 'bg-[#8B5CF6]', text: 'text-white', label: 'Eid Special' },
  ramadan: { bg: 'bg-[#0D4A3C]', text: 'text-white', label: 'Ramadan' },
};

function StarRating({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1.5" aria-label={`${rating} out of 5 stars, ${count} reviews`}>
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => {
          const isFull = i < full;
          const isHalf = !isFull && i === full && half;
          return (
            <svg key={i} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              {isFull ? (
                <path d="M6 1l1.5 3 3.3.5-2.4 2.3.6 3.3L6 8.6 3 10.1l.6-3.3L1.2 4.5 4.5 4z" fill="#C9A84C" />
              ) : isHalf ? (
                <>
                  <path d="M6 1l1.5 3 3.3.5-2.4 2.3.6 3.3L6 8.6V1z" fill="#C9A84C" />
                  <path d="M6 1 4.5 4 1.2 4.5l2.4 2.3-.6 3.3L6 8.6V1z" fill="#E8DDD0" />
                </>
              ) : (
                <path d="M6 1l1.5 3 3.3.5-2.4 2.3.6 3.3L6 8.6 3 10.1l.6-3.3L1.2 4.5 4.5 4z" fill="#E8DDD0" />
              )}
            </svg>
          );
        })}
      </div>
      <span className="text-[11px] text-[#888] font-medium">({count})</span>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
  priority?: boolean;
}

export default function ProductCard({ product, variant = 'default', priority = false }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const badge = product.badge ? BADGE_STYLES[product.badge] : null;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    // dispatch add-to-cart event or call cart context
    window.dispatchEvent(new CustomEvent('shop:add-to-cart', { detail: { productId: product.id } }));
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((v) => !v);
    window.dispatchEvent(
      new CustomEvent('shop:wishlist-toggle', { detail: { productId: product.id, state: !wishlisted } })
    );
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="group relative bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden hover:shadow-xl hover:shadow-[#0D4A3C]/08 hover:border-[#D4C4B0] transition-all duration-300"
    >
      <Link
        href={`/shop/product/${product.slug}`}
        className="block focus:outline-none focus:ring-2 focus:ring-[#0D4A3C] focus:ring-inset rounded-2xl"
        aria-label={`${product.title} — $${product.price}`}
      >
        {/* Image container */}
        <div className="relative aspect-square bg-[#F5F0EA] overflow-hidden">
          {/* Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#F0E8DC] via-[#FAF7F2] to-[#F0E8DC] animate-pulse" />
          )}

          <Image
            src={product.images[0].src}
            alt={product.images[0].alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            priority={priority}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-[#1C1C1E]/0 group-hover:bg-[#1C1C1E]/04 transition-all duration-300" />

          {/* Badge */}
          {badge && (
            <div
              className={`absolute top-3 left-3 px-2.5 py-1 ${badge.bg} ${badge.text} text-[10px] font-bold tracking-wide rounded-lg uppercase`}
            >
              {badge.label}
            </div>
          )}

          {/* Discount badge */}
          {discount && (
            <div className="absolute top-3 right-12 px-2 py-1 bg-[#C9A84C] text-white text-[10px] font-bold rounded-lg">
              -{discount}%
            </div>
          )}

          {/* Digital badge */}
          {product.isDigital && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-[#0D4A3C] rounded-lg border border-[#E8DDD0]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 2h6v6H2z" stroke="currentColor" strokeWidth="1.2" rx="1" />
                <path d="M4 5h2M5 4v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Instant Download
            </div>
          )}

          {/* Free shipping badge */}
          {product.freeShipping && !product.isDigital && (
            <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-[#0D4A3C] rounded-lg border border-[#E8DDD0]">
              Free Shipping
            </div>
          )}

          {/* Wishlist button */}
          <motion.button
            onClick={handleWishlist}
            whileTap={{ scale: 0.88 }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-[#E8DDD0] opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:opacity-100 focus:ring-2 focus:ring-[#C9A84C]"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={wishlisted}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M7 11.5S1.5 8 1.5 4.5A2.75 2.75 0 0 1 7 3.15 2.75 2.75 0 0 1 12.5 4.5C12.5 8 7 11.5 7 11.5Z"
                stroke={wishlisted ? '#B44A2A' : '#3A3A3C'}
                strokeWidth="1.3"
                fill={wishlisted ? '#B44A2A' : 'none'}
              />
            </svg>
          </motion.button>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="mb-1">
            <span className="text-[11px] text-[#888] font-medium uppercase tracking-wide">
              {product.category}
            </span>
          </div>

          <h3 className="text-[14px] font-semibold text-[#1C1C1E] leading-snug mb-2 line-clamp-2 group-hover:text-[#0D4A3C] transition-colors">
            {product.title}
          </h3>

          <StarRating rating={product.rating} count={product.reviewCount} />

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-[17px] font-bold text-[#1C1C1E]">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-[13px] text-[#AAA] line-through font-medium">
                  ${product.originalPrice}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Quick Add to Cart */}
      <div className="px-4 pb-4">
        <motion.button
          onClick={handleAddToCart}
          whileTap={{ scale: 0.97 }}
          disabled={!product.inStock}
          className={`w-full py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            !product.inStock
              ? 'bg-[#F0E8DC] text-[#AAA] cursor-not-allowed'
              : addedToCart
              ? 'bg-[#0D4A3C] text-white focus:ring-[#0D4A3C]'
              : 'bg-[#F0E8DC] text-[#0D4A3C] hover:bg-[#0D4A3C] hover:text-white focus:ring-[#0D4A3C]'
          }`}
          aria-label={
            !product.inStock ? 'Out of stock' : addedToCart ? 'Added to cart' : `Add ${product.title} to cart`
          }
        >
          {!product.inStock ? 'Out of Stock' : addedToCart ? 'Added!' : 'Add to Cart'}
        </motion.button>
      </div>
    </motion.article>
  );
}
