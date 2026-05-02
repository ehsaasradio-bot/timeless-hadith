// middleware.ts
// Edge middleware that protects the admin surface server-side.
//
// Without this, /shop/admin sub-page HTML and JS would be served to every
// visitor before the client-side LoginGate had a chance to redirect — leaking
// the admin UI shell. This middleware runs at the edge, before any HTML is
// sent, and 302s anonymous traffic back to /shop/admin (which renders the
// LoginGate) — or 401s the API.
//
// Authentication is KV-backed: see lib/admin-auth.ts. Sessions are random
// server-issued IDs, revocable on logout, with TTL enforced server-side.

import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';

// /shop/admin is the LoginGate's home — always allow it through so the gate
// can render. Sub-paths (/shop/admin/orders, etc.) are gated.
const isAdminGate = (p: string) =>
  p === '/shop/admin' || p === '/shop/admin/';

const isAdminSubPage = (p: string) =>
  p.startsWith('/shop/admin/') && !isAdminGate(p);

const isAdminApi = (p: string) =>
  p.startsWith('/api/admin/');

// /api/admin/login is how a client *gets* a session — never block it.
const isAdminLoginApi = (p: string) =>
  p === '/api/admin/login' || p === '/api/admin/login/';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login API and the gate page itself are always reachable.
  if (isAdminLoginApi(pathname) || isAdminGate(pathname)) {
    return NextResponse.next();
  }

  const guarded = isAdminSubPage(pathname) || isAdminApi(pathname);
  if (!guarded) return NextResponse.next();

  const authed = await isAdminAuthenticated(request);

  if (authed) {
    // Defence in depth — re-assert sensitive headers on every authed response.
    const res = NextResponse.next();
    res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.headers.set('Referrer-Policy', 'no-referrer');
    return res;
  }

  // API → 401 JSON (clients expect a status code, not a redirect).
  if (isAdminApi(pathname)) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
        'WWW-Authenticate': 'Cookie realm="admin"',
      },
    });
  }

  // Sub-page → 302 to the gate, preserving the intended destination.
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/shop/admin';
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl, 302);
}

// Only run middleware on admin paths — keeps cold start small.
export const config = {
  matcher: [
    '/shop/admin',
    '/shop/admin/:path*',
    '/api/admin/:path*',
  ],
};
