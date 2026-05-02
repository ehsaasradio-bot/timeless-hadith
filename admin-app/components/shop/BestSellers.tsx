'use client';

// components/shop/BestSellers.tsx
// Animated best-sellers grid with staggered entrance

import Link from 'next/link';
import { m } from 'framer-motion';
import ProductCard from './ProductCard';
import { BEST_SELLERS } from '@/lib/shop-data';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function BestSellers() {
  return (
    <section
      id="best-sellers"
      className="py-24 bg-[#FAF7F2]"
      aria-labelledby="best-sellers-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
          <div>
            <m.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="flex items-center gap-3 mb-4"
            >
              <span className="block w-8 h-[1.5px] bg-[#C9A84C]" aria-hidden="true" />
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C]">
                Most Loved
              </span>
            </m.div>

            <m.h2
              id="best-sellers-heading"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.06 }}
              className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold text-[#1C1C1E] tracking-tight leading-tight"
            >
              Best Sellers
            </m.h2>
          </div>

          <m.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Link
              href="/shop/best-sellers"
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0D4A3C] hover:text-[#1A6B54] transition-colors focus:outline-none focus:underline pb-1 border-b border-[#0D4A3C]/30 hover:border-[#1A6B54]"
            >
              Shop all
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </m.div>
        </div>

        {/* Product grid */}
        <m.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
          role="list"
          aria-label="Best selling products"
        >
          {BEST_SELLERS.map((product, index) => (
            <m.div key={product.id} variants={itemVariants} role="listitem">
              <ProductCard product={product} priority={index < 4} />
            </m.div>
          ))}
        </m.div>

        {/* Load more */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex justify-center mt-12"
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-[#0D4A3C] text-[#0D4A3C] text-[14px] font-semibold rounded-2xl hover:bg-[#0D4A3C] hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0D4A3C] focus:ring-offset-2"
          >
            View all products
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </m.div>
      </div>
    </section>
  );
}
