"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";

export function RecommendationsRail({ products }: { products: Product[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const node = rail.current;
    if (!node) return;
    setEdges({
      start: node.scrollLeft <= 8,
      end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 8,
    });
  }, []);

  useEffect(() => {
    measure();
    const node = rail.current;
    if (!node) return;
    node.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      node.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const scrollBy = (direction: 1 | -1) => {
    rail.current?.scrollBy({ left: direction * 340, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <section aria-labelledby="recommendations-heading" className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2
          id="recommendations-heading"
          className="text-[26px] font-semibold tracking-[-0.03em] sm:text-[34px]"
        >
          Explore our recommendations
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={edges.start}
            aria-label="Scroll recommendations left"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition enabled:hover:border-ink disabled:opacity-35"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={edges.end}
            aria-label="Scroll recommendations right"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition enabled:hover:border-ink disabled:opacity-35"
          >
            <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div
        ref={rail}
        className="no-scrollbar relative -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6"
      >
        {products.map((product) => (
          <div key={product.slug} className="w-[260px] shrink-0 snap-start sm:w-[300px]">
            <ProductCard product={product} compact />
          </div>
        ))}
      </div>
    </section>
  );
}
