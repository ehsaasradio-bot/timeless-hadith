// app/layout.tsx
// Root layout — required by Next.js App Router

export const runtime = 'edge';

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://timelesshadith.com'),
  title: {
    default: 'Premium Coins — Timeless Value | Timeless Hadith',
    template: '%s | Timeless Hadith',
  },
  description: 'Premium collectible coins — 10 unique coins, timeless value.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
