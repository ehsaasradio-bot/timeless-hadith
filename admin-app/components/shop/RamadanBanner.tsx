'use client';

// components/shop/RamadanBanner.tsx
// Full-width Ramadan / Eid collection banner with geometric pattern

import Link from 'next/link';
import { m } from 'framer-motion';

function CrescentMoonIcon() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none" aria-hidden="true">
      <path
        d="M20 6C13.37 6 8 11.37 8 18s5.37 12 12 12c2.76 0 5.3-.94 7.33-2.5A9.96 9.96 0 0 1 22 18c0-4.5 3-8.33 7.13-9.56A11.97 11.97 0 0 0 20 6z"
        fill="currentColor"
      />
    </svg>
  );
}

function StarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M10 1l2.4 5.1 5.6.8-4 3.9.9 5.5L10 13.8l-4.9 2.5.9-5.5L2 6.9l5.6-.8z" />
    </svg>
  );
}

export default function RamadanBanner() {
  return (
    <section
      className="relative overflow-hidden bg-[#0D4A3C] py-20"
      aria-labelledby="ramadan-banner-heading"
    >
      {/* Geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.07]" aria-hidden="true">
        <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="geo-banner" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <polygon
                points="30,4 36,22 54,22 40,32 45,50 30,40 15,50 20,32 6,22 24,22"
                fill="none"
                stroke="#C9A84C"
                strokeWidth="0.8"
              />
              <circle cx="30" cy="30" r="3" fill="none" stroke="#C9A84C" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#geo-banner)" />
        </svg>
      </div>

      {/* Warm radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(201,168,76,0.12) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Floating stars */}
        <m.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="flex justify-center gap-8 mb-8 text-[#C9A84C] opacity-60"
          aria-hidden="true"
        >
          <StarIcon size={10} />
          <CrescentMoonIcon />
          <StarIcon size={14} />
          <StarIcon size={8} />
        </m.div>

        {/* Eyebrow */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <span className="block w-8 h-[1px] bg-[#C9A84C]/60" aria-hidden="true" />
          <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#C9A84C]">
            Seasonal Collection
          </span>
          <span className="block w-8 h-[1px] bg-[#C9A84C]/60" aria-hidden="true" />
        </m.div>

        {/* Headline */}
        <m.h2
          id="ramadan-banner-heading"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(2rem,4.5vw,3.4rem)] font-bold text-white tracking-tight leading-tight mb-5"
        >
          Ramadan & Eid
          <br />
          <span className="text-[#C9A84C]">Gift Collections</span>
        </m.h2>

        {/* Subtext */}
        <m.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.16 }}
          className="text-[clamp(0.95rem,1.5vw,1.15rem)] text-white/70 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Thoughtfully curated sets for gifting, self-reflection, and celebrating the most sacred
          seasons of the Islamic year.
        </m.p>

        {/* CTAs */}
        <m.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="flex flex-wrap justify-center gap-3"
        >
          <Link
            href="/shop/category/ramadan-gifts"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#C9A84C] text-[#1C1C1E] text-[14px] font-bold rounded-2xl hover:bg-[#E8C96A] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#C9A84C]/30 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:ring-offset-2 focus:ring-offset-[#0D4A3C]"
          >
            Shop Ramadan
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          <Link
            href="/shop/category/eid-gifts"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 backdrop-blur-sm text-white text-[14px] font-semibold rounded-2xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#0D4A3C]"
          >
            Shop Eid Gifts
          </Link>
        </m.div>

        {/* Urgency / social proof strip */}
        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-wrap justify-center gap-6 mt-12 pt-8 border-t border-white/10"
        >
          {[
            { label: 'Gift-wrapping available', icon: '🎁' },
            { label: 'Free shipping on orders $75+', icon: '✈' },
            { label: 'Arrives in 3–5 business days', icon: '📦' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-white/60 text-[12px] font-medium">
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </m.div>
      </div>
    </section>
  );
}
