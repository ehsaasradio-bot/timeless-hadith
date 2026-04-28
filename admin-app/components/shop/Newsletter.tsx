'use client';

// components/shop/Newsletter.tsx
// Clean newsletter signup with interest tags

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const INTERESTS = ['New Arrivals', 'Ramadan Drops', 'Eid Collections', 'Digital Products', 'Books'];

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      // Replace with your actual newsletter API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  return (
    <section
      className="relative overflow-hidden py-24 bg-[#1C1C1E]"
      aria-labelledby="newsletter-heading"
    >
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.04]" aria-hidden="true">
        <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="geo-nl" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
              <circle cx="24" cy="24" r="22" fill="none" stroke="#C9A84C" strokeWidth="0.6" />
              <polygon points="24,2 28,14 40,14 31,22 34,34 24,27 14,34 17,22 8,14 20,14" fill="none" stroke="#C9A84C" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#geo-nl)" />
        </svg>
      </div>

      {/* Gold accent top line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent opacity-40" aria-hidden="true" />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="py-8"
            >
              <div className="w-16 h-16 bg-[#0D4A3C] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <path d="M6 14l5 5 11-11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-[1.8rem] font-bold text-white mb-3">You're in.</h2>
              <p className="text-white/60 text-[15px]">
                Welcome to the community. We'll only send you things worth opening.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Eyebrow */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="block w-8 h-[1px] bg-[#C9A84C]/60" aria-hidden="true" />
                <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#C9A84C]">
                  Stay Connected
                </span>
                <span className="block w-8 h-[1px] bg-[#C9A84C]/60" aria-hidden="true" />
              </div>

              {/* Headline */}
              <h2 id="newsletter-heading" className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold text-white tracking-tight mb-4">
                First to know.
                <br />
                <span className="text-[#C9A84C]">Last to overpay.</span>
              </h2>

              <p className="text-white/55 text-[15px] leading-relaxed mb-8 max-w-md mx-auto">
                Get exclusive early access to new collections, seasonal drops, and subscriber-only
                discounts. No noise — only what matters.
              </p>

              {/* Interest tags */}
              <div className="flex flex-wrap justify-center gap-2 mb-8" role="group" aria-label="Select your interests">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    aria-pressed={selectedInterests.includes(interest)}
                    className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200 ${
                      selectedInterests.includes(interest)
                        ? 'bg-[#C9A84C] text-[#1C1C1E]'
                        : 'bg-white/[0.08] text-white/60 border border-white/10 hover:border-white/20 hover:text-white/80'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate aria-label="Newsletter signup">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label htmlFor="newsletter-email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="your@email.com"
                      autoComplete="email"
                      disabled={status === 'loading'}
                      aria-required="true"
                      aria-describedby={errorMsg ? 'nl-error' : undefined}
                      aria-invalid={!!errorMsg}
                      className="w-full px-5 py-3.5 bg-white/[0.08] border border-white/[0.12] text-white placeholder:text-white/35 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/60 focus:border-[#C9A84C]/40 transition-all disabled:opacity-50"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={status === 'loading'}
                    whileTap={{ scale: 0.97 }}
                    className="px-7 py-3.5 bg-[#C9A84C] text-[#1C1C1E] text-[14px] font-bold rounded-xl hover:bg-[#E8C96A] transition-all duration-200 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:ring-offset-2 focus:ring-offset-[#1C1C1E] whitespace-nowrap"
                    aria-label="Subscribe to newsletter"
                  >
                    {status === 'loading' ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin"
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          aria-hidden="true"
                        >
                          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
                          <path d="M7 2A5 5 0 0 1 12 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        Subscribing...
                      </span>
                    ) : (
                      'Subscribe'
                    )}
                  </motion.button>
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.p
                      id="nl-error"
                      role="alert"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 text-[12px] text-red-400 text-left"
                    >
                      {errorMsg}
                    </motion.p>
                  )}
                </AnimatePresence>
              </form>

              <p className="mt-4 text-[11px] text-white/30">
                No spam. Unsubscribe any time. We respect your privacy.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
