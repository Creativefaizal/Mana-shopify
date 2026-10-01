import type { Metadata } from "next";
import { ShopView } from "@/components/shop-view";
import { parseShopParams } from "@/lib/shop-params";

export const metadata: Metadata = {
  title: "Shop every Mana product",
  description:
    "Browse the full Mana catalogue: phones, audio, storage and smart home, with live filters, search and sorting.",
};

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = parseShopParams(await searchParams);

  return (
    <div className="pb-4">
      <div className="mx-auto mb-8 w-full max-w-[1240px] px-4 sm:px-6">
        <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">Everything we stock</p>
        <h1 className="mt-2 text-[34px] font-semibold tracking-[-0.035em] sm:text-[46px]">
          Shop
        </h1>
      </div>
      <ShopView params={params} basePath="/shop" />
    </div>
  );
}
