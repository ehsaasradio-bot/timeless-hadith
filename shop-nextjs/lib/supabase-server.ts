// lib/supabase-server.ts
// Server-side Supabase clients for edge runtime
// Use getSupabaseAdmin() for write operations and admin actions (bypasses RLS)
// Use getSupabasePublic() for read operations (respects RLS)

import { createClient } from '@supabase/supabase-js';

// Public client — respects RLS, safe to use for read-only queries
export function getSupabasePublic() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error('Missing Supabase environment variables.');
  }
  return createClient(url, anon, { auth: { persistSession: false } });
}

// Admin client — bypasses RLS, ONLY use in server-side code
// NEVER expose SUPABASE_SERVICE_ROLE_KEY to the client
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set. Cannot perform admin operations.');
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

// Legacy export for backwards compatibility
export const supabasePublic = {
  from: (...args: Parameters<ReturnType<typeof getSupabasePublic>['from']>) =>
    getSupabasePublic().from(...args),
};
