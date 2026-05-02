// app/shop/page.tsx
// Timeless Hadith — Premium Rare Coin & Bullion Shop
// Next.js 15 App Router | TypeScript | Tailwind | Framer Motion

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Suspense } from 'react';

// Sections
import HeroSection from '@/components/shop/HeroSection';
import CategoryGrid from '@/components/shop/CategoryGrid';
import BestSellers from '@/components/shop/BestSellers';
import WhyShopWithUs from '@/components/shop/WhyShopWithUs';
import Testimonials from '@/components/shop/Testimonials';
import ShopFAQ from '@/components/shop/ShopFAQ';
import Newsletter from '@/components/shop/Newsletter';
import ShopFooter from '@/components/shop/ShopFooter';
import ShopHeader from '@/components/shop/ShopHeader';

// Single source of truth for the FAQPage JSON-LD schema (must match what's
// rendered by <ShopFAQ /> — Google penalises hidden / mismatched schema).
import { SHOP_FAQ } from '@/lib/shop-data';

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Premium Rare Coins & Bullion | Timeless Hadith Coin Shop',
  description:
    'Shop premium rare coins and bullion — silver eagles, gold maple leafs, copper rounds, and collectible numismatic coins. Authenticated, certified, and shipped worldwide.',
  keywords: [
    'rare coins',
    'silver coins',
    'gold coins',
    'bullion coins',
    'silver eagles',
    'gold maple leaf',
    'copper rounds',
    'bronze coins',
    'numismatic coins',
    'collectible coins',
    'coin shop',
    'silver bullion',
    'gold bullion',
    'investment coins',
    'certified coins',
  ],
  authors: [{ name: 'Timeless Hadith', url: 'https://timelesshadith.com' }],
  alternates: { canonical: 'https://timelesshadith.com/shop' },
  openGraph: {
    title: 'Premium Rare Coins & Bullion | Timeless Hadith Coin Shop',
    description:
      'Discover premium rare coins and bullion — silver eagles, gold maple leafs, copper rounds, and collectibles. Authenticated and shipped worldwide.',
    url: 'https://timelesshadith.com/shop',
    siteName: 'Timeless Hadith',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://timelesshadith.com/og-shop.jpg',
        width: 1200,
        height: 630,
        alt: 'Timeless Hadith Coin Shop — Premium Rare Coins & Bullion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Premium Rare Coins & Bullion | Timeless Hadith Coin Shop',
    description:
      'Discover premium rare coins and bullion — silver eagles, gold maple leafs, copper rounds, and collectibles. Authenticated and shipped worldwide.',
    site: '@timelesshadith',
    images: ['https://timelesshadith.com/og-shop.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// ─── JSON-LD Schemas ───────────────────────────────────────────────────────────

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Timeless Hadith',
  url: 'https://timelesshadith.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://timelesshadith.com/shop?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Timeless Hadith',
  url: 'https://timelesshadith.com',
  logo: 'https://timelesshadith.com/timelesshadith-logo.png',
  description:
    'Premium rare coins and bullion — silver, gold, copper, and bronze. Authenticated, certified, and shipped worldwide.',
  sameAs: [
    'https://instagram.com/timelesshadith',
    'https://facebook.com/timelesshadith',
    'https://x.com/timelesshadith',
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://timelesshadith.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Coin Shop',
      item: 'https://timelesshadith.com/shop',
    },
  ],
};

const shopSchema = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: 'Timeless Hadith Coin Shop',
  url: 'https://timelesshadith.com/shop',
  image: 'https://timelesshadith.com/og-shop.jpg',
  description:
    'Premium rare coins and bullion — silver eagles, gold maple leafs, copper rounds, and collectible numismatic coins.',
  priceRange: '$30 - $500',
  currenciesAccepted: 'USD',
  paymentAccepted: 'Credit Card, Apple Pay, Google Pay',
  openingHours: 'Mo-Su 00:00-24:00',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Rare Coins & Bullion',
    itemListElement: [
      { '@type': 'OfferCatalog', name: 'Silver Coins' },
      { '@type': 'OfferCatalog', name: 'Gold Coins' },
      { '@type': 'OfferCatalog', name: 'Copper Rounds' },
      { '@type': 'OfferCatalog', name: 'Bronze Coins' },
    ],
  },
  // NOTE: aggregateRating intentionally omitted until we have real, verified
  // review counts in shop_reviews. Google's structured-data policy forbids
  // schema that doesn't match what's visible on the page.
};

// Derived from SHOP_FAQ — guarantees the JSON-LD always matches the visible
// <ShopFAQ /> accordion. Adding/editing a question in lib/shop-data.ts updates
// both the page and the schema in lockstep.
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: SHOP_FAQ.map((q) => ({
    '@type': 'Question',
    name: q.question,
    acceptedAnswer: { '@type': 'Answer', text: q.answer },
  })),
};

// ─── Skeleton fallbacks ────────────────────────────────────────────────────────

function SectionSkeleton({
  className = '',
  label = 'Loading section',
}: {
  className?: string;
  label?: string;
}) {
  // aria-live="polite" announces the loading state to screen readers without
  // interrupting; aria-busy="true" tells assistive tech this region is updating.
  return (
    <div
      className={`animate-pulse bg-blue-50 rounded-2xl ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <span className="sr-only">{label}…</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShopPage() {
  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shopSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-xl focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>

      {/* Sticky shop header */}
      <ShopHeader />

      {/* Page breadcrumb — visible on desktop, SEO-meaningful */}
      <nav
        aria-label="Breadcrumb"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 hidden sm:block"
      >
        <ol className="flex items-center gap-2 text-[12px] text-[#AAA]" role="list">
          <li>
            <a href="/" className="hover:text-blue-600 transition-colors focus:outline-none focus:underline">
              Home
            </a>
          </li>
          <li aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </li>
          <li>
            <span className="text-blue-600 font-medium" aria-current="page">
              Coin Shop
            </span>
          </li>
        </ol>
      </nav>

      <main id="main-content">
        {/* 1. Hero */}
        <Suspense fallback={<SectionSkeleton className="min-h-[88vh] m-4" />}>
          <HeroSection />
        </Suspense>

        {/* 2. Featured Categories */}
        <Suspense fallback={<SectionSkeleton className="h-96 mx-4 my-8" />}>
          <section id="collection">
            <CategoryGrid />
          </section>
        </Suspense>

        {/* 3. Best Sellers */}
        <Suspense fallback={<SectionSkeleton className="h-[600px] mx-4 my-8" />}>
          <BestSellers />
        </Suspense>

        {/* 4. Why Shop With Us */}
        <Suspense fallback={<SectionSkeleton className="h-80 mx-4 my-8" />}>
          <WhyShopWithUs />
        </Suspense>

        {/* 5. Customer Reviews */}
        <Suspense fallback={<SectionSkeleton className="h-96 mx-4 my-8" />}>
          <Testimonials />
        </Suspense>

        {/* 6. FAQ — visible accordion that mirrors the FAQPage JSON-LD */}
        <ShopFAQ />

        {/* 7. Newsletter */}
        <Suspense fallback={<SectionSkeleton className="h-64 mx-4 my-8" />}>
          <Newsletter />
        </Suspense>
      </main>

      {/* Footer */}
      <ShopFooter />
    </>
  );
}
