# Timeless Hadith — Shop Page

## Structure

```
shop-nextjs/
├── app/
│   └── shop/
│       ├── page.tsx          ← Main shop page + all SEO metadata + JSON-LD
│       ├── layout.tsx        ← Font setup (Inter + Playfair Display) + base layout
│       └── shop.css          ← Design tokens, scrollbar-hide, reduced-motion, skeletons
│
├── components/shop/
│   ├── ShopHeader.tsx        ← Sticky header: search, category filters, sort, cart, wishlist
│   ├── HeroSection.tsx       ← Cinematic hero with parallax + geometric SVG pattern
│   ├── CategoryGrid.tsx      ← 8-category animated grid
│   ├── ProductCard.tsx       ← Reusable card: rating, wishlist, quick-add, badge, skeleton
│   ├── BestSellers.tsx       ← Staggered product grid using ProductCard
│   ├── RamadanBanner.tsx     ← Full-width Ramadan/Eid collection banner
│   ├── WhyShopWithUs.tsx     ← 5 trust-signal feature cards
│   ├── Testimonials.tsx      ← Auto-scrolling review carousel with manual nav
│   ├── Newsletter.tsx        ← Email signup with interest tags + animated success state
│   └── ShopFooter.tsx        ← SEO-rich internal link footer
│
├── lib/
│   └── shop-data.ts          ← Static product data, categories, reviews, FAQ
│
├── types/
│   └── shop.ts               ← TypeScript interfaces: Product, Category, Review, etc.
│
├── tailwind.config.ts        ← Extended color palette + custom tokens
├── next.config.ts            ← Image optimisation, security headers, redirects
├── tsconfig.json
└── package.json
```

## Setup

```bash
npm install
npm run dev
```

Visit: http://localhost:3000/shop

## Integration into Existing Next.js Project

Copy:
- `app/shop/` → your app router
- `components/shop/` → your components folder
- `lib/shop-data.ts` → your lib folder
- `types/shop.ts` → your types folder
- Merge `tailwind.config.ts` extensions into your own config

## Replace Placeholder Images

All `src` values in `shop-data.ts` use paths like `/shop/products/ayat-al-kursi.jpg`.
Place your product images in `public/shop/products/` and `public/shop/categories/`.

Or update to your CDN domain in `next.config.ts` under `images.remotePatterns`.

## SEO Targets

Page is optimised to rank for:
- islamic gifts
- quran gifts
- muslim merchandise
- islamic decor
- ramadan gifts
- eid gifts
- hadith wall art
- islamic journals
- prayer essentials

## Design System

| Token | Value |
|---|---|
| Ivory | `#FAF7F2` |
| Sand | `#F0E8DC` |
| Charcoal | `#1C1C1E` |
| Emerald | `#0D4A3C` |
| Gold | `#C9A84C` |
| Border | `#E8DDD0` |

## Performance Targets

- Lighthouse 95+
- CLS near zero (no layout shift from fonts — `display: swap`)
- Images: AVIF/WebP with `next/image`, lazy-loaded below fold
- Fonts: `next/font/google` with preconnect
- Animations: GPU-accelerated transform/opacity only
- Code splitting: each section in `<Suspense>` boundary

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigable (tab order, focus rings on all interactive elements)
- Proper `aria-label`, `aria-pressed`, `role`, `aria-live` throughout
- Skip-to-content link
- Screen reader: product cards, carousel, filter controls fully labelled
- `prefers-reduced-motion` respected via CSS
