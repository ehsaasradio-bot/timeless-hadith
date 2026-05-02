'use client';

// components/shop/ShopMotionProvider.tsx
// Lazy-loads Framer Motion's DOM animation feature set so the initial bundle
// drops from ~100KB to ~20KB. Every shop component imports `m` (bare motion
// component) instead of `motion`, and the features only land once the user
// has actually scrolled to a motion element.
//
// Strict mode is enabled to fail-fast if any `<motion.X>` (instead of `<m.X>`)
// sneaks back in — that would silently re-pull the heavy bundle.

import { LazyMotion, domAnimation } from 'framer-motion';

export default function ShopMotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
