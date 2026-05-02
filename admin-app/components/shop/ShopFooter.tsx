// components/shop/ShopFooter.tsx
// SEO-rich footer with internal links — Server Component

import Link from 'next/link';

// All footer links match real, live destinations:
//   - Shop categories use the slugs defined in lib/shop-data.ts (silver/gold/copper/bronze).
//   - Learn links cross-reference the static site (/, /categories, /about, etc.).
//   - Support pages live under /shop/* and are queued for content; until built they
//     simply 404 — flag here once they ship.
const FOOTER_LINKS = {
  'Shop': [
    { label: 'All Products',   href: '/shop' },
    { label: 'Silver Coins',   href: '/shop/category/silver' },
    { label: 'Gold Coins',     href: '/shop/category/gold' },
    { label: 'Copper Rounds',  href: '/shop/category/copper' },
    { label: 'Bronze Coins',   href: '/shop/category/bronze' },
  ],
  'Featured': [
    { label: 'Best Sellers',          href: '/shop#best-sellers' },
    { label: 'New Arrivals',          href: '/shop#new-arrivals' },
    { label: 'American Silver Eagle', href: '/shop/product/american-silver-eagle' },
    { label: 'Gold Maple Leaf',       href: '/shop/product/canadian-gold-maple-leaf' },
    { label: 'Mjolnir Round',         href: '/shop/product/mjolnir-hammer-silver' },
  ],
  'Learn': [
    { label: 'Hadith Library', href: 'https://timelesshadith.com/' },
    { label: 'Categories',     href: 'https://timelesshadith.com/categories' },
    { label: 'Blog',           href: 'https://timelesshadith.com/blog' },
    { label: 'About Us',       href: 'https://timelesshadith.com/about' },
  ],
  'Support': [
    { label: 'Frequently Asked Questions', href: '/shop#faq' },
    { label: 'Shipping & Returns',         href: '/shop#faq' },
    { label: 'Authentication',             href: '/shop#why' },
    { label: 'Contact',                    href: 'mailto:hello@timelesshadith.com' },
  ],
  'Company': [
    { label: 'Privacy Policy',    href: 'https://timelesshadith.com/privacy' },
    { label: 'Terms of Service',  href: 'https://timelesshadith.com/terms' },
    { label: 'Sitemap',           href: '/sitemap.xml' },
  ],
};

function GeometricDivider() {
  return (
    <div className="flex items-center gap-3 my-8" aria-hidden="true">
      <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#E8DDD0]" />
      <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
        <polygon points="10,1 13,7 19,7 14,11 16,17 10,13 4,17 6,11 1,7 7,7" stroke="#C9A84C" strokeWidth="1" fill="none" opacity="0.6" />
      </svg>
      <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#E8DDD0]" />
    </div>
  );
}

export default function ShopFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FAF7F2] border-t border-[#E8DDD0]" aria-label="Shop footer">
      {/* Main link grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand col */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-block mb-4 focus:outline-none focus:underline" aria-label="Timeless Hadith home">
              <span className="text-[16px] font-bold text-[#0D4A3C] tracking-tight">
                Timeless Hadith
              </span>
            </Link>
            <p className="text-[13px] text-[#888] leading-relaxed max-w-[180px]">
              Premium Islamic products for every moment of your faith journey.
            </p>

            {/* Social links */}
            <div className="flex gap-3 mt-6">
              {[
                { label: 'Instagram', href: 'https://instagram.com/timelesshadith', icon: (
                  <svg viewBox="0 0 18 18" width="16" height="16" fill="none" aria-hidden="true">
                    <rect x="2" y="2" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1.4" />
                    <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.4" />
                    <circle cx="13.5" cy="4.5" r="0.8" fill="currentColor" />
                  </svg>
                )},
                { label: 'Facebook', href: 'https://facebook.com/timelesshadith', icon: (
                  <svg viewBox="0 0 18 18" width="16" height="16" fill="none" aria-hidden="true">
                    <path d="M10 9h2.5l.5-3H10V4.5c0-.8.4-1.5 1.5-1.5H13V1s-.8-.1-1.8-.1C8.7.9 8 2.9 8 4.5V6H5.5v3H8v9h2V9z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  </svg>
                )},
                { label: 'Twitter / X', href: 'https://x.com/timelesshadith', icon: (
                  <svg viewBox="0 0 18 18" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path d="M13.8 2H16l-4.8 5.5L16.8 16h-4.2l-3.2-4.2L5.6 16H3.4l5.1-5.8L3 2h4.3l2.9 3.9L13.8 2zm-.8 12.5h1.2L5 3.3H3.7l9.3 11.2z" />
                  </svg>
                )},
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-8 h-8 rounded-full border border-[#E0D0BC] flex items-center justify-center text-[#888] hover:border-[#0D4A3C] hover:text-[#0D4A3C] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <nav key={group} aria-label={`${group} links`}>
              <h3 className="text-[12px] font-bold text-[#1C1C1E] tracking-wider uppercase mb-4">
                {group}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[#777] hover:text-[#0D4A3C] transition-colors duration-150 focus:outline-none focus:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <GeometricDivider />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-[#AAA]">
            &copy; {currentYear} Timeless Hadith. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {/* Payment icons */}
            <div className="flex gap-2 items-center" aria-label="Accepted payment methods">
              {['Visa', 'Mastercard', 'PayPal', 'Apple Pay'].map((pm) => (
                <span
                  key={pm}
                  className="px-2 py-1 bg-white border border-[#E0D0BC] rounded text-[9px] font-bold text-[#888] uppercase tracking-wide"
                >
                  {pm}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* SEO: Bottom keyword-rich paragraph */}
        <p className="mt-8 text-[11px] text-[#CCC] leading-relaxed max-w-3xl">
          Timeless Hadith Shop offers premium Islamic gifts, Quran gifts, Muslim merchandise, Islamic decor,
          Ramadan gifts, Eid gifts, Hadith wall art, Islamic journals, and prayer essentials — shipped
          worldwide. Every product is ethically sourced and thoughtfully designed for the modern Muslim home.
        </p>
      </div>
    </footer>
  );
}
