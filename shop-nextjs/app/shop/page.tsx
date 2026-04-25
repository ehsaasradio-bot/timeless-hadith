// app/shop/page.tsx
// Timeless Hadith — Premium Islamic Merchandise Page
// Next.js 14+ App Router | TypeScript | Tailwind | Framer Motion
// Static generation — no server-side data fetching required

import type { Metadata } from 'next';
import { Suspense } from 'react';

// Sections
import HeroSection from '@/components/shop/HeroSection';
import CategoryGrid from '@/components/shop/CategoryGrid';
import BestSellers from '@/components/shop/BestSellers';
import RamadanBanner from '@/components/shop/RamadanBanner';
import WhyShopWithUs from '@/components/shop/WhyShopWithUs';
import Testimonials from '@/components/shop/Testimonials';
import Newsletter from '@/components/shop/Newsletter';
import ShopFooter from '@/components/shop/ShopFooter';
import ShopHeader from '@/components/shop/ShopHeader';

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Islamic Gifts & Premium Muslim Merchandise | Timeless Hadith Shop',
  description:
    'Shop premium Islamic gifts, Quran gifts, Muslim merchandise, Ramadan gifts, and Eid gifts. Wall art, prayer essentials, journals, and more — ethically made and shipped worldwide.',
  keywords: [
    'Islamic gifts',
    'Quran gifts',
    'Muslim merchandise',
    'Islamic decor',
    'premium Islamic products',
    'Ramadan gifts',
    'Eid gifts',
    'Hadith wall art',
    'Islamic journals',
    'prayer essentials',
    'Muslim gifts',
    'Islamic home decor',
    'modest fashion',
    'Muslim kids learning',
    'Islamic books',
  ],
  authors: [{ name: 'Timeless Hadith', url: 'https://timelesshadith.com' }],
  canonical: 'https://timelesshadith.com/shop',
  openGraph: {
    title: 'Islamic Gifts & Premium Muslim Merchandise | Timeless Hadith',
    description:
      'Discover premium Islamic gifts, Quran gifts, prayer essentials, journals, and wall art. Ethically made, shipped worldwide.',
    url: 'https://timelesshadith.com/shop',
    siteName: 'Timeless Hadith',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://timelesshadith.com/og-shop.jpg',
        width: 1200,
        height: 630,
        alt: 'Timeless Hadith Shop — Premium Islamic Merchandise',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Islamic Gifts & Premium Muslim Merchandise | Timeless Hadith',
    description:
      'Discover premium Islamic gifts, Quran gifts, prayer essentials, journals, and wall art. Ethically made, shipped worldwide.',
    site: '@timelesshadith',
    images: ['https://timelesshadith.com/og-shop.jpg'],
  },
  alternates: {
    canonical: 'https://timelesshadith.com/shop',
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
    'Premium Islamic merchandise — wall art, journals, prayer essentials, books, and more. Ethically made and shipped worldwide.',
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
      name: 'Shop',
      item: 'https://timelesshadith.com/shop',
    },
  ],
};

const shopSchema = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: 'Timeless Hadith Shop',
  url: 'https://timelesshadith.com/shop',
  image: 'https://timelesshadith.com/og-shop.jpg',
  description:
    'Premium Islamic gifts, Quran gifts, Muslim merchandise, and prayer essentials. Ramadan and Eid collections available.',
  priceRange: '$12 - $149',
  currenciesAccepted: 'USD',
  paymentAccepted: 'Credit Card, PayPal, Apple Pay',
  openingHours: 'Mo-Su 00:00-24:00',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Islamic Merchandise',
    itemListElement: [
      { '@type': 'OfferCatalog', name: 'Wall Art' },
      { '@type': 'OfferCatalog', name: 'Journals' },
      { '@type': 'OfferCatalog', name: 'Prayer Essentials' },
      { '@type': 'OfferCatalog', name: 'Books' },
      { '@type': 'OfferCatalog', name: 'Apparel' },
      { '@type': 'OfferCatalog', name: 'Kids Learning' },
      { '@type': 'OfferCatalog', name: 'Home Decor' },
      { '@type': 'OfferCatalog', name: 'Digital Products' },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '847',
    bestRating: '5',
    worstRating: '1',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do you ship internationally?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — we ship to over 80 countries. Digital products are delivered instantly by email. Physical orders over $75 qualify for free shipping.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are your products ethically made?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Every physical product is sourced from ethical suppliers with fair-labor standards. We audit our supply chain annually.',
      },
    },
    {
      '@type': 'Question',
      name: 'What Islamic gifts are best for Eid?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our most popular Eid gifts are the Eid Gift Bundle, Ayat Al-Kursi framed art print, Ramadan Reflection Journal, and the Heritage Prayer Mat. All are available in our Eid Gifts collection.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I receive digital products?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'After checkout you receive a secure download link by email. Files are available for 7 days and can be downloaded up to 5 times.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is your return policy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer a 30-day no-questions-asked return on all physical products in original condition. Digital downloads are non-refundable once accessed.',
      },
    },
  ],
};

// ─── Skeleton fallbacks ────────────────────────────────────────────────────────

function SectionSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#F0E8DC] rounded-2xl ${className}`} aria-hidden="true" />
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
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#0D4A3C] focus:text-white focus:rounded-xl focus:text-sm focus:font-semibold"
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
            <a href="/" className="hover:text-[#0D4A3C] transition-colors focus:outline-none focus:underline">
              Home
            </a>
          </li>
          <li aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </li>
          <li>
            <span className="text-[#0D4A3C] font-medium" aria-current="page">
              Shop
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

        {/* 4. Ramadan / Eid Collection Banner */}
        <Suspense fallback={<SectionSkeleton className="h-80 mx-4 my-8" />}>
          <RamadanBanner />
        </Suspense>

        {/* 5. Why Shop With Us */}
        <Suspense fallback={<SectionSkeleton className="h-80 mx-4 my-8" />}>
          <WhyShopWithUs />
        </Suspense>

        {/* 6. Customer Reviews */}
        <Suspense fallback={<SectionSkeleton className="h-96 mx-4 my-8" />}>
          <Testimonials />
        </Suspense>

        {/* 7. Newsletter */}
        <Suspense fallback={<SectionSkeleton className="h-64 mx-4 my-8" />}>
          <Newsletter />
        </Suspense>
      </main>

      {/* 8. Footer */}
      <ShopFooter />
    </>
  );
}
