/**
 * The bundled catalogue - `data/catalog.json`.
 *
 * It is imported at build time so the storefront renders (and the checkout
 * works) before Supabase is wired up. `scripts/seed.mjs` pushes the very same
 * file into your Supabase project, keeping both sources identical.
 */

import raw from "../../data/catalog.json";
import type { Category, Product } from "./types";

type RawCategory = {
  slug: string;
  name: string;
  label: string;
  icon: string;
  sort_order: number;
};

type RawProduct = {
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  compare_at_price: number | null;
  rating: number;
  reviews_count: number;
  image_url: string;
  stock: number;
  is_new: boolean;
  is_best_seller: boolean;
  sort_index: number;
};

export const categories: Category[] = (raw.categories as RawCategory[]).map((category) => ({
  ...category,
}));

const categoryByName = new Map(categories.map((category) => [category.slug, category]));

/** Stable fake timestamps so "newest" sorting is deterministic in fallback mode. */
const BASE_EPOCH = Date.UTC(2025, 0, 1);

export const catalogProducts: Product[] = (raw.products as RawProduct[]).map((product, index) => {
  const reverse = (raw.products as RawProduct[]).length - index;
  return {
    ...product,
    category_name: categoryByName.get(product.category)?.name ?? "Other",
    created_at: new Date(BASE_EPOCH + reverse * 3_600_000).toISOString(),
  };
});

export function categoryLabel(slug: string): string {
  return categoryByName.get(slug)?.name ?? "Other";
}

export function findCatalogProduct(slug: string): Product | undefined {
  return catalogProducts.find((product) => product.slug === slug);
}
