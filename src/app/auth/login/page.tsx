import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { ManaMark } from "@/components/mana-logo";
import { integrationStatus } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Mana with your Google account to track orders and check out faster.",
};

const PERKS = [
  { Icon: Truck, title: "Saved addresses", copy: "Checkout in three taps next time." },
  { Icon: CheckCircle2, title: "Order history", copy: "Every order, receipt and status in one place." },
  { Icon: Sparkles, title: "Mana Club pricing", copy: "Members see discounts first." },
];

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  const query = await searchParams;
  const error = typeof query.error === "string" ? query.error : null;
  const next = typeof query.next === "string" ? query.next : "/account";
  const status = integrationStatus();

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-muted">
            <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
            Secure sign in
          </span>
          <h1 className="mt-4 flex items-center gap-3 text-[34px] font-semibold tracking-[-0.035em] sm:text-[44px]">
            <ManaMark className="h-9 w-9" />
            Mana account
          </h1>
          <p className="mt-4 max-w-[52ch] text-sm leading-7 text-ink-muted">
            Mana uses Google for authentication, so there is no password to remember and no
            credentials for us to leak. Supabase verifies the Google ID token and issues the session
            cookie.
          </p>

          <dl className="mt-8 grid gap-5 sm:grid-cols-3">
            {PERKS.map(({ Icon, title, copy }) => (
              <div key={title}>
                <dt className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="h-4 w-4 text-ink-muted" strokeWidth={1.7} />
                  {title}
                </dt>
                <dd className="mt-1 text-xs leading-5 text-ink-muted">{copy}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-card border border-line bg-white p-6 shadow-panel sm:p-8">
          <h2 className="text-lg font-semibold tracking-[-0.01em]">Continue with Google</h2>
          <p className="mt-1 text-sm text-ink-muted">
            One tap, no password, works on every Mana device.
          </p>

          <div className="mt-6">
            <GoogleSignInButton next={next.startsWith("/") ? next : "/account"} />
          </div>

          {error && (
            <p className="mt-4 rounded-2xl border border-sale/30 bg-sale/5 px-4 py-3 text-xs leading-5 text-sale">
              {error}
            </p>
          )}

          <div className="mt-6 border-t border-line pt-5 text-xs leading-5 text-ink-muted">
            <p className="font-medium text-ink">Setup status</p>
            <ul className="mt-2 space-y-1">
              <li>
                Supabase project keys:{" "}
                <span className={status.supabase ? "text-ink" : "text-sale"}>
                  {status.supabase ? "configured" : "missing"}
                </span>
              </li>
              <li>
                Service role key (order writes):{" "}
                <span className={status.supabaseAdmin ? "text-ink" : "text-sale"}>
                  {status.supabaseAdmin ? "configured" : "missing"}
                </span>
              </li>
              <li>
                Mailgun keys:{" "}
                <span className={status.mailgun ? "text-ink" : "text-sale"}>
                  {status.mailgun ? "configured" : "missing"}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
