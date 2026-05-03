import { getSupabase } from "@/src/lib/supabase/server";

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}
