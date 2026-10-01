import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Package, ShoppingBag, Sparkles, UserCircle2 } from "lucide-react";
import { ManaMark } from "@/components/mana-logo";
import { formatDate, formatMoney } from "@/lib/format";
import { createServerSupabaseClient, getCurrentProfile } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false },
};

export default async function AccountPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login?next=/account");

  const supabase = await createServerSupabaseClient();
  let recent: Order[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, total, status, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(3);
    recent = (data ?? []) as Order[];
  }

  const lifetime = recent.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  const firstName = (profile.full_name ?? profile.email ?? "there").split(/[\s@]/)[0];

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              referrerPolicy="no-referrer"
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-ink text-white">
              <ManaMark className="h-8 w-8" />
            </span>
          )}
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">Account</p>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] sm:text-[34px]">
              Hello, {firstName}
            </h1>
            <p className="text-sm text-ink-muted">{profile.email}</p>
          </div>
        </div>

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-pill border border-line bg-white px-5 py-3 text-sm font-medium transition hover:border-ink"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.7} />
            Sign out
          </button>
        </form>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Metric icon={Package} label="Recent orders" value={String(recent.length)} />
        <Metric
          icon={ShoppingBag}
          label="Recent spend"
          value={formatMoney(lifetime)}
        />
        <Metric icon={Sparkles} label="Mana Club" value="5% over $500" />
      </div>

      <section className="mt-8 rounded-card border border-line bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold tracking-[-0.01em]">Latest orders</h2>
          <Link href="/account/orders" className="text-xs text-ink-muted underline transition hover:text-ink">
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="mt-4 flex items-start gap-2 text-sm text-ink-muted">
            <UserCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.7} />
            Nothing here yet. Orders you place while signed in are stored in Supabase under your
            account.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {recent.map((order) => (
              <li key={order.id ?? order.order_number} className="flex items-center justify-between gap-4 py-3">
                <span>
                  <span className="block text-sm font-medium">{order.order_number}</span>
                  <span className="text-xs text-ink-muted">{formatDate(order.created_at)}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="rounded-pill border border-line px-3 py-1 text-[11px] capitalize">
                    {order.status}
                  </span>
                  <span className="text-sm font-semibold">{formatMoney(Number(order.total))}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-card border border-line bg-white p-5">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-surface">
        <Icon className="h-4 w-4 text-ink" strokeWidth={1.7} />
      </span>
      <p className="mt-3 text-xs uppercase tracking-[0.12em] text-ink-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
