import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SB_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://dwcsledifvnyrunxejzd.supabase.co";

const SB_ANON =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  if (!SB_ANON) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY missing. Set it in .env.local / Cloudflare env vars.",
    );
  }
  _client = createClient(SB_URL, SB_ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

export const SUPABASE_URL = SB_URL;
