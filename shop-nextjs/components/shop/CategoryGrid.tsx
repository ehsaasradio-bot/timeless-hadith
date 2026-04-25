'use client';

// components/shop/CategoryGrid.tsx
// Featured categories grid — hover animated, image-optimized

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CATEGORIES } from '@/lib/shop-data';

const CATEGORY_ICONS: Record<string, JSX.Element> = {
  'wall-art': (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20" aria-hidden="true">
      <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 13l4-4 3 3 3-3 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  journals: (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20" aria-hidden="true">
      <rect x="4" y="2" width="12" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 7h6M7 10h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  'prayer-essentials': (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20" aria-hidden="true">
      <path d="M10 2a7 7 0 0 1 7 7c0 3.5-3.5 7-7 9-3.5-2-7-5.5-7-9a7 7 0 0 1 7-7z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  books: (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20" aria-hidden="true">
      <path d="M3 5a2 2 0 0 1 2-2h10v14H5a2 2 0 0 1-2-2V5z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 2v14" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  apparel: (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20" aria-hidden="true">
      <path d="M2 6l4-3 1 3h6l1-3 4 3-3 2v9H5V8L2 6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  'kids-learning': (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20" aria-hidden="true">
      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  'home-decor': (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20" aria-hidden="true">
      <path d="M2 9.5L10 3l8 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v7h10v-7" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="8" y="13" width="4" height="4" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
  'digital-products': (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20" aria-hidden="true">
      <rect x="3" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 18h6M10 14v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function CategoryGrid() {
  return (
    <section className="py-24 bg-white" aria-labelledby="categories-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <span className="block w-8 h-[1.5px] bg-[#C9A84C]" aria-hidden="true" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C]">
              Browse by Category
            </span>
            <span className="block w-8 h-[1.5px] bg-[#C9A84C]" aria-hidden="true" />
          </motion.div>

          <motion.h2
            id="categories-heading"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold text-[#1C1C1E] tracking-tight leading-tight"
          >
            Everything you need,
            <br />
            <span className="text-[#0D4A3C]">crafted with intention.</span>
          </motion.h2>
        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          role="list"
          aria-label="Product categories"
        >
          {CATEGORIES.map((cat) => (
            <motion.div key={cat.id} variants={cardVariants} role="listitem">
              <Link
                href={`/shop/category/${cat.slug}`}
                className="group block relative bg-[#FAF7F2] rounded-2xl overflow-hidden border border-[#E8DDD0] hover:border-[#C9A84C] hover:shadow-lg hover:shadow-[#C9A84C]/08 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0D4A3C] focus:ring-offset-2"
                aria-label={`Shop ${cat.title} — ${cat.productCount} products`}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#F0E8DC]">
                  <Image
                    src={cat.image.src}
                    alt={cat.image.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-108"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E]/30 via-transparent to-transparent" />

                  {/* Icon badge */}
                  <div className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-[#0D4A3C] border border-[#E8DDD0]">
                    {CATEGORY_ICONS[cat.slug] ?? null}
                  </div>
                </div>

                {/* Text */}
                <div className="p-4">
                  <h3 className="text-[14px] font-semibold text-[#1C1C1E] group-hover:text-[#0D4A3C] transition-colors mb-0.5">
                    {cat.title}
                  </h3>
                  <span className="text-[12px] text-[#888]">{cat.productCount} products</span>
                </div>

                {/* Arrow on hover */}
                <div className="absolute bottom-4 right-4 w-7 h-7 bg-[#0D4A3C] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6h8M6 2l4 4-4 4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center mt-10"
        >
          <Link
            href="/shop/categories"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#0D4A3C] hover:text-[#1A6B54] transition-colors focus:outline-none focus:underline"
          >
            View all categories
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 7h10M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
