import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

/**
 * Next.js 16 file convention (formerly `middleware.ts`).
 *
 * Its only job is refreshing the Supabase auth cookie on real requests, so the
 * server components always see a valid session. It is a no-op when Supabase is
 * not configured yet.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and SVG artwork - the session refresh has
     * to run on real page and API requests to keep cookies in sync.
     */
    "/((?!_next/static|_next/image|products/|favicon.ico|icon.svg|hero-interior.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
