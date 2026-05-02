'use client';

// components/shop/CategoryGrid.tsx
// Coin metal categories — light-blue glassmorphism

import React from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import { CATEGORIES } from '@/lib/shop-data';

// Coin-appropriate icons keyed by category slug
const CATEGORY_ICONS: Record<string, React.ReactElement> = {
  silver: (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="10" r="4.5" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <circle cx="10" cy="10" r="2"   fill="currentColor" opacity="0.3" />
    </svg>
  ),
  gold: (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="10" r="4.5" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <text x="10" y="14" textAnchor="middle" fontSize="7" fontWeight="700"
        fill="currentColor" fontFamily="system-ui">Au</text>
    </svg>
  ),
  copper: (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="10" r="4.5" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <text x="10" y="14" textAnchor="middle" fontSize="7" fontWeight="700"
        fill="currentColor" fontFamily="system-ui">Cu</text>
    </svg>
  ),
  bronze: (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 10h6M10 7v6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
    </svg>
  ),
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden:   { opacity: 0, y: 24 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function CategoryGrid() {
  return (
    <section className="py-24 bg-white" aria-labelledby="categories-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <m.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <span className="block w-8 h-[1.5px] bg-[#C9A84C]" aria-hidden="true" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C]">
              Browse by Metal
            </span>
            <span className="block w-8 h-[1.5px] bg-[#C9A84C]" aria-hidden="true" />
          </m.div>

          <m.h2
            id="categories-heading"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold text-[#1C1C1E] tracking-tight leading-tight"
          >
            Every metal, every grade,
            <br />
            <span className="text-blue-600">certified and authentic.</span>
          </m.h2>
        </div>

        {/* Grid */}
        <m.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          role="list"
          aria-label="Coin categories by metal"
        >
          {CATEGORIES.map((cat) => (
            <m.div key={cat.id} variants={cardVariants} role="listitem">
              <Link
                href={`/shop?category=${cat.slug}`}
                className="group block relative bg-[#F8FAFF] rounded-2xl overflow-hidden border border-blue-100 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-600/08 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                aria-label={`Shop ${cat.title} — ${cat.productCount} coins`}
              >
                {/* Visual area */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  {/* Large coin illustration */}
                  <svg viewBox="0 0 80 80" width="80" height="80" fill="none" aria-hidden="true"
                    className="opacity-30 group-hover:opacity-50 transition-opacity duration-300">
                    <circle cx="40" cy="40" r="36" stroke="#2563EB" strokeWidth="1.5" />
                    <circle cx="40" cy="40" r="26" stroke="#2563EB" strokeWidth="1"   />
                    <circle cx="40" cy="40" r="16" stroke="#2563EB" strokeWidth="0.8" />
                  </svg>

                  {/* Icon badge */}
                  <div className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                    {CATEGORY_ICONS[cat.slug] ?? null}
                  </div>

                  {/* Count badge */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-white/80 backdrop-blur-sm rounded-full text-[10px] font-semibold text-blue-600 border border-blue-100">
                    {cat.productCount}
                  </div>
                </div>

                {/* Text */}
                <div className="p-4">
                  <h3 className="text-[14px] font-semibold text-[#1C1C1E] group-hover:text-blue-600 transition-colors mb-0.5">
                    {cat.title}
                  </h3>
                  <span className="text-[12px] text-[#888]">{cat.productCount} coins</span>
                </div>

                {/* Arrow on hover */}
                <div className="absolute bottom-4 right-4 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6h8M6 2l4 4-4 4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  );
}
