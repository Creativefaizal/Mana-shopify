"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Banknote,
  Landmark,
  Loader2,
  Lock,
  MapPin,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { CartTotals } from "@/components/cart-totals";
import { BankDetails } from "@/components/bank-details";
import { formatMoney, quote } from "@/lib/format";
import type { CheckoutPayload, Order, OrderItem, Profile } from "@/lib/types";

export const RECEIPT_KEY = "mana:last-order";

interface Receipt {
  order: Order & { order_items: OrderItem[] };
  emails: { customer: boolean; store: boolean; skipped: boolean };
  persisted: boolean;
}

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Netherlands",
  "Spain",
  "Italy",
  "Canada",
  "Australia",
  "Nigeria",
  "South Africa",
  "India",
  "Singapore",
  "Japan",
];

const inputClass =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-ink";

export function CheckoutForm({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const { lines, subtotal, clearCart, hydrated } = useCart();

  const [shipping, setShipping] = useState<"standard" | "express">("standard");
  const [payment, setPayment] = useState<CheckoutPayload["payment_method"]>("bank_transfer");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState(() => ({
    email: profile?.email ?? "",
    full_name: profile?.full_name ?? "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "United States",
    notes: "",
  }));

  const update = (key: keyof typeof fields, value: string) =>
    setFields((current) => ({ ...current, [key]: value }));

  const totals = useMemo(() => quote(subtotal, shipping), [subtotal, shipping]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setError(null);

    if (lines.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);

    const payload: CheckoutPayload = {
      customer: {
        email: fields.email.trim(),
        full_name: fields.full_name.trim(),
        phone: fields.phone.trim(),
        address_line1: fields.address_line1.trim(),
        address_line2: fields.address_line2.trim(),
        city: fields.city.trim(),
        state: fields.state.trim(),
        postal_code: fields.postal_code.trim(),
        country: fields.country,
        notes: fields.notes.trim(),
      },
      lines: lines.map((line) => ({ slug: line.slug, quantity: line.quantity })),
      payment_method: payment,
      shipping_method: shipping,
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as Receipt & { ok: boolean; message?: string };

      if (!response.ok || !result.ok || !result.order) {
        setError(result.message ?? "We could not complete that order. Please try again.");
        setSubmitting(false);
        return;
      }

      try {
        window.sessionStorage.setItem(
          RECEIPT_KEY,
          JSON.stringify({
            order: result.order,
            emails: result.emails,
            persisted: result.persisted,
          } satisfies Receipt),
        );
      } catch {
        /* private mode: the success page will fall back to the query string */
      }

      clearCart();
      router.push(`/checkout/success?order=${encodeURIComponent(result.order.order_number)}`);
    } catch {
      setError("Network error while placing the order. Please try again.");
      setSubmitting(false);
    }
  };

  if (hydrated && lines.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line bg-white/70 px-6 py-16 text-center">
        <h2 className="text-lg font-semibold">Your cart is empty</h2>
        <p className="mx-auto mt-2 max-w-[42ch] text-sm text-ink-muted">
          Add a product and the checkout will open with your cart loaded.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex rounded-pill bg-ink px-6 py-3 text-sm font-medium text-white transition hover:bg-ink-soft"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="space-y-6">
        <section className="rounded-card border border-line bg-white p-5 sm:p-6">
          <header className="mb-5 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-xs font-semibold text-white">
              1
            </span>
            <h2 className="text-base font-semibold tracking-[-0.01em]">Contact</h2>
          </header>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Email"
              type="email"
              required
              autoComplete="email"
              value={fields.email}
              onChange={(value) => update("email", value)}
              hint="Your confirmation goes here."
              className="sm:col-span-2"
            />
            <Field
              label="Full name"
              required
              autoComplete="name"
              value={fields.full_name}
              onChange={(value) => update("full_name", value)}
            />
            <Field
              label="Phone"
              type="tel"
              autoComplete="tel"
              value={fields.phone}
              onChange={(value) => update("phone", value)}
              hint="Optional, used by the courier."
            />
          </div>
        </section>

        <section className="rounded-card border border-line bg-white p-5 sm:p-6">
          <header className="mb-5 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-xs font-semibold text-white">
              2
            </span>
            <h2 className="flex items-center gap-2 text-base font-semibold tracking-[-0.01em]">
              Shipping address
              <MapPin className="h-4 w-4 text-ink-muted" strokeWidth={1.7} />
            </h2>
          </header>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Street address"
              required
              autoComplete="address-line1"
              value={fields.address_line1}
              onChange={(value) => update("address_line1", value)}
              className="sm:col-span-2"
            />
            <Field
              label="Apartment, suite (optional)"
              autoComplete="address-line2"
              value={fields.address_line2}
              onChange={(value) => update("address_line2", value)}
              className="sm:col-span-2"
            />
            <Field
              label="City"
              required
              autoComplete="address-level2"
              value={fields.city}
              onChange={(value) => update("city", value)}
            />
            <Field
              label="State / region (optional)"
              autoComplete="address-level1"
              value={fields.state}
              onChange={(value) => update("state", value)}
            />
            <Field
              label="Postal code"
              required
              autoComplete="postal-code"
              value={fields.postal_code}
              onChange={(value) => update("postal_code", value)}
            />
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Country</span>
              <select
                value={fields.country}
                onChange={(event) => update("country", event.target.value)}
                className={inputClass}
              >
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-card border border-line bg-white p-5 sm:p-6">
          <header className="mb-5 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-xs font-semibold text-white">
              3
            </span>
            <h2 className="flex items-center gap-2 text-base font-semibold tracking-[-0.01em]">
              Delivery
              <Truck className="h-4 w-4 text-ink-muted" strokeWidth={1.7} />
            </h2>
          </header>
          <div className="grid gap-3 sm:grid-cols-2">
            <Choice
              active={shipping === "standard"}
              onClick={() => setShipping("standard")}
              title="Standard"
              subtitle="3 to 5 working days"
              trailing={totals.shipping_fee === 0 && shipping === "standard" ? "Free" : formatMoney(quote(subtotal, "standard").shipping_fee)}
            />
            <Choice
              active={shipping === "express"}
              onClick={() => setShipping("express")}
              title="Express"
              subtitle="Next working day"
              trailing={formatMoney(quote(subtotal, "express").shipping_fee)}
            />
          </div>
        </section>

        <section className="rounded-card border border-line bg-white p-5 sm:p-6">
          <header className="mb-5 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-xs font-semibold text-white">
              4
            </span>
            <h2 className="flex items-center gap-2 text-base font-semibold tracking-[-0.01em]">
              Payment
              <Lock className="h-4 w-4 text-ink-muted" strokeWidth={1.7} />
            </h2>
          </header>

          <div className="grid gap-3 sm:grid-cols-2">
            <Choice
              active={payment === "bank_transfer"}
              onClick={() => setPayment("bank_transfer")}
              icon={Landmark}
              title="Bank transfer"
              subtitle="Pay into our account"
            />
            <Choice
              active={payment === "pay_on_delivery"}
              onClick={() => setPayment("pay_on_delivery")}
              icon={Banknote}
              title="Pay on delivery"
              subtitle="Pay the courier on arrival"
            />
          </div>

          {payment === "bank_transfer" ? (
            <div className="mt-5 rounded-2xl bg-surface p-4">
              <BankDetails reference="Your order number (shown after you place the order)" />
              <p className="mt-3 text-xs leading-5 text-ink-muted">
                We ship as soon as the transfer lands. The account details are also in your
                confirmation email.
              </p>
            </div>
          ) : (
            <p className="mt-5 flex items-start gap-2 rounded-2xl bg-surface p-4 text-xs leading-5 text-ink-muted">
              <Wallet className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.7} />
              Pay the courier in cash or by card when your parcel arrives. Please have{" "}
              {formatMoney(totals.total)} ready.
            </p>
          )}

          <label className="mt-5 block">
            <span className="mb-1.5 block text-xs font-medium text-ink-muted">
              Order notes (optional)
            </span>
            <textarea
              rows={3}
              value={fields.notes}
              onChange={(event) => update("notes", event.target.value)}
              placeholder="Gate code, preferred delivery window..."
              className={`${inputClass} resize-none`}
            />
          </label>
        </section>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-2xl border border-sale/30 bg-sale/5 px-4 py-3 text-sm text-sale"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} />
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-pill bg-ink px-8 py-4 text-sm font-medium text-white transition hover:bg-ink-soft disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                Placing order...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" strokeWidth={1.8} />
                Place order - {formatMoney(totals.total)}
              </>
            )}
          </button>
          <p className="flex items-center gap-2 text-xs text-ink-muted">
            <ShieldCheck className="h-4 w-4" strokeWidth={1.7} />
            No payment is taken online. You pay by transfer or on delivery.
          </p>
        </div>

      </div>
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-card border border-line bg-white p-5 sm:p-6">
          <h2 className="text-base font-semibold tracking-[-0.01em]">Order summary</h2>

          <ul className="mt-4 space-y-4">
            {lines.map((line) => (
              <li key={line.slug} className="flex items-center gap-3">
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-tile">
                  <img src={line.image_url} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <Link href={`/product/${line.slug}`} className="block truncate text-sm font-medium">
                    {line.name}
                  </Link>
                  <span className="text-xs text-ink-muted">
                    {line.quantity} x {formatMoney(line.price)}
                  </span>
                </span>
                <span className="text-sm font-semibold">
                  {formatMoney(line.price * line.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-line pt-5">
            <CartTotals subtotal={subtotal} shipping={shipping} />
          </div>

          <div className="mt-5 space-y-2 rounded-2xl bg-surface p-4 text-xs leading-5 text-ink-muted">
            <p className="flex items-center gap-2 text-ink">
              <Truck className="h-4 w-4" strokeWidth={1.7} />
              {shipping === "express" ? "Express, next working day" : "Standard, 3 to 5 days"}
            </p>
            {fields.email && (
              <p className="truncate">Confirmation to {fields.email}</p>
            )}
            <p>You can review everything again on the confirmation screen.</p>
          </div>
        </div>
      </aside>
    </form>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  className?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  hint,
  className = "",
  autoComplete,
  inputMode,
}: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">
        {label}
        {required ? <span className="text-sale"> *</span> : null}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
      {hint && <span className="mt-1 block text-[11px] text-ink-muted">{hint}</span>}
    </label>
  );
}

interface ChoiceProps {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  trailing?: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

function Choice({ active, onClick, title, subtitle, trailing, icon: Icon }: ChoiceProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
        active ? "border-ink bg-surface" : "border-line bg-white hover:border-ink/40"
      }`}
    >
      {Icon && <Icon className="mt-0.5 h-4 w-4 text-ink-muted" strokeWidth={1.7} />}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        {subtitle && <span className="block text-xs text-ink-muted">{subtitle}</span>}
      </span>
      {trailing && <span className="text-sm font-semibold">{trailing}</span>}
    </button>
  );
}

