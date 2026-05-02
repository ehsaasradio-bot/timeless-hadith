// app/sitemap.ts
// Dynamic sitemap.xml for the shop subproject.
//
// At build time (or on-demand on the edge) this enumerates every public shop URL:
//   /shop                          (storefront)
//   /shop/product/<slug>           (one per product in lib/shop-data.ts)
//   /shop/category/<slug>          (one per category in lib/shop-data.ts)
//
// We deliberately exclude /shop/admin/*, /shop/cart, /shop/checkout, /api/* —
// those are blocked in robots.ts and have noindex headers in public/_headers.
//
// The lastModified field is keyed off the deploy time so freshly-deployed
// content gets recrawled promptly.

import type { MetadataRoute } from 'next';
import { CATEGORIES, BEST_SELLERS } from '@/lib/shop-data';

const SITE = 'https://timelesshadith.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const storefront: MetadataRoute.Sitemap = [
    {
      url: `${SITE}/shop`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  const categories: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${SITE}/shop/category/${cat.slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const products: MetadataRoute.Sitemap = BEST_SELLERS.map((p) => ({
    url: `${SITE}/shop/product/${p.slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...storefront, ...categories, ...products];
}
