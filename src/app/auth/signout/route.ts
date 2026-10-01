import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function signOutAndRedirect(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/", env.siteUrl), { status: 303 });
}

export async function POST(request: Request) {
  return signOutAndRedirect(request);
}

export async function GET(request: Request) {
  return signOutAndRedirect(request);
}
