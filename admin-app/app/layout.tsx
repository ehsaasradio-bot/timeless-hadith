// app/layout.tsx
// Root layout — required by Next.js App Router

export const runtime = 'edge';

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://timelesshadith.com'),
  title: {
    default: 'Timeless Hadith — Premium Rare Coins, Bullion & Authentic Hadith',
    template: '%s | Timeless Hadith',
  },
  description:
    'Premium rare coins and bullion — silver eagles, gold maple leafs, copper rounds, and certified collectibles. Authenticated, certified, and shipped worldwide.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
