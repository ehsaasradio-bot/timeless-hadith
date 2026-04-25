// next.config.ts
// Built for Cloudflare Pages via @cloudflare/next-on-pages
// All API routes use `export const runtime = 'edge'`
import type { NextConfig } from 'next';


const nextConfig: NextConfig = {
  // Strict mode for catching React issues early
  reactStrictMode: true,

  // Optimised image handling
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      // Add your CDN domain here, e.g.:
      // { protocol: 'https', hostname: 'cdn.timelesshadith.com' },
    ],
    minimumCacheTTL: 31536000, // 1 year for immutable assets
  },

  // Compiler optimisations
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  // Headers for security + performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // Long cache for static assets
        source: '/(_next/static|fonts|images)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects — keep shop URL canonical
  async redirects() {
    return [
      {
        source: '/store',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/merchandise',
        destination: '/shop',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
