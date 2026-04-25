'use client';

// components/shop/WhyShopWithUs.tsx
// Trust signals with clean icon + text layout

import { motion } from 'framer-motion';

const FEATURES = [
  {
    id: 'quality',
    title: 'Premium Quality',
    description:
      'Every product is held to exacting standards — museum-quality prints, ethically sourced materials, and finishes that last decades.',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
        <path
          d="M12 2l3 6.5 7 1-5 4.9 1.2 7L12 18l-6.2 3.4L7 14.4 2 9.5l7-1L12 2z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'designs',
    title: 'Meaningful Designs',
    description:
      'Each piece is thoughtfully designed to reflect Islamic heritage — geometric patterns, classical calligraphy, and subtle artistic elegance.',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.4"
        />
      </svg>
    ),
  },
  {
    id: 'shipping',
    title: 'Worldwide Shipping',
    description:
      'We ship to 80+ countries. Orders over $75 ship free. Digital products deliver instantly — no waiting, no customs.',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 3c-3.5 4-3.5 14 0 18M12 3c3.5 4 3.5 14 0 18M3 12h18"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'checkout',
    title: 'Secure Checkout',
    description:
      'Encrypted payments via Stripe. Shop with confidence knowing your data is protected with industry-standard security.',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
        <path
          d="M12 2L4 6v6c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V6L12 2z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'ethical',
    title: 'Ethically Made',
    description:
      'We audit our suppliers annually. Fair wages, sustainable materials, and no cutting corners — because your trust matters.',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
        <path
          d="M12 21C12 21 4 16 4 9.5A4 4 0 0 1 12 7.1 4 4 0 0 1 20 9.5C20 16 12 21 12 21Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function WhyShopWithUs() {
  return (
    <section className="py-24 bg-white" aria-labelledby="why-shop-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <span className="block w-8 h-[1.5px] bg-[#C9A84C]" aria-hidden="true" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C]">
              Why Choose Us
            </span>
            <span className="block w-8 h-[1.5px] bg-[#C9A84C]" aria-hidden="true" />
          </motion.div>

          <motion.h2
            id="why-shop-heading"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold text-[#1C1C1E] tracking-tight"
          >
            Built on trust.
            <br />
            <span className="text-[#0D4A3C]">Delivered with care.</span>
          </motion.h2>
        </div>

        {/* Feature cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5"
          role="list"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.id}
              variants={cardVariants}
              role="listitem"
              className="group flex flex-col items-start gap-4 p-6 bg-[#FAF7F2] rounded-2xl border border-[#E8DDD0] hover:border-[#C9A84C]/40 hover:bg-white hover:shadow-md hover:shadow-[#C9A84C]/06 transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-[#0D4A3C]/08 rounded-2xl flex items-center justify-center text-[#0D4A3C] group-hover:bg-[#0D4A3C] group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>

              <div>
                <h3 className="text-[15px] font-semibold text-[#1C1C1E] mb-2">{feature.title}</h3>
                <p className="text-[13px] text-[#666] leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-14 pt-10 border-t border-[#E8DDD0]"
        >
          {[
            { label: 'Returns within 30 days' },
            { label: 'Secure SSL checkout' },
            { label: 'Supports independent makers' },
            { label: '4.9 average rating' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-[12px] font-medium text-[#888]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="6" stroke="#0D4A3C" strokeWidth="1.2" opacity="0.4" />
                <path d="M4.5 7l2 2 3-3" stroke="#0D4A3C" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item.label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
