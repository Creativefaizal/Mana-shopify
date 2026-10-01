"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/types";

export function BuyBox({ product }: { product: Product }) {
  const { addLine, openCart } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  const line = {
    slug: product.slug,
    name: product.name,
    price: product.price,
    image_url: product.image_url,
    stock: product.stock,
  };

  const add = () => {
    if (soldOut) return;
    addLine(line, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-ink-muted">Quantity</span>
        <div className="inline-flex items-center rounded-pill border border-line bg-white">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            aria-label="Decrease quantity"
            className="inline-flex h-10 w-10 items-center justify-center text-ink-muted transition hover:text-ink"
          >
            <Minus className="h-4 w-4" strokeWidth={2} />
          </button>
          <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(20, value + 1))}
            aria-label="Increase quantity"
            className="inline-flex h-10 w-10 items-center justify-center text-ink-muted transition hover:text-ink"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        <span className="text-sm text-ink-muted">
          {soldOut ? "Sold out" : `${product.stock} in stock`}
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={add}
          disabled={soldOut}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-pill border border-ink bg-white px-6 py-3.5 text-sm font-medium text-ink transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
        >
          {added ? (
            <>
              <Check className="h-4 w-4" strokeWidth={2} />
              Added to chart
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" strokeWidth={1.8} />
              Add to Chart
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            if (soldOut) return;
            addLine(line, quantity);
            router.push("/checkout");
          }}
          disabled={soldOut}
          className="inline-flex flex-1 items-center justify-center rounded-pill bg-ink px-6 py-3.5 text-sm font-medium text-white transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy Now - {formatMoney(product.price * quantity)}
        </button>
      </div>

      <button
        type="button"
        onClick={openCart}
        className="text-xs text-ink-muted underline decoration-dotted transition hover:text-ink"
      >
        View cart
      </button>
    </div>
  );
}
