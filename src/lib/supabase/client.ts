import { createBrowserClient } from "@supabase/ssr";
import { env, isSupabaseConfigured } from "../env";

/**
 * Browser Supabase client - used for "Continue with Google" and anything else
 * that has to happen in the user's tab. Returns `null` before the project keys
 * are filled in so callers can show the setup checklist instead of crashing.
 */
let cached: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;
  cached = createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
  return cached;
}
