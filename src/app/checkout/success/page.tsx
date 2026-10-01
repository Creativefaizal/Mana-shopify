import type { Metadata } from "next";
import { OrderReceipt } from "@/components/order-receipt";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

interface SuccessPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const query = await searchParams;
  const order = Array.isArray(query.order) ? query.order[0] : query.order;

  return <OrderReceipt orderNumber={order ?? "MANA-XXXXXX"} />;
}
