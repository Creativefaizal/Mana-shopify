import "server-only";

import { orderConfirmationEmail, orderNotificationEmail } from "./emails";
import { env } from "./env";
import { orderNumber, quote } from "./format";
import { sendAndLog } from "./mailgun";
import { getProductsBySlugs } from "./products";
import { getAdminSupabase } from "./supabase/admin";
import type { CheckoutPayload, Order, OrderItem, OrderStatus } from "./types";

export interface CheckoutResult {
  ok: boolean;
  message?: string;
  order?: Order & { order_items: OrderItem[] };
  /** false while no Supabase service-role key is configured (demo mode). */
  persisted: boolean;
  emails: { customer: boolean; store: boolean; skipped: boolean };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_QTY = 20;

function validate(payload: CheckoutPayload): string | null {
  const { customer, lines } = payload;
  if (!customer) return "Missing customer details.";
  if (!EMAIL_RE.test(customer.email ?? "")) return "Please enter a valid email address.";
  if (!customer.full_name || customer.full_name.trim().length < 2) return "Please enter your full name.";
  if (!customer.address_line1 || customer.address_line1.trim().length < 4) return "Please enter a street address.";
  if (!customer.city) return "Please enter a city.";
  if (!customer.postal_code) return "Please enter a postal code.";
  if (!customer.country) return "Please enter a country.";
  if (customer.phone && customer.phone.replace(/\D/g, "").length < 6) return "Please enter a valid phone number.";
  if (!Array.isArray(lines) || lines.length === 0) return "Your cart is empty.";
  for (const line of lines) {
    if (!line?.slug) return "A cart line is missing its product.";
    if (!Number.isFinite(line.quantity) || line.quantity < 1 || line.quantity > MAX_QTY) {
      return `Quantities must be between 1 and ${MAX_QTY}.`;
    }
  }
  return null;
}

const SKIPPED = { customer: false, store: false, skipped: true };

/**
 * The single place where an order becomes real: re-prices the cart from the
 * database (never trusting client prices), writes `orders` + `order_items`,
 * then fires the Mailgun confirmations.
 */
export async function placeOrder(
  payload: CheckoutPayload,
  userId: string | null,
): Promise<CheckoutResult> {
  const invalid = validate(payload);
  if (invalid) {
    return { ok: false, message: invalid, persisted: false, emails: SKIPPED };
  }

  const products = await getProductsBySlugs(payload.lines.map((line) => line.slug));
  if (products.length === 0) {
    return {
      ok: false,
      message: "We could not find those products any more. Please refresh your cart.",
      persisted: false,
      emails: SKIPPED,
    };
  }

  const items: OrderItem[] = [];
  for (const line of payload.lines) {
    const product = products.find((entry) => entry.slug === line.slug);
    if (!product) continue;
    const quantity = Math.min(Math.max(1, Math.floor(line.quantity)), MAX_QTY);
    items.push({
      product_slug: product.slug,
      product_name: product.name,
      image_url: product.image_url,
      unit_price: product.price,
      quantity,
      line_total: Math.round(product.price * quantity * 100) / 100,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
  const pricing = quote(subtotal, payload.shipping_method === "express" ? "express" : "standard");
  // Nothing is collected online: bank transfers are marked paid by hand once the
  // money lands, and pay-on-delivery is settled with the courier.
  const status: OrderStatus = "pending";

  const draft: Order & { order_items: OrderItem[] } = {
    order_number: orderNumber(),
    user_id: userId,
    email: payload.customer.email.trim().toLowerCase(),
    full_name: payload.customer.full_name.trim(),
    phone: payload.customer.phone?.trim() || null,
    address_line1: payload.customer.address_line1.trim(),
    address_line2: payload.customer.address_line2?.trim() || null,
    city: payload.customer.city.trim(),
    state: payload.customer.state?.trim() || null,
    postal_code: payload.customer.postal_code.trim(),
    country: payload.customer.country.trim(),
    subtotal: pricing.subtotal,
    shipping_fee: pricing.shipping_fee,
    tax_total: pricing.tax_total,
    discount_total: pricing.discount_total,
    total: pricing.total,
    status,
    payment_method: payload.payment_method,
    shipping_method: payload.shipping_method,
    notes: payload.customer.notes?.trim() || null,
    created_at: new Date().toISOString(),
    order_items: items,
  };

  const persisted = await persist(draft);
  if (!persisted.ok) {
    return { ok: false, message: persisted.message, persisted: false, emails: SKIPPED };
  }

  const confirmation = orderConfirmationEmail(draft);
  const customerMail = await sendAndLog({
    to: draft.email,
    subject: confirmation.subject,
    html: confirmation.html,
    template: "order-confirmation",
    orderNumber: draft.order_number,
    tags: ["order", "confirmation"],
    replyTo: env.storeNotificationEmail || undefined,
  });

  let storeSent = false;
  if (env.storeNotificationEmail) {
    const notification = orderNotificationEmail(draft);
    const storeMail = await sendAndLog({
      to: env.storeNotificationEmail,
      subject: notification.subject,
      html: notification.html,
      template: "order-notification",
      orderNumber: draft.order_number,
      tags: ["order", "internal"],
      replyTo: draft.email,
    });
    storeSent = storeMail.ok;
  }

  return {
    ok: true,
    order: draft,
    persisted: persisted.written,
    emails: {
      customer: customerMail.ok,
      store: storeSent,
      skipped: Boolean(customerMail.skipped),
    },
  };
}

/** Writes the order + its items. Returns the assigned database id when it lands. */
async function persist(
  draft: Order & { order_items: OrderItem[] },
): Promise<{ ok: boolean; written: boolean; message?: string }> {
  const admin = getAdminSupabase();

  if (!admin) {
    console.warn(
      "[mana] SUPABASE_SERVICE_ROLE_KEY is not set - the order was generated in demo mode and NOT persisted.",
    );
    return { ok: true, written: false };
  }

  const { data, error } = await admin
    .from("orders")
    .insert({
      order_number: draft.order_number,
      user_id: draft.user_id,
      email: draft.email,
      full_name: draft.full_name,
      phone: draft.phone,
      address_line1: draft.address_line1,
      address_line2: draft.address_line2,
      city: draft.city,
      state: draft.state,
      postal_code: draft.postal_code,
      country: draft.country,
      subtotal: draft.subtotal,
      shipping_fee: draft.shipping_fee,
      tax_total: draft.tax_total,
      discount_total: draft.discount_total,
      total: draft.total,
      status: draft.status,
      payment_method: draft.payment_method,
      shipping_method: draft.shipping_method,
      notes: draft.notes,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[mana] order insert failed:", error.message);
    return {
      ok: false,
      written: false,
      message:
        error.code === "42P01"
          ? "The database tables are missing. Run `supabase/schema.sql` in the Supabase SQL editor first."
          : `We could not save your order (${error.message}). Please try again.`,
    };
  }

  draft.id = data.id as string;

  const { error: itemsError } = await admin.from("order_items").insert(
    draft.order_items.map((item) => ({
      order_id: draft.id,
      product_slug: item.product_slug,
      product_name: item.product_name,
      image_url: item.image_url,
      unit_price: item.unit_price,
      quantity: item.quantity,
      line_total: item.line_total,
    })),
  );

  if (itemsError) {
    console.error("[mana] order_items insert failed:", itemsError.message);
    await admin.from("orders").delete().eq("id", draft.id);
    return { ok: false, written: false, message: "We could not save the items in your order. Please try again." };
  }

  return { ok: true, written: true };
}
