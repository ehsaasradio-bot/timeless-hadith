'use client';

// components/shop/Testimonials.tsx
// Auto-scrolling testimonial carousel

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { REVIEWS } from '@/lib/shop-data';

function StarsFilled({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path
            d="M7 1l1.8 3.8 4.2.6-3 3 .7 4.2L7 10.8l-3.7 2 .7-4.2-3-3 4.2-.6z"
            fill={i < rating ? '#C9A84C' : '#E8DDD0'}
          />
        </svg>
      ))}
    </div>
  );
}

const SLIDE_DURATION = 5000;

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const next = useCallback(() => {
    setActive((v) => (v + 1) % REVIEWS.length);
  }, []);

  const prev = useCallback(() => {
    setActive((v) => (v - 1 + REVIEWS.length) % REVIEWS.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(next, SLIDE_DURATION);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, paused, next]);

  const review = REVIEWS[active];

  return (
    <section
      className="py-24 bg-[#FAF7F2]"
      aria-labelledby="testimonials-heading"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <span className="block w-8 h-[1.5px] bg-[#C9A84C]" aria-hidden="true" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C]">
              Customer Stories
            </span>
            <span className="block w-8 h-[1.5px] bg-[#C9A84C]" aria-hidden="true" />
          </motion.div>

          <motion.h2
            id="testimonials-heading"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold text-[#1C1C1E] tracking-tight"
          >
            Loved by the community.
          </motion.h2>
        </div>

        {/* Carousel */}
        <div className="relative" aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait">
            <motion.div
              key={review.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
              className="bg-white rounded-3xl border border-[#E8DDD0] p-8 sm:p-10 shadow-sm"
            >
              {/* Opening quote mark */}
              <div
                className="text-[5rem] leading-none text-[#C9A84C]/25 font-serif mb-2 select-none"
                aria-hidden="true"
              >
                "
              </div>

              {/* Stars */}
              <div className="mb-4">
                <StarsFilled rating={review.rating} />
              </div>

              {/* Headline */}
              <h3 className="text-[1.15rem] font-bold text-[#1C1C1E] mb-3 leading-snug">
                {review.title}
              </h3>

              {/* Body */}
              <blockquote className="text-[15px] text-[#555] leading-relaxed mb-6">
                {review.body}
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-[#F0E8DC]">
                {/* Avatar placeholder */}
                <div className="w-10 h-10 rounded-full bg-[#0D4A3C]/10 flex items-center justify-center text-[#0D4A3C] text-[14px] font-bold flex-shrink-0">
                  {review.authorName.charAt(0)}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-[#1C1C1E]">{review.authorName}</div>
                  <div className="text-[12px] text-[#888]">{review.authorLocation}</div>
                </div>

                {review.verified && (
                  <div className="ml-auto flex items-center gap-1.5 text-[11px] text-[#0D4A3C] font-medium">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M3.5 6l1.5 1.5 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Verified Purchase
                  </div>
                )}
              </div>

              {/* Product reference */}
              {review.productTitle && (
                <div className="mt-4 text-[11px] text-[#AAA]">
                  Re: {review.productTitle}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            {/* Dots */}
            <div className="flex gap-2" role="tablist" aria-label="Reviews navigation">
              {REVIEWS.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Review ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? 'w-6 bg-[#0D4A3C]' : 'w-1.5 bg-[#D4C4B0] hover:bg-[#C9A84C]'
                  }`}
                />
              ))}
            </div>

            {/* Prev / Next */}
            <div className="flex gap-2">
              <button
                onClick={prev}
                aria-label="Previous review"
                className="w-10 h-10 rounded-full border border-[#E8DDD0] bg-white flex items-center justify-center hover:border-[#C9A84C] hover:bg-[#FAF7F2] transition-all focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M9 2L4 7l5 5" stroke="#3A3A3C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={next}
                aria-label="Next review"
                className="w-10 h-10 rounded-full border border-[#E8DDD0] bg-white flex items-center justify-center hover:border-[#C9A84C] hover:bg-[#FAF7F2] transition-all focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M5 2l5 5-5 5" stroke="#3A3A3C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Aggregate rating */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 pt-10 border-t border-[#E8DDD0]"
        >
          <div className="flex gap-0.5" aria-hidden="true">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="18" height="18" viewBox="0 0 18 18">
                <path
                  d="M9 1l2.3 4.8 5.3.8-3.8 3.7.9 5.3L9 13.2 4.3 15.6l.9-5.3L1.4 6.6l5.3-.8z"
                  fill="#C9A84C"
                />
              </svg>
            ))}
          </div>
          <p className="text-[14px] text-[#555] font-medium">
            <strong className="text-[#1C1C1E]">4.9 out of 5</strong> — based on 847 verified reviews
          </p>
        </motion.div>
      </div>
    </section>
  );
}
