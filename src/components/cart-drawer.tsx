"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { CartTotals } from "@/components/cart-totals";
import { formatMoney } from "@/lib/format";

export function CartDrawer() {
  const { lines, count, subtotal, isOpen, closeCart, setQuantity, removeLine } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Your cart"
    >
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
      />

      <section className="relative flex h-full w-full max-w-[440px] animate-rise flex-col bg-white shadow-float">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={1.8} />
            <h2 className="text-base font-semibold">
              Your cart <span className="text-ink-muted">({count})</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface hover:text-ink"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface">
              <ShoppingCart className="h-7 w-7 text-ink-muted" strokeWidth={1.6} />
            </span>
            <p className="text-sm text-ink-muted">
              Your cart is empty. Add something you will actually use.
            </p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="rounded-pill bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-ink-soft"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {lines.map((line) => (
                <li key={line.slug} className="flex gap-4 py-4">
                  <Link
                    href={`/product/${line.slug}`}
                    onClick={closeCart}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-tile"
                  >
                    <img
                      src={line.image_url}
                      alt={line.name}
                      className="h-full w-full object-contain p-3"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${line.slug}`}
                        onClick={closeCart}
                        className="truncate text-sm font-medium hover:underline"
                      >
                        {line.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeLine(line.slug)}
                        aria-label={`Remove ${line.name}`}
                        className="text-ink-muted transition hover:text-sale"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.7} />
                      </button>
                    </div>

                    <p className="mt-0.5 text-xs text-ink-muted">{formatMoney(line.price)} each</p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-pill border border-line">
                        <button
                          type="button"
                          onClick={() => setQuantity(line.slug, line.quantity - 1)}
                          aria-label={`Decrease quantity of ${line.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center text-ink-muted transition hover:text-ink"
                        >
                          <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(line.slug, line.quantity + 1)}
                          aria-label={`Increase quantity of ${line.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center text-ink-muted transition hover:text-ink"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatMoney(line.price * line.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-line px-5 py-4">
              <CartTotals subtotal={subtotal} shipping="standard" />
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="inline-flex items-center justify-center rounded-pill bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-ink-soft"
                >
                  Checkout
                </Link>
                <button
                  type="button"
                  onClick={closeCart}
                  className="inline-flex items-center justify-center rounded-pill border border-line px-5 py-3 text-sm font-medium transition hover:border-ink"
                >
                  Continue shopping
                </button>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
