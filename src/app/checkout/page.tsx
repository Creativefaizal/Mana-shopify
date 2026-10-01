import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";
import { getCurrentProfile } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure Mana checkout: address, delivery and payment in one step.",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs text-ink-muted transition hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
            Continue shopping
          </Link>
          <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.035em] sm:text-[42px]">
            Checkout
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
            <Lock className="h-4 w-4" strokeWidth={1.7} />
            {profile
              ? `Signed in as ${profile.email} - your order will be saved to your account.`
              : "Checkout as a guest, or sign in with Google to keep your order history."}
          </p>
        </div>
        {!profile && (
          <Link
            href="/auth/login?next=/checkout"
            className="rounded-pill border border-line bg-white px-5 py-3 text-sm font-medium transition hover:border-ink"
          >
            Sign in with Google
          </Link>
        )}
      </div>

      <CheckoutForm profile={profile} />
    </div>
  );
}
