"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { StarRating } from "@/components/star-rating";
import { useCart } from "@/components/cart-provider";
import { discountPercent, formatMoney } from "@/lib/format";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  /** Slightly tighter card used by the recommendations rail. */
  compact?: boolean;
}

/**
 * Card artwork is a local SVG, so a plain <img> is both faster and safer than
 * the image optimiser (which refuses SVG by default).
 */
export function ProductCard({ product, compact = false }: ProductCardProps) {
  const { addLine, touched } = useCart();
  const router = useRouter();
  const off = discountPercent(product.price, product.compare_at_price);
  const isTouched = touched === product.slug;

  const add = () => {
    addLine({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      stock: product.stock,
    });
  };

  const buyNow = () => {
    add();
    router.push("/checkout");
  };

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden rounded-card bg-tile"
        aria-label={product.name}
      >
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain p-8 transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute right-3 top-3 rounded-pill bg-white/95 px-3 py-1 text-[11px] font-medium text-ink shadow-sm">
          {product.category_name}
        </span>
        {off !== null && (
          <span className="absolute left-3 top-3 rounded-pill bg-sale px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
            -{off}%
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute bottom-3 left-3 rounded-pill bg-ink px-3 py-1 text-[11px] font-medium text-white">
            Sold out
          </span>
        )}
      </Link>

      <div className="mt-4 flex flex-1 items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/product/${product.slug}`}
            className={`block truncate font-semibold tracking-[-0.01em] text-ink hover:underline ${
              compact ? "text-[15px]" : "text-[17px]"
            }`}
          >
            {product.name}
          </Link>
          <div className="mt-1.5">
            <StarRating rating={product.rating} reviews={product.reviews_count} size={compact ? 12 : 14} />
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className={`font-bold tracking-[-0.02em] ${compact ? "text-[15px]" : "text-[17px]"}`}>
            {formatMoney(product.price)}
          </div>
          {product.compare_at_price !== null && product.compare_at_price > product.price && (
            <div className="text-xs text-ink-muted line-through">
              {formatMoney(product.compare_at_price)}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={add}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-pill border border-line bg-white px-4 py-2.5 text-[13px] font-medium text-ink transition hover:border-ink ${
            isTouched ? "border-ink" : ""
          }`}
        >
          <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.8} />
          {isTouched ? "Added" : "Add to Chart"}
        </button>
        <button
          type="button"
          onClick={buyNow}
          className="inline-flex flex-1 items-center justify-center rounded-pill bg-ink px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-ink-soft"
        >
          Buy Now
        </button>
      </div>
    </article>
  );
}
