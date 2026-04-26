// next.config.ts
// Built for Cloudflare Pages via @cloudflare/next-on-pages
// NOTE: headers() and redirects() are NOT supported by @cloudflare/next-on-pages.
// Security headers → public/_headers
// Redirects       → public/_redirects

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    // REQUIRED for Cloudflare Pages — no image optimisation server available.
    unoptimized: true,
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
