// lib/cf-image-loader.ts
// Custom Next.js image loader for Cloudflare Pages.
//
// Cloudflare Pages doesn't ship the Next /  image optimisation server, but we
// don't want `images: { unoptimized: true }` because it disables width/quality
// negotiation everywhere and inflates LCP.
//
// Strategy:
//   - When the request is same-origin and the host has Cloudflare Image
//     Resizing enabled (paid feature, easy to flip on), we route through
//     /cdn-cgi/image/<options>/<src> so Cloudflare resizes & re-encodes on the
//     fly to AVIF/WebP.
//   - Otherwise we passthrough the original URL — never breaks production, just
//     skips the optimisation step.
//
// Cloudflare Image Resizing setup:
//   Dashboard → Speed → Optimization → Image Resizing → Toggle ON
//   (Free tier: 5,000 transformations/mo; Pro+: unlimited.)
//
// SVGs and remote URLs (anything not under /shop/, /images/, /og-*) are
// returned untouched — Cloudflare Resizing doesn't transform SVG and remote
// images need explicit allowlisting.

const CF_RESIZE_ENABLED = process.env.NEXT_PUBLIC_CF_IMAGE_RESIZING === 'on';

interface LoaderArgs {
  src: string;
  width: number;
  quality?: number;
}

export default function cfImageLoader({ src, width, quality }: LoaderArgs): string {
  // SVG → return as-is (Cloudflare resizing rejects vector input)
  if (src.endsWith('.svg')) return src;

  // External absolute URL → passthrough (Cloudflare Resizing can be configured
  // to allow this, but we keep it conservative).
  if (/^https?:\/\//.test(src)) return src;

  // CF Image Resizing not turned on → passthrough.
  if (!CF_RESIZE_ENABLED) return src;

  const q = Math.min(95, Math.max(40, quality ?? 75));
  const opts = `width=${width},quality=${q},format=auto,fit=scale-down`;
  // CF expects /cdn-cgi/image/<opts>/<absolute-path>
  return `/cdn-cgi/image/${opts}${src.startsWith('/') ? src : '/' + src}`;
}
