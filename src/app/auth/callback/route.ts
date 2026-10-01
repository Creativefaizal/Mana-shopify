import { NextResponse } from "next/server";
import { env, isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Google -> Supabase -> here.
 * Supabase returns a `code` which we exchange for a session cookie, then we
 * forward the customer to wherever they were heading (`next`).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/account";
  const errorDescription = url.searchParams.get("error_description");

  const redirectTo = (path: string, params: Record<string, string> = {}) => {
    const target = new URL(path, env.siteUrl);
    for (const [key, value] of Object.entries(params)) target.searchParams.set(key, value);
    return NextResponse.redirect(target);
  };

  if (errorDescription) return redirectTo("/auth/login", { error: errorDescription });
  if (!code) return redirectTo("/auth/login", { error: "Missing OAuth code" });
  if (!isSupabaseConfigured()) {
    return redirectTo("/auth/login", { error: "Supabase is not configured yet" });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return redirectTo("/auth/login", { error: "Supabase is not configured yet" });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) return redirectTo("/auth/login", { error: error.message });

  return redirectTo(next.startsWith("/") ? next : "/account");
}
