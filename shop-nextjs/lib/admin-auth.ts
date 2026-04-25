// lib/admin-auth.ts
// Simple admin authentication middleware for API routes
// Uses a secure HTTP-only cookie set at /api/admin/login

import { NextRequest } from 'next/server';

const ADMIN_SECRET = process.env.ADMIN_SECRET;
const COOKIE_NAME = 'th_admin_session';

/**
 * Validate an incoming request is from an authenticated admin.
 * Returns true if authenticated, false otherwise.
 */
export function isAdminAuthenticated(request: NextRequest): boolean {
  if (!ADMIN_SECRET) {
    console.error('[admin-auth] ADMIN_SECRET is not set');
    return false;
  }

  const cookie = request.cookies.get(COOKIE_NAME);
  return cookie?.value === ADMIN_SECRET;
}

/**
 * Returns a Response if unauthorized, null if authorized.
 * Use at the top of every admin route handler.
 */
export function requireAdmin(request: NextRequest): Response | null {
  if (!isAdminAuthenticated(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}

export { COOKIE_NAME };
