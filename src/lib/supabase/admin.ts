import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, isSupabaseAdminConfigured } from "../env";

/**
 * Service-role client. SERVER ONLY - it bypasses row level security, so it is
 * used exclusively by the checkout / newsletter routes to write orders,
 * order items, subscribers and the email log.
 */
let cached: SupabaseClient | null = null;

export function getAdminSupabase(): SupabaseClient | null {
  if (!isSupabaseAdminConfigured()) return null;
  if (cached) return cached;
  cached = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
