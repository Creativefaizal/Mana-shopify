"use client";

import { formatMoney, PRICING, quote } from "@/lib/format";

interface CartTotalsProps {
  subtotal: number;
  shipping: "standard" | "express";
  /** Rendered as a muted hint under the shipping row. */
  compact?: boolean;
}

/** Shared totals block: cart drawer, checkout summary and receipt all use it. */
export function CartTotals({ subtotal, shipping, compact = false }: CartTotalsProps) {
  const totals = quote(subtotal, shipping);
  const remaining = Math.max(0, PRICING.freeShippingThreshold - subtotal);

  const row = (label: string, value: string, muted = true) => (
    <div className="flex items-center justify-between text-sm">
      <span className={muted ? "text-ink-muted" : "font-medium text-ink"}>{label}</span>
      <span className={muted ? "text-ink" : "font-semibold text-ink"}>{value}</span>
    </div>
  );

  return (
    <div className="space-y-2.5">
      {row("Subtotal", formatMoney(totals.subtotal))}
      {totals.discount_total > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-muted">Mana Club discount (5%)</span>
          <span className="font-medium text-sale">-{formatMoney(totals.discount_total)}</span>
        </div>
      )}
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-muted">
          Shipping ({shipping === "express" ? "express" : "standard"})
        </span>
        <span className="text-ink">
          {totals.shipping_fee === 0 ? "Free" : formatMoney(totals.shipping_fee)}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-muted">Tax ({(PRICING.taxRate * 100).toFixed(0)}%)</span>
        <span className="text-ink">{formatMoney(totals.tax_total)}</span>
      </div>
      <div className="border-t border-line pt-3">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-ink">Total</span>
          <span className="text-base font-bold text-ink">{formatMoney(totals.total)}</span>
        </div>
      </div>
      {!compact && remaining > 0 && (
        <p className="text-xs text-ink-muted">
          Add {formatMoney(remaining)} more for free standard shipping.
        </p>
      )}
    </div>
  );
}
