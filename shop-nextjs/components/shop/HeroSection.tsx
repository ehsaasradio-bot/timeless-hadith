'use client';

// components/shop/HeroSection.tsx
// Cinematic hero with geometric pattern overlay + Framer Motion entrance

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

// Subtle Islamic geometric SVG pattern (original, not copied)
function GeometricPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.055]"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="geo-hero" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          {/* 8-point star */}
          <polygon
            points="40,8 47,30 68,30 52,44 58,66 40,52 22,66 28,44 12,30 33,30"
            fill="none"
            stroke="#0D4A3C"
            strokeWidth="0.8"
          />
          {/* Inner square */}
          <rect x="28" y="28" width="24" height="24" transform="rotate(45 40 40)" fill="none" stroke="#0D4A3C" strokeWidth="0.5" />
          {/* Corner diamonds */}
          <polygon points="0,0 8,0 0,8" fill="none" stroke="#0D4A3C" strokeWidth="0.5" />
          <polygon points="80,0 72,0 80,8" fill="none" stroke="#0D4A3C" strokeWidth="0.5" />
          <polygon points="0,80 8,80 0,72" fill="none" stroke="#0D4A3C" strokeWidth="0.5" />
          <polygon points="80,80 72,80 80,72" fill="none" stroke="#0D4A3C" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#geo-hero)" />
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
      className="relative min-h-[88vh] flex items-center overflow-hidden bg-[#FAF7F2]"
      aria-label="Shop hero"
    >
      <GeometricPattern />

      {/* Warm radial gradient accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 72% 60% at 68% 50%, rgba(200,168,76,0.07) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Emerald accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0D4A3C] to-transparent opacity-30"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — text block */}
          <div>
            {/* Eyebrow */}
            <motion.div
              variants={fadeUp}
              custom={0}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-3 mb-8"
            >
              <span className="block w-10 h-[1.5px] bg-[#C9A84C]" aria-hidden="true" />
              <span className="text-[12px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C]">
                Islamic Merchandise
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              custom={0.08}
              initial="hidden"
              animate="visible"
              className="text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.08] tracking-[-0.02em] text-[#1C1C1E] mb-6"
            >
              Inspired by{' '}
              <em className="not-italic text-[#0D4A3C]">Faith.</em>
              <br />
              Designed for
              <br />
              Everyday Life.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              custom={0.16}
              initial="hidden"
              animate="visible"
              className="text-[clamp(1rem,1.6vw,1.2rem)] text-[#6B6B6B] leading-relaxed max-w-md mb-10"
            >
              Premium products rooted in Islamic identity, knowledge, and beauty. Ethically made.
              Designed to last.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              custom={0.24}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-3"
            >
              <Link
                href="#collection"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#0D4A3C] text-white text-[14px] font-semibold rounded-2xl hover:bg-[#1A6B54] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-900/20 focus:outline-none focus:ring-2 focus:ring-[#0D4A3C] focus:ring-offset-2"
              >
                Shop Collection
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              <Link
                href="#best-sellers"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white border border-[#E0D0BC] text-[#1C1C1E] text-[14px] font-semibold rounded-2xl hover:bg-[#F0E8DC] hover:border-[#C9A84C] transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:ring-offset-2"
              >
                Best Sellers
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={fadeUp}
              custom={0.32}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-[#E8DDD0]"
            >
              {[
                { value: '4,800+', label: 'Happy customers' },
                { value: '80+', label: 'Countries shipped' },
                { value: '4.9', label: 'Average rating' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-[1.5rem] font-bold text-[#0D4A3C] tracking-tight leading-none mb-1">
                    {stat.value}
                  </div>
                  <div className="text-[12px] text-[#888] font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — visual cluster */}
          <motion.div
            style={{ y: parallaxY }}
            className="relative hidden lg:flex items-center justify-center"
            aria-hidden="true"
          >
            {/* Primary card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="relative w-[340px] h-[440px] bg-white rounded-3xl shadow-2xl shadow-[#0D4A3C]/10 overflow-hidden border border-[#E8DDD0]"
            >
              {/* Placeholder visual — replace with next/image */}
              <div className="w-full h-full bg-gradient-to-br from-[#F0E8DC] via-[#E8DDD0] to-[#D4C4B0] flex flex-col items-center justify-center gap-4">
                <svg viewBox="0 0 80 80" width="80" height="80" fill="none" aria-hidden="true">
                  <circle cx="40" cy="40" r="38" stroke="#0D4A3C" strokeWidth="1.2" opacity="0.3" />
                  <polygon
                    points="40,10 49,34 74,34 54,50 62,74 40,58 18,74 26,50 6,34 31,34"
                    fill="none"
                    stroke="#0D4A3C"
                    strokeWidth="1.2"
                    opacity="0.6"
                  />
                  <circle cx="40" cy="40" r="10" fill="#0D4A3C" opacity="0.2" />
                </svg>
                <span className="text-[13px] font-medium text-[#0D4A3C]/60 tracking-wide">
                  Your product image
                </span>
              </div>

              {/* Price tag overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 border border-[#E8DDD0]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-[#1C1C1E]">Ayat Al-Kursi Print</div>
                    <div className="text-[12px] text-[#888]">Framed — Ready to hang</div>
                  </div>
                  <div className="text-[18px] font-bold text-[#0D4A3C]">$89</div>
                </div>
              </div>
            </motion.div>

            {/* Floating badge — Bestseller */}
            <motion.div
              initial={{ opacity: 0, x: 20, rotate: 6 }}
              animate={{ opacity: 1, x: 0, rotate: 6 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="absolute -top-4 -right-8 bg-[#C9A84C] text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-lg"
            >
              Bestseller
            </motion.div>

            {/* Floating mini card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              className="absolute -bottom-6 -left-12 bg-white rounded-2xl px-4 py-3 shadow-xl border border-[#E8DDD0] flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F0E8DC] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path
                    d="M9 14.5S2 10.5 2 5.5A3.5 3.5 0 0 1 9 4.05 3.5 3.5 0 0 1 16 5.5C16 10.5 9 14.5 9 14.5Z"
                    fill="#0D4A3C"
                    opacity="0.7"
                  />
                </svg>
              </div>
              <div>
                <div className="text-[12px] font-semibold text-[#1C1C1E]">4,800+ happy customers</div>
                <div className="flex gap-0.5 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="10" height="10" viewBox="0 0 10 10" fill="#C9A84C" aria-hidden="true">
                      <path d="M5 1l1.2 2.5H9L7 5.3l.8 2.7L5 6.5 2.2 8l.8-2.7L1 3.5h2.8z" />
                    </svg>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
