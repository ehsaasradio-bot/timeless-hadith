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
      className={`${inter.variable} ${playfair.variable} min-h-s