import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "../env";

/**
 * Read-only client for catalogue queries made from server components.
 * No cookies / no session, so it can be cached safely.
 */
let cached: SupabaseClient | null = null;

export function getPublicSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;
  cached = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
