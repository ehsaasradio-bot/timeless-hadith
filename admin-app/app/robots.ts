// app/robots.ts
// Dynamic robots.txt for the shop subproject.
//
// We allow indexing of the public shop pages, but block:
//   - the admin surface (/shop/admin/*)
//   - all API routes (/api/*)
//   - cart/checkout/success/cancel (transactional, not content)
//
// NOTE: app/shop/layout.tsx ALSO sets metadata.robots = { index:false, follow:false }
// while the shop is still under construction. Flip that flag in the layout
// AFTER you're confident every audit issue is closed and product images are real.

import type { MetadataRoute } from 'next';

const SITE = 'https://timelesshadith.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/shop', '/shop/product/'],
        disallow: [
          '/shop/admin',
          '/shop/admin/',
          '/shop/cart',
          '/shop/checkout',
          '/shop/success',
          '/shop/cancel',
          '/api/',
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
