// next.config.ts
// Built for Cloudflare Pages via @cloudflare/next-on-pages
// NOTE: headers() and redirects() are NOT supported by @cloudflare/next-on-pages.
// Security headers → public/_headers
// Redirects       → public/_redirects

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Pin URL convention: never serve /shop/ — always /shop. Keeps canonical tags,
  // sitemap entries, OG urls, and JSON-LD URL fields all in one form.
  trailingSlash: false,

  images: {
    // We route through a custom loader (lib/cf-image-loader.ts) that uses
    // Cloudflare's /cdn-cgi/image/ endpoint when image-resizing is enabled
    // (NEXT_PUBLIC_CF_IMAGE_RESIZING=on). When disabled, the loader passes
    // the src through unchanged — keeping production safe by default.
    loader: 'custom',
    loaderFile: './lib/cf-image-loader.ts',
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      // Add your CDN domain here once you have one, e.g.:
      // { protocol: 'https', hostname: 'cdn.timelesshadith.com' },
    ],
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },

  // headers() and redirects() are silently ignored by @cloudflare/next-on-pages.
  // They have been moved to public/_headers and public/_redirects respectively.
};

export default nextConfig;
