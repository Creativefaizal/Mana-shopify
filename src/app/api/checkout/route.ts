import { NextResponse } from "next/server";
import { placeOrder } from "@/lib/orders";
import { getCurrentUser } from "@/lib/supabase/server";
import { isPaymentMethod } from "@/lib/payment";
import type { CheckoutPayload } from "@/lib/types";

const SHIPPING_METHODS = new Set(["standard", "express"]);

function parsePayload(body: unknown): CheckoutPayload | null {
  if (!body || typeof body !== "object") return null;
  const candidate = body as Partial<CheckoutPayload>;
  if (!candidate.customer || !Array.isArray(candidate.lines)) return null;

  return {
    customer: candidate.customer,
    lines: candidate.lines
      .filter((line): line is { slug: string; quantity: number } => Boolean(line?.slug))
      .map((line) => ({ slug: String(line.slug), quantity: Number(line.quantity) })),
    payment_method: isPaymentMethod(candidate.payment_method)
      ? candidate.payment_method
      : "bank_transfer",
    shipping_method: SHIPPING_METHODS.has(String(candidate.shipping_method))
      ? (candidate.shipping_method as CheckoutPayload["shipping_method"])
      : "standard",
  };
}

export async function POST(request: Request) {
  let payload: CheckoutPayload | null = null;

  try {
    payload = parsePayload(await request.json());
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  if (!payload) {
    return NextResponse.json(
      { ok: false, message: "We could not read that cart. Please refresh and try again." },
      { status: 400 },
    );
  }

  // Orders placed by a signed-in customer are linked to their account so they
  // show up under /account/orders (row level security keeps them private).
  const user = await getCurrentUser();
  const result = await placeOrder(payload, user?.id ?? null);

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    order: result.order,
    persisted: result.persisted,
    emails: result.emails,
  });
}
