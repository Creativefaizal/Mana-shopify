import { env } from "./env";
import { formatMoney } from "./format";
import { bankDetails, isBankConfigured, paymentLabel } from "./payment";
import type { Order, OrderItem } from "./types";

/**
 * Transactional email templates. Pure string builders so they can be used from
 * route handlers or a background job without extra tooling. Tables + inline CSS
 * keep them readable in Gmail, Apple Mail and Outlook.
 */

const INK = "#111111";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";
const SURFACE = "#f4f4f5";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:32px 16px;background:${SURFACE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${INK};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;">
      <tr>
        <td style="padding:28px 32px 20px;border-bottom:1px solid ${BORDER};">
          <span style="font-size:22px;font-weight:800;letter-spacing:-0.5px;">Mana</span>
          <span style="float:right;font-size:12px;color:${MUTED};padding-top:8px;">${title}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px;">${body}</td>
      </tr>
      <tr>
        <td style="padding:20px 32px 28px;border-top:1px solid ${BORDER};color:${MUTED};font-size:12px;line-height:18px;">
          <p style="margin:0 0 6px;">Mana &middot; Devices, audio and home essentials.</p>
          <p style="margin:0;">Delivered with Mailgun on behalf of ${env.storeName}.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function itemsTable(items: OrderItem[]): string {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid ${BORDER};">
            <div style="font-weight:600;font-size:14px;">${escapeHtml(item.product_name)}</div>
            <div style="color:${MUTED};font-size:12px;">Qty ${item.quantity} &middot; ${formatMoney(item.unit_price)}</div>
          </td>
          <td align="right" style="padding:12px 0;border-bottom:1px solid ${BORDER};font-weight:600;font-size:14px;">
            ${formatMoney(item.line_total)}
          </td>
        </tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`;
}

function totalsBlock(order: Order): string {
  const line = (label: string, value: string, strong = false) => `
    <tr>
      <td style="padding:6px 0;color:${strong ? INK : MUTED};font-size:${strong ? "16px" : "13px"};font-weight:${strong ? "700" : "400"};">${label}</td>
      <td align="right" style="padding:6px 0;color:${INK};font-size:${strong ? "16px" : "13px"};font-weight:${strong ? "700" : "500"};">${value}</td>
    </tr>`;

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
    ${line("Subtotal", formatMoney(order.subtotal))}
    ${order.discount_total > 0 ? line("Mana Club discount", `-${formatMoney(order.discount_total)}`) : ""}
    ${line("Shipping", order.shipping_fee === 0 ? "Free" : formatMoney(order.shipping_fee))}
    ${line("Tax", formatMoney(order.tax_total))}
    ${line("Total", formatMoney(order.total), true)}
  </table>`;
}

function addressBlock(order: Order): string {
  const lines = [
    order.full_name,
    order.address_line1,
    order.address_line2,
    [order.city, order.state, order.postal_code].filter(Boolean).join(", "),
    order.country,
  ].filter(Boolean) as string[];

  return `<p style="margin:0;color:${MUTED};font-size:13px;line-height:20px;">
    ${lines.map(escapeHtml).join("<br />")}
  </p>`;
}

function bankTransferBlock(order: Order): string {
  const rows: Array<[string, string]> = isBankConfigured()
    ? [
        ["Bank", bankDetails.bankName],
        ["Account name", bankDetails.accountName],
        ["Account number", bankDetails.accountNumber],
        ["Amount", formatMoney(order.total)],
        ["Reference", order.order_number],
      ]
    : [
        ["Amount", formatMoney(order.total)],
        ["Reference", order.order_number],
      ];

  return `
    <div style="margin:0 0 24px;padding:18px;border:1px solid ${BORDER};border-radius:14px;">
      <p style="margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${MUTED};">Bank transfer details</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:24px;">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="padding-right:16px;color:${MUTED};">${label}</td><td style="font-weight:600;">${escapeHtml(value)}</td></tr>`,
          )
          .join("")}
      </table>
      ${
        isBankConfigured()
          ? ""
          : `<p style="margin:10px 0 0;font-size:13px;color:${MUTED};">Reply to this email and we will send you our account details.</p>`
      }
    </div>`;
}

export function orderConfirmationEmail(order: Order & { order_items: OrderItem[] }): {
  subject: string;
  html: string;
} {
  const firstName = order.full_name.split(" ")[0] || "there";

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;letter-spacing:-0.4px;">Thanks for your order</h1>
    <p style="margin:0 0 24px;color:${MUTED};font-size:14px;line-height:22px;">
      Hi ${escapeHtml(firstName)}, we have your order
      <strong style="color:${INK};">${order.order_number}</strong>.
      ${
        order.payment_method === "bank_transfer"
          ? "We will pack it as soon as your bank transfer arrives."
          : `A human is packing it right now. Please have ${formatMoney(order.total)} ready for the courier.`
      }
    </p>
    ${order.payment_method === "bank_transfer" ? bankTransferBlock(order) : ""}
    ${itemsTable(order.order_items)}
    ${totalsBlock(order)}
    <div style="margin-top:28px;padding:18px;background:${SURFACE};border-radius:14px;">
      <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${MUTED};">Shipping to</p>
      ${addressBlock(order)}
      <p style="margin:14px 0 0;font-size:13px;color:${MUTED};">
        ${order.shipping_method === "express" ? "Express delivery" : "Standard delivery"} &middot;
        ${escapeHtml(paymentLabel(order.payment_method))}
      </p>
    </div>
    <p style="margin:24px 0 0;font-size:14px;line-height:22px;color:${MUTED};">
      Track this order any time from your Mana account. Need to change something? Reply to this email and
      it lands straight in our support inbox.
    </p>
  `;

  return {
    subject: `Mana order ${order.order_number} confirmed`,
    html: layout("Order confirmation", body),
  };
}

export function orderNotificationEmail(order: Order & { order_items: OrderItem[] }): {
  subject: string;
  html: string;
} {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;">New order ${order.order_number}</h1>
    <p style="margin:0 0 20px;color:${MUTED};font-size:14px;">
      ${escapeHtml(order.full_name)} &middot; ${escapeHtml(order.email)} &middot; ${escapeHtml(order.phone ?? "no phone")}
    </p>
    ${itemsTable(order.order_items)}
    ${totalsBlock(order)}
    ${addressBlock(order)}
    ${
      order.notes
        ? `<p style="margin:18px 0 0;padding:14px;background:${SURFACE};border-radius:12px;font-size:13px;">Note: ${escapeHtml(order.notes)}</p>`
        : ""
    }
  `;

  return {
    subject: `[Mana] New order ${order.order_number} - ${formatMoney(order.total)}`,
    html: layout("Store notification", body),
  };
}

export function newsletterWelcomeEmail(email: string): { subject: string; html: string } {
  const body = `
    <h1 style="margin:0 0 10px;font-size:24px;letter-spacing:-0.4px;">You are on the list</h1>
    <p style="margin:0 0 18px;color:${MUTED};font-size:14px;line-height:22px;">
      Thanks for subscribing with <strong style="color:${INK};">${escapeHtml(email)}</strong>.
      Expect a short note when new gear lands, plus early access to Mana Club discounts.
    </p>
    <a href="${env.siteUrl}/shop" style="display:inline-block;padding:12px 22px;background:${INK};color:#ffffff;border-radius:999px;font-size:14px;text-decoration:none;">Browse the shop</a>
  `;

  return {
    subject: "Welcome to Mana",
    html: layout("Subscription confirmed", body),
  };
}
