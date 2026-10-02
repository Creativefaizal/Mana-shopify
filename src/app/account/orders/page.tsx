import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, Receipt } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/format";
import { createServerSupabaseClient, getCurrentUser } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "My orders",
  robots: { index: false },
};

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-ink text-white",
  pending: "bg-surface text-ink border border-line",
  processing: "bg-surface text-ink border border-line",
  shipped: "bg-surface text-ink border border-line",
  delivered: "bg-ink text-white",
  cancelled: "bg-sale text-white",
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/account/orders");

  const supabase = await createServerSupabaseClient();
  let orders: (Order & { order_items: OrderItem[] })[] = [];
  let errorMessage: string | null = null;

  if (supabase) {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      errorMessage =
        error.code === "42P01"
          ? "The orders table does not exist yet. Run supabase/schema.sql in your Supabase SQL editor."
          : error.message;
    } else {
      orders = (data ?? []) as (Order & { order_items: OrderItem[] })[];
    }
  } else {
    errorMessage = "Supabase is not configured yet, so there is nowhere to load orders from.";
  }

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">Account</p>
        <h1 className="mt-2 flex items-center gap-3 text-[32px] font-semibold tracking-[-0.035em] sm:text-[40px]">
          <Receipt className="h-8 w-8" strokeWidth={1.6} />
          My orders
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Signed in as <span className="text-ink">{user.email}</span>. Orders placed while signed in
          appear here with their status.
        </p>
      </header>

      {errorMessage && (
        <p className="rounded-2xl border border-sale/30 bg-sale/5 px-4 py-3 text-sm text-sale">
          {errorMessage}
        </p>
      )}

      {!errorMessage && orders.length === 0 && (
        <div className="rounded-card border border-dashed border-line bg-white/70 px-6 py-16 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface">
            <Package className="h-6 w-6 text-ink-muted" strokeWidth={1.6} />
          </span>
          <p className="mt-4 text-base font-medium">No orders yet</p>
          <p className="mx-auto mt-2 max-w-[42ch] text-sm text-ink-muted">
            Place your first order and it will show up here with tracking and receipts.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-pill bg-ink px-6 py-3 text-sm font-medium text-white transition hover:bg-ink-soft"
          >
            Browse the shop
          </Link>
        </div>
      )}

      <ul className="space-y-5">
        {orders.map((order) => (
          <li key={order.id ?? order.order_number} className="rounded-card border border-line bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{order.order_number}</p>
                <p className="text-xs text-ink-muted">{formatDate(order.created_at)}</p>
              </div>
              <span
                className={`rounded-pill px-3 py-1 text-[11px] font-medium capitalize ${
                  STATUS_STYLES[order.status] ?? "bg-surface text-ink border border-line"
                }`}
              >
                {order.status === "pending" ? "Awaiting payment" : order.status}
              </span>
            </div>

            <ul className="mt-4 divide-y divide-line">
              {order.order_items?.map((item) => (
                <li key={`${order.order_number}-${item.product_slug}`} className="flex items-center gap-3 py-3">
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-tile">
                    <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.product_slug}`}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {item.product_name}
                    </Link>
                    <span className="text-xs text-ink-muted">
                      {item.quantity} x {formatMoney(item.unit_price)}
                    </span>
                  </span>
                  <span className="text-sm font-medium">{formatMoney(item.line_total)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm">
              <span className="text-ink-muted">
                {order.shipping_method === "express" ? "Express" : "Standard"} shipping ·{" "}
                {order.city}, {order.country}
              </span>
              <span className="font-semibold">Total {formatMoney(order.total)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
