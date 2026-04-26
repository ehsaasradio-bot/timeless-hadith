// app/shop/layout.tsx
// Shop layout — light-blue glassmorphism coin shop

export const runtime = 'edge';

import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './shop.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://timelesshadith.com'),
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${inter.variable} ${playfair.variable} min-h-screen font-sans antialiased`}
      style={{ background: 'var(--color-bg)' }}
    >
      {children}
    </div>
  );
}
