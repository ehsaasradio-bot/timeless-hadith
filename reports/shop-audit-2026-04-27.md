# Timeless Hadith Shop — Full Audit Report
**URL:** https://shop.timelesshadith.com  
**Date:** 2026-04-27  
**Auditor:** Claude (automated deep audit)  
**Total Issues:** 29 | Critical: 1 | High: 10 | Medium: 12 | Low: 6

---

## Overall Ratings

| Dimension | Rating | Score |
|---|---|---|
| SEO | ⭐⭐☆☆☆ | 2/5 |
| Performance | ⭐⭐☆☆☆ | 2/5 |
| Security | ⭐⭐☆☆☆ | 2/5 |
| CSS / Accessibility | ⭐⭐⭐☆☆ | 3/5 |
| **Overall** | **⭐⭐☆☆☆** | **2.25/5** |

> The shop is deployed and functional but not production-ready. The main blockers are missing images, no CSP header, unprotected admin panel, no sitemap/robots.txt, and all content being client-rendered.

---

## SEO Issues

| # | Issue | Severity | Status |
|---|---|---|---|
| 1.1 | OG image `og-shop.jpg` missing from public/ — social shares show no preview | 🔴 High | Not Fixed |
| 1.2 | No sitemap.xml or app/sitemap.ts — search engines crawl blindly | 🔴 High | Not Fixed |
| 1.3 | No robots.txt — admin panel and API routes are crawlable by Google | 🔴 High | Not Fixed |
| 1.4 | `WhyShopWithUs` section has no `<h2>` heading tag | 🟡 Medium | Not Fixed |
| 1.5 | Root layout meta description is a placeholder ("10 unique coins, timeless value") | 🟡 Medium | Not Fixed |
| 1.6 | CATEGORIES data only has 2 entries (silver, gold) — copper and bronze missing | 🟡 Medium | Not Fixed |
| 1.7 | FAQ JSON-LD schema exists but FAQ content is not visible on the page (Google violation) | 🟢 Low | Not Fixed |
| 1.8 | AggregateRating schema uses hardcoded fake numbers (4.9 stars, 312 reviews) | 🟢 Low | Not Fixed |
| 1.9 | Footer shop links point to old Islamic gift shop categories — all 404 | 🟢 Low | Not Fixed |
| 1.10 | Canonical trailing-slash consistency unverified | 🟢 Low | Needs Verification |

---

## Performance Issues

| # | Issue | Severity | Status |
|---|---|---|---|
| 2.1 | `images: { unoptimized: true }` disables all Next.js image optimization (WebP, AVIF, resize) | 🔴 High | Not Fixed |
| 2.2 | Every above-the-fold section is `'use client'` — page needs JS before anything renders | 🔴 High | Not Fixed |
| 2.3 | All product images missing from public/ — skeleton placeholders show forever | 🔴 High | Not Fixed |
| 2.4 | Full Framer Motion bundle (~100KB gzipped) loaded on every page | 🟡 Medium | Not Fixed |
| 2.5 | Playfair Display font loaded in layout but never used in any component | 🟡 Medium | Not Fixed |
| 2.6 | Newsletter rate limiter uses in-memory Map — resets per Cloudflare edge instance | 🟡 Medium | Not Fixed |
| 2.7 | No cache headers for API routes or shop HTML responses | 🟢 Low | Not Fixed |

---

## Security Issues

| # | Issue | Severity | Status |
|---|---|---|---|
| 3.1 | **No Content-Security-Policy header** — shop processes payments with zero XSS protection | 🚨 Critical | Not Fixed |
| 3.2 | No middleware.ts — `/shop/admin` HTML/JS fully served to unauthenticated visitors | 🔴 High | Not Fixed |
| 3.3 | Admin session token is static/deterministic — one leaked cookie = permanent access | 🔴 High | Not Fixed |
| 3.4 | No rate limiting on admin login — 300ms delay is not brute-force protection | 🔴 High | Not Fixed |
| 3.5 | `shop_reviews` insertable via public anon key — verify RLS policy is enforced | 🟡 Medium | Needs Verification |
| 3.6 | Cart stores full product objects — verify checkout re-prices from DB, not client | 🟢 Low | Not Fixed |
| 3.7 | `X-XSS-Protection: 1; mode=block` is deprecated and can introduce vulnerabilities | 🟢 Low | Not Fixed |

---

## CSS / UI / Accessibility Issues

| # | Issue | Severity | Status |
|---|---|---|---|
| 4.1 | No dark mode support — hardcoded light palette, no `prefers-color-scheme` | 🟡 Medium | Not Fixed |
| 4.2 | `role="listitem"` on `<button>` elements in filter strip (invalid ARIA) | 🟡 Medium | Not Fixed |
| 4.3 | `role="option"` on `<button>` in sort dropdown (invalid — must use `<li>`) | 🟡 Medium | Not Fixed |
| 4.4 | Hero right column `aria-hidden="true"` hides price info ($38) from screen readers | 🟡 Medium | Not Fixed |
| 4.5 | Category cards show SVG placeholders only — real images never rendered | 🟡 Medium | Not Fixed |
| 4.6 | Cart/wishlist badge counts never wired to `cart:updated` localStorage events | 🟡 Medium | Not Fixed |
| 4.7 | Global `focus-visible` CSS conflicts with Tailwind `focus:outline-none` per-component | 🟢 Low | Needs Verification |
| 4.8 | Suspense skeleton has `aria-hidden` but no `aria-live` loading announcement | 🟢 Low | Not Fixed |
| 4.9 | Raw pixel font sizes (`text-[12px]`) everywhere instead of named design tokens | 🟢 Low | Not Fixed |

---

## Priority Fix Order

### Do First (blocks going live)
1. Add product images to `public/shop/coins/` and `public/shop/categories/`
2. Add CSP header to `public/_headers`
3. Add `middleware.ts` to protect `/shop/admin` server-side
4. Create `public/robots.txt` — block `/shop/admin`, `/api/`, `/shop/cart`, `/shop/checkout`
5. Create `app/sitemap.ts` for Next.js dynamic sitemap

### Do Second (SEO & trust)
6. Create `public/og-shop.jpg` (1200×630px)
7. Add copper and bronze entries to `CATEGORIES` in `lib/shop-data.ts`
8. Fix footer shop links to use correct coin category slugs
9. Replace fake AggregateRating with real data or remove it
10. Move FAQ schema content to a visible accordion on the page

### Do Third (hardening)
11. Replace static admin session with per-session random token + KV storage
12. Add IP-based rate limiting on `/api/admin/login`
13. Replace in-memory newsletter rate limiter with KV
14. Remove `X-XSS-Protection` header
15. Remove unused Playfair Display font from shop layout

### Do Fourth (polish)
16. Convert CategoryGrid and HeroSection text to Server Components
17. Use `LazyMotion` with `domAnimation` feature set in Framer Motion
18. Wire cart count to `cart:updated` event in ShopHeader
19. Fix ARIA roles on filter strip and sort dropdown
20. Add dark mode support to shop CSS

---

## What's Already Working Well ✅
- Deployment pipeline (GitHub → Cloudflare Pages auto-deploy)
- Basic security headers (HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- Supabase schema created with RLS enabled on all tables
- Environment variables all configured in Cloudflare
- Custom domain `shop.timelesshadith.com` live with SSL
- Next.js App Router structure is correct
- Edge runtime configured throughout
- Cart persistence in localStorage works
- Admin authentication logic (HMAC) is correct in concept, needs hardening
