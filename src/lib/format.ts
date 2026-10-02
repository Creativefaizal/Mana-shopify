import type { Pricing } from "./types";

/** Money helpers shared by the storefront, the cart and the checkout API. Prices are in naira (NGN). */

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatReviews(count: number): string {
  if (count >= 1000) {
    const value = count / 1000;
    return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}k`;
  }
  return String(count);
}

export function formatDate(value: string | Date | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

export function discountPercent(price: number, compareAt: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/* ------------------------------------------------------------------ pricing */

export const PRICING = {
  freeShippingThreshold: 200_000,
  standardShipping: 5_000,
  expressShipping: 12_000,
  taxRate: 0.08,
  loyaltyThreshold: 700_000,
  loyaltyRate: 0.05,
} as const;

export function shippingFeeFor(subtotal: number, method: "standard" | "express"): number {
  if (method === "express") return PRICING.expressShipping;
  return subtotal >= PRICING.freeShippingThreshold ? 0 : PRICING.standardShipping;
}

/** Single source of truth for order maths (used by the UI *and* the API). */
export function quote(
  subtotal: number,
  method: "standard" | "express" = "standard",
): Pricing {
  const safeSubtotal = Math.max(0, Number(subtotal) || 0);
  const shippingFee = shippingFeeFor(safeSubtotal, method);
  const discountTotal =
    safeSubtotal >= PRICING.loyaltyThreshold
      ? Math.round(safeSubtotal * PRICING.loyaltyRate * 100) / 100
      : 0;
  const taxable = Math.max(0, safeSubtotal - discountTotal);
  const taxTotal = Math.round(taxable * PRICING.taxRate * 100) / 100;
  const total = Math.round((taxable + shippingFee + taxTotal) * 100) / 100;

  return {
    subtotal: Math.round(safeSubtotal * 100) / 100,
    shipping_fee: shippingFee,
    tax_total: taxTotal,
    discount_total: discountTotal,
    total,
  };
}

export function orderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MANA-${stamp}${random}`;
}
