// components/shop/ShopFAQ.tsx
// Server Component — renders the SHOP_FAQ entries as a visible <details>
// accordion so the FAQPage JSON-LD schema in app/shop/page.tsx has matching
// on-page content (Google policy requires schema content to be visible).
//
// Uses native <details>/<summary> so it works without JS, is accessible by
// default, and adds zero client bundle.

import { SHOP_FAQ } from '@/lib/shop-data';

export default function ShopFAQ() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-white py-20 sm:py-24"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="block w-8 h-[1.5px] bg-[#C9A84C]" aria-hidden="true" />
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C]">
            Frequently Asked
          </span>
          <span className="block w-8 h-[1.5px] bg-[#C9A84C]" aria-hidden="true" />
        </div>

        <h2
          id="faq-heading"
          className="text-center text-[clamp(1.6rem,3vw,2.4rem)] font-bold text-[#1C1C1E] tracking-tight mb-3"
        >
          Questions, answered.
        </h2>
        <p className="text-center text-[15px] text-[#6B6B6B] mb-12 max-w-xl mx-auto">
          The most common things collectors ask before they buy. Need anything else?{' '}
          <a
            href="mailto:hello@timelesshadith.com"
            className="text-blue-600 hover:underline focus:outline-none focus:underline"
          >
            Email us
          </a>
          .
        </p>

        <ul className="space-y-3" role="list">
          {SHOP_FAQ.map((item, i) => (
            <li
              key={i}
              className="rounded-2xl border border-blue-100 bg-[#FAFCFF] overflow-hidden"
            >
              <details className="group">
                <summary
                  className="
                    flex items-center justify-between gap-4 cursor-pointer
                    px-5 py-4 sm:px-6 sm:py-5
                    text-[15px] sm:text-[16px] font-semibold text-[#1C1C1E]
                    list-none
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
                  "
                >
                  <span>{item.question}</span>
                  <span
                    className="flex-none w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 transition-transform duration-200 group-open:rotate-45"
                    aria-hidden="true"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 -mt-1">
                  <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#5A6A8A]">
                    {item.answer}
                  </p>
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
