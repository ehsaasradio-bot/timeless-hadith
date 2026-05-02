'use client';

// components/shop/HeroSection.tsx
// Coin shop hero — light-blue glassmorphism, parallax

import { useRef } from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

// Subtle coin-ring SVG pattern
function CoinPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.045]"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="coin-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <circle cx="40" cy="40" r="30" fill="none" stroke="#2563EB" strokeWidth="0.8" />
          <circle cx="40" cy="40" r="22" fill="none" stroke="#2563EB" strokeWidth="0.5" />
          <circle cx="40" cy="40" r="14" fill="none" stroke="#2563EB" strokeWidth="0.4" />
          <circle cx="0"  cy="0"  r="8"  fill="none" stroke="#2563EB" strokeWidth="0.5" />
          <circle cx="80" cy="0"  r="8"  fill="none" stroke="#2563EB" strokeWidth="0.5" />
          <circle cx="0"  cy="80" r="8"  fill="none" stroke="#2563EB" strokeWidth="0.5" />
          <circle cx="80" cy="80" r="8"  fill="none" stroke="#2563EB" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#coin-pattern)" />
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[88vh] flex items-center overflow-hidden bg-[#F8FAFF]"
      aria-label="Shop hero"
    >
      <CoinPattern />

      {/* Blue radial gradient accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 72% 60% at 68% 50%, rgba(37,99,235,0.06) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Blue accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-30"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — text block */}
          <div>
            {/* Eyebrow */}
            <m.div
              variants={fadeUp} custom={0} initial="hidden" animate="visible"
              className="flex items-center gap-3 mb-8"
            >
              <span className="block w-10 h-[1.5px] bg-[#C9A84C]" aria-hidden="true" />
              <span className="text-[12px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C]">
                Premium Coins &amp; Bullion
              </span>
            </m.div>

            {/* Headline */}
            <m.h1
              variants={fadeUp} custom={0.08} initial="hidden" animate="visible"
              className="text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.08] tracking-[-0.02em] text-[#1C1C1E] mb-6"
            >
              Rare.{' '}
              <span className="text-blue-600">Authentic.</span>
              <br />
              Timeless.
            </m.h1>

            {/* Subheadline */}
            <m.p
              variants={fadeUp} custom={0.16} initial="hidden" animate="visible"
              className="text-[clamp(1rem,1.6vw,1.2rem)] text-[#6B6B6B] leading-relaxed max-w-md mb-10"
            >
              Certified silver eagles, gold maple leafs, copper rounds, and rare
              numismatic coins — authenticated and shipped worldwide.
            </m.p>

            {/* CTAs */}
            <m.div
              variants={fadeUp} custom={0.24} initial="hidden" animate="visible"
              className="flex flex-wrap gap-3"
            >
              <Link
                href="#collection"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white text-[14px] font-semibold rounded-2xl hover:bg-blue-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              >
                Shop Collection
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              <Link
                href="#best-sellers"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white border border-blue-100 text-[#1C1C1E] text-[14px] font-semibold rounded-2xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              >
                Best Sellers
              </Link>
            </m.div>

            {/* Trust indicators */}
            <m.div
              variants={fadeUp} custom={0.32} initial="hidden" animate="visible"
              className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-blue-100"
            >
              {[
                { value: '2,400+', label: 'Collectors served'  },
                { value: '50+',    label: 'Countries shipped'   },
                { value: '4.9',    label: 'Average rating'      },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-[1.5rem] font-bold text-blue-600 tracking-tight leading-none mb-1">
                    {stat.value}
                  </div>
                  <div className="text-[12px] text-[#888] font-medium">{stat.label}</div>
                </div>
              ))}
            </m.div>
          </div>

          {/* Right — coin visual cluster.
              The wrapper used to be aria-hidden="true", which hid the example
              coin's title + price from screen readers. We now expose them as
              an accessible aside; the purely-decorative SVGs stay aria-hidden
              individually (see `aria-hidden` on each <svg>). */}
          <m.div
            style={{ y: parallaxY }}
            className="relative hidden lg:flex items-center justify-center"
            role="complementary"
            aria-label="Featured coin example"
          >
            {/* Primary card */}
            <m.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="relative w-[340px] h-[440px] bg-white rounded-3xl shadow-2xl shadow-blue-600/10 overflow-hidden border border-blue-100"
            >
              {/* Coin illustration placeholder */}
              <div className="w-full h-full bg-gradient-to-br from-[#EEF4FF] via-[#D6E4FF] to-[#C0D4F5] flex flex-col items-center justify-center gap-4">
                <svg viewBox="0 0 100 100" width="100" height="100" fill="none" aria-hidden="true">
                  <circle cx="50" cy="50" r="46" stroke="#2563EB" strokeWidth="1.5" opacity="0.3" />
                  <circle cx="50" cy="50" r="38" stroke="#2563EB" strokeWidth="1" opacity="0.5" />
                  <circle cx="50" cy="50" r="28" stroke="#2563EB" strokeWidth="1" opacity="0.4" />
                  <circle cx="50" cy="50" r="18" fill="#2563EB" opacity="0.12" />
                  <text x="50" y="56" textAnchor="middle" fontSize="16" fontWeight="800"
                    fill="#2563EB" opacity="0.7" fontFamily="system-ui">$</text>
                </svg>
                <span className="text-[13px] font-medium text-blue-600/60 tracking-wide">
                  Coin image
                </span>
              </div>

              {/* Price tag overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-[#1C1C1E]">American Silver Eagle</div>
                    <div className="text-[12px] text-[#888]">.999 Fine Silver — 1 oz</div>
                  </div>
                  <div className="text-[18px] font-bold text-blue-600">$38</div>
                </div>
              </div>
            </m.div>

            {/* Floating badge */}
            <m.div
              initial={{ opacity: 0, x: 20, rotate: 6 }}
              animate={{ opacity: 1, x: 0, rotate: 6 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="absolute -top-4 -right-8 bg-[#C9A84C] text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-lg"
            >
              Bestseller
            </m.div>

            {/* Floating mini card */}
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              className="absolute -bottom-6 -left-12 bg-white rounded-2xl px-4 py-3 shadow-xl border border-blue-100 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <svg viewBox="0 0 18 18" width="18" height="18" fill="none" aria-hidden="true">
                  <circle cx="9" cy="9" r="7" stroke="#2563EB" strokeWidth="1.4" />
                  <circle cx="9" cy="9" r="4" stroke="#2563EB" strokeWidth="1" opacity="0.5" />
                </svg>
              </div>
              <div>
                <div className="text-[12px] font-semibold text-[#1C1C1E]">2,400+ happy collectors</div>
                <div className="flex gap-0.5 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="10" height="10" viewBox="0 0 10 10" fill="#C9A84C" aria-hidden="true">
                      <path d="M5 1l1.2 2.5H9L7 5.3l.8 2.7L5 6.5 2.2 8l.8-2.7L1 3.5h2.8z" />
                    </svg>
                  ))}
                </div>
              </div>
            </m.div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
