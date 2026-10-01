import { PackageSearch } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
  /** Shown when a filter/search yields nothing. */
  emptyHint?: string;
}

export function ProductGrid({ products, emptyHint }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-line bg-white/70 px-6 py-16 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface">
          <PackageSearch className="h-6 w-6 text-ink-muted" strokeWidth={1.6} />
        </span>
        <p className="text-base font-medium">Nothing matched that search</p>
        <p className="max-w-[42ch] text-sm text-ink-muted">
          {emptyHint ?? "Try a shorter keyword, or clear the filters to see the whole catalogue."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
