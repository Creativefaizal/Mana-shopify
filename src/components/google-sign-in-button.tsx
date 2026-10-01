"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";

/**
 * Google OAuth via Supabase. Supabase holds the Google client id/secret, so the
 * browser only needs the project URL + anon key.
 */
export function GoogleSignInButton({ next = "/account" }: { next?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setError(null);
    const supabase = getBrowserSupabase();

    if (!supabase) {
      setError(
        "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart the dev server.",
      );
      return;
    }

    setLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
    // On success the browser is redirected to Google, so no state reset needed.
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={signIn}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-3 rounded-pill border border-line bg-white px-6 py-3.5 text-sm font-medium text-ink transition hover:border-ink disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : (
          <GoogleGlyph className="h-4 w-4" />
        )}
        Continue with Google
      </button>

      {error && (
        <p role="alert" className="rounded-2xl bg-surface px-4 py-3 text-xs leading-5 text-ink-muted">
          {error}
        </p>
      )}
    </div>
  );
}

/** Google's official 4-colour "G" mark. */
function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.64h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.56Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.1 0 5.7-1.03 7.62-2.79l-3.72-2.89c-1.03.7-2.35 1.11-3.9 1.11-3 0-5.54-2.02-6.45-4.74H1.7v3c1.9 3.78 5.8 6.31 10.3 6.31Z"
      />
      <path
        fill="#FBBC05"
        d="M5.55 14.69a7.2 7.2 0 0 1 0-4.6v-3H1.7a12 12 0 0 0 0 10.6l3.85-3Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.69 0 3.2.58 4.4 1.72l3.29-3.29C17.7 1.24 15.1 0 12 0 7.5 0 3.6 2.53 1.7 6.31l3.85 3C6.46 6.58 9 4.75 12 4.75Z"
      />
    </svg>
  );
}
