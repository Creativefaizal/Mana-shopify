"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, MailCheck, Package, TriangleAlert } from "lucide-react";
import { BankDetails } from "@/components/bank-details";
import { CartTotals } from "@/components/cart-totals";
import { RECEIPT_KEY } from "@/components/checkout-form";
import { formatDate, formatMoney } from "@/lib/format";
import { paymentLabel } from "@/lib/payment";
import type { Order, OrderItem } from "@/lib/types";

interface Receipt {
  order: Order & { order_items: OrderItem[] };
  emails: { customer: boolean; store: boolean; skipped: boolean };
  persisted: boolean;
}

export function OrderReceipt({ orderNumber }: { orderNumber: string }) {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(RECEIPT_KEY);
      if (raw) setReceipt(JSON.parse(raw) as Receipt);
    } catch {
      /* ignore malformed receipts */
    }
    setLoaded(true);
  }, []);

  const order = receipt?.order;
  const items: OrderItem[] = order?.order_items ?? [];

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-10 sm:px-6">
      <div className="rounded-card border border-line bg-white p-6 shadow-panel sm:p-10">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white">
          <CheckCircle2 className="h-7 w-7" strokeWidth={1.8} />
        </span>

        <h1 className="mt-6 text-[30px] font-semibold leading-tight tracking-[-0.03em] sm:text-[38px]">
          Thank you - your order is in
        </h1>
        <p className="mt-3 max-w-[60ch] text-sm leading-7 text-ink-muted">
          Order <span className="font-medium text-ink">{order?.order_number ?? orderNumber}</span>
          {order ? ` was placed on ${formatDate(order.created_at)}` : " was received"}. A
          confirmation email {receipt?.emails.customer ? "is on its way" : "will be sent"} to{" "}
          <span className="font-medium text-ink">{order?.email ?? "your inbox"}</span>.
        </p>

        {receipt && (
          <div className="mt-6 space-y-2">
            <p className="flex items-center gap-2 text-xs text-ink-muted">
              <MailCheck className="h-4 w-4" strokeWidth={1.7} />
              {receipt.emails.customer
                ? "Confirmation delivered through Mailgun."
                : "Mailgun keys are not configured yet, so the confirmation was logged on the server instead."}
            </p>
            {!receipt.persisted && (
              <p className="flex items-start gap-2 rounded-2xl border border-sale/30 bg-sale/5 px-4 py-3 text-xs leading-5 text-sale">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} />
                Demo mode: SUPABASE_SERVICE_ROLE_KEY (or the tables) are missing, so this order was
                not stored in the database. Run supabase/schema.sql, then restart.
              </p>
            )}
          </div>
        )}

        {loaded && order?.payment_method === "bank_transfer" && (
          <div className="mt-8 rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-base font-semibold">Complete your bank transfer</h2>
            <p className="mt-1 text-xs leading-5 text-ink-muted">
              Use your order number as the reference so we can match the payment. We ship as soon
              as it lands.
            </p>
            <div className="mt-4">
              <BankDetails reference={order.order_number} amount={order.total} />
            </div>
          </div>
        )}
        {loaded && order?.payment_method === "pay_on_delivery" && (
          <p className="mt-8 rounded-2xl border border-line bg-surface p-5 text-sm leading-6 text-ink-muted">
            Please have <span className="font-medium text-ink">{formatMoney(order.total)}</span>{" "}
            ready for the courier. You can pay in cash or by card on arrival.
          </p>
        )}

        {loaded && items.length > 0 && <ItemsBlock items={items} />}
        {loaded && order && <AddressBlock order={order} />}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="rounded-pill bg-ink px-6 py-3 text-sm font-medium text-white transition hover:bg-ink-soft"
          >
            Keep shopping
          </Link>
          <Link
            href="/account/orders"
            className="rounded-pill border border-line px-6 py-3 text-sm font-medium transition hover:border-ink"
          >
            View my orders
          </Link>
        </div>
      </div>
    </div>
  );
}

function ItemsBlock({ items }: { items: OrderItem[] }) {
  return (
    <div className="mt-8 border-t border-line pt-6">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Package className="h-4 w-4 text-ink-muted" strokeWidth={1.7} />
        What is on the way
      </h2>
      <ul className="mt-4 space-y-4">
        {items.map((item) => (
          <li key={item.product_slug} className="flex items-center gap-3">
            <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-tile">
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
            <span className="text-sm font-semibold">{formatMoney(item.line_total)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AddressBlock({ order }: { order: Order }) {
  return (
    <div className="mt-6 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
      <div>
        <h3 className="text-xs uppercase tracking-[0.12em] text-ink-muted">Shipping to</h3>
        <address className="mt-2 text-sm not-italic leading-6 text-ink-muted">
          {order.full_name}
          <br />
          {order.address_line1}
          {order.address_line2 ? (
            <>
              <br />
              {order.address_line2}
            </>
          ) : null}
          <br />
          {[order.city, order.state, order.postal_code].filter(Boolean).join(", ")}
          <br />
          {order.country}
        </address>
      </div>
      <div>
        <h3 className="text-xs uppercase tracking-[0.12em] text-ink-muted">Payment</h3>
        <div className="mt-3">
          <CartTotals
            subtotal={order.subtotal}
            shipping={order.shipping_method === "express" ? "express" : "standard"}
            compact
          />
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          {paymentLabel(order.payment_method)} · {order.status === "pending" ? "Awaiting payment" : order.status}
        </p>
      </div>
    </div>
  );
}
