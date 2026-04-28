// app/page.tsx
// Root route — redirect to /shop
import { redirect } from 'next/navigation';

export const runtime = 'edge';

export default function RootPage() {
  redirect('/shop');
}
