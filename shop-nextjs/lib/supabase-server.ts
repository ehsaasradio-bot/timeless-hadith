// lib/supabase-server.ts
// Server-side Supabase clients for edge runtime
// Use supabaseAdmin for write operations and admin actions (bypasses RLS)
// Use supabasePublic for read operations (respects RLS)

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Check .env.local');
}

// Public client — respects RLS, safe to use for read-only queries
export const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

// Admin client — bypasses RLS, ONLY use in server-side code
// NEVER expose SUPABASE_SERVICE_ROLE_KEY to the client
export function getSupabaseAdmin() {
  if (!SUPABASE_SERVICE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set. Cannot perform admin operations.');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
}
