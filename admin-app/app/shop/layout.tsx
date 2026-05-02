// app/shop/layout.tsx
// Shop layout — light-blue glassmorphism coin shop

export const runtime = 'edge';

import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './shop.css';
import ShopMotionProvider from '@/components/shop/ShopMotionProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

// Secondary serif used only for headings on cart, checkout, product, success
// and cancel pages. Loaded lazily (preload: false) and constrained to the two
// weights actually used in shop.css and component-level styles to keep the
// network footprint small.
const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  preload: false,
  weight: ['600', '700'],
  style: ['normal'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://timelesshadith.com'),
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${inter.variable} ${playfair.variable} min-h-screen font-sans antialiased`}
      style={{ background: 'var(--color-bg)' }}
    >
      <ShopMotionProvider>{children}</ShopMotionProvider>
    </div>
  );
}
