import "server-only";

import { catalogProducts, categories as bundledCategories } from "./catalog";
import { sanitizeTerm } from "./search";
import { getPublicSupabase } from "./supabase/public";
import type { Collection, Product, ProductPage, ProductQuery } from "./types";

export const PER_PAGE = 12;
export const PRODUCT_COLUMNS =
  "id, slug, name, description, category, category_name, price, compare_at_price, rating, reviews_count, image_url, stock, is_new, is_best_seller, sort_index, created_at";

function normalize(row: Record<string, unknown>): Product {
  const compareAt = row.compare_at_price;
  return {
    id: row.id as string | undefined,
    slug: String(row.slug),
    name: String(row.name),
    description: (row.description as string | null) ?? null,
    category: String(row.category ?? "other"),
    category_name: String(row.category_name ?? "Other"),
    price: Number(row.price ?? 0),
    compare_at_price: compareAt === null || compareAt === undefined ? null : Number(compareAt),
    rating: Number(row.rating ?? 0),
    reviews_count: Number(row.reviews_count ?? 0),
    image_url: String(row.image_url ?? "/products/phone-holder.svg"),
    stock: Number(row.stock ?? 0),
    is_new: Boolean(row.is_new),
    is_best_seller: Boolean(row.is_best_seller),
    sort_index:
      row.sort_index === null || row.sort_index === undefined ? undefined : Number(row.sort_index),
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
}

function matchesCollection(product: Product, collection: Collection): boolean {
  switch (collection) {
    case "new":
      return product.is_new;
    case "best":
      return product.is_best_seller;
    case "discount":
      return product.compare_at_price !== null && product.compare_at_price > product.price;
    default:
      return true;
  }
}

export function sortProducts(items: Product[], sort: ProductQuery["sort"]): Product[] {
  const copy = [...items];
  switch (sort) {
    case "newest":
      return copy.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating || b.reviews_count - a.reviews_count);
    default:
      return copy.sort(
        (a, b) =>
          (a.sort_index ?? Number.MAX_SAFE_INTEGER) - (b.sort_index ?? Number.MAX_SAFE_INTEGER) ||
          a.name.localeCompare(b.name),
      );
  }
}

/** Pure filter + sort + paginate, used whenever we serve the bundled catalogue. */
export function queryCatalog(source: Product[], query: ProductQuery = {}): ProductPage {
  const perPage = query.perPage ?? PER_PAGE;
  const page = Math.max(1, query.page ?? 1);
  const collection = query.collection ?? "all";
  const term = sanitizeTerm(query.q ?? "").toLowerCase();

  let items = source.filter((product) => matchesCollection(product, collection));

  if (query.category && query.category !== "all") {
    items = items.filter((product) => product.category === query.category);
  }

  if (term) {
    items = items.filter((product) =>
      [product.name, product.description ?? "", product.category_name]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }

  items = sortProducts(items, query.sort);

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, pageCount);

  return {
    items: items.slice((safePage - 1) * perPage, safePage * perPage),
    total,
    page: safePage,
    pageCount,
    perPage,
    source: "catalog",
  };
}

export async function getCategories() {
  const supabase = getPublicSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("categories")
      .select("slug, name, label, icon, sort_order")
      .order("sort_order", { ascending: true });
    if (!error && data && data.length > 0) {
      return data as {
        slug: string;
        name: string;
        label: string;
        icon: string;
        sort_order: number;
      }[];
    }
  }
  return bundledCategories;
}

export async function getProducts(query: ProductQuery = {}): Promise<ProductPage> {
  const fallback = () => queryCatalog(catalogProducts, query);
  const supabase = getPublicSupabase();
  if (!supabase) return fallback();

  const perPage = query.perPage ?? PER_PAGE;
  const page = Math.max(1, query.page ?? 1);
  const term = sanitizeTerm(query.q ?? "");

  let builder = supabase.from("products").select(PRODUCT_COLUMNS, { count: "exact" });

  if (term) {
    builder = builder.or(
      `name.ilike.%${term}%,description.ilike.%${term}%,category_name.ilike.%${term}%`,
    );
  }
  if (query.category && query.category !== "all") {
    builder = builder.eq("category", query.category);
  }
  if (query.collection === "new") builder = builder.eq("is_new", true);
  if (query.collection === "best") builder = builder.eq("is_best_seller", true);
  if (query.collection === "discount") builder = builder.not("compare_at_price", "is", null);

  switch (query.sort) {
    case "newest":
      builder = builder.order("created_at", { ascending: false });
      break;
    case "price-asc":
      builder = builder.order("price", { ascending: true });
      break;
    case "price-desc":
      builder = builder.order("price", { ascending: false });
      break;
    case "rating":
      builder = builder.order("rating", { ascending: false });
      break;
    default:
      builder = builder.order("sort_index", { ascending: true });
  }

  const from = (page - 1) * perPage;
  const { data, count, error } = await builder.range(from, from + perPage - 1);

  if (error) {
    console.warn("[mana] product query failed, serving bundled catalogue:", error.message);
    return fallback();
  }

  const items = (data ?? []).map((row) => normalize(row as Record<string, unknown>));

  // Project is connected but the tables are still empty (seed not run yet).
  if (
    items.length === 0 &&
    page === 1 &&
    !term &&
    (!query.category || query.category === "all") &&
    (query.collection ?? "all") === "all"
  ) {
    return fallback();
  }

  const total = count ?? items.length;
  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
    perPage,
    source: "supabase",
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = getPublicSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();
    if (!error && data) return normalize(data as Record<string, unknown>);
  }
  return catalogProducts.find((product) => product.slug === slug) ?? null;
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return [];
  const supabase = getPublicSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .in("slug", slugs);
    if (!error && data && data.length > 0) {
      return (data as Record<string, unknown>[]).map(normalize);
    }
  }
  return catalogProducts.filter((product) => slugs.includes(product.slug));
}

export async function getRecommendations(limit = 8): Promise<Product[]> {
  const supabase = getPublicSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("is_best_seller", true)
      .order("rating", { ascending: false })
      .limit(limit);
    if (!error && data && data.length > 0) {
      return (data as Record<string, unknown>[]).map(normalize);
    }
  }
  return sortProducts(
    catalogProducts.filter((product) => product.is_best_seller),
    "rating",
  ).slice(0, limit);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const supabase = getPublicSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("category", product.category)
      .neq("slug", product.slug)
      .limit(limit);
    if (!error && data && data.length > 0) {
      return (data as Record<string, unknown>[]).map(normalize);
    }
  }
  return catalogProducts
    .filter((entry) => entry.category === product.category && entry.slug !== product.slug)
    .slice(0, limit);
}

export interface ShopStats {
  total: number;
  byCategory: Record<string, number>;
  newArrivals: number;
  bestSellers: number;
  onDiscount: number;
}

const CATEGORY_SLUGS = ["home", "music", "phone", "storage", "other"];

function statsFromCatalog(): ShopStats {
  const byCategory: Record<string, number> = {};
  for (const product of catalogProducts) {
    byCategory[product.category] = (byCategory[product.category] ?? 0) + 1;
  }
  return {
    total: catalogProducts.length,
    byCategory,
    newArrivals: catalogProducts.filter((product) => product.is_new).length,
    bestSellers: catalogProducts.filter((product) => product.is_best_seller).length,
    onDiscount: catalogProducts.filter(
      (product) => product.compare_at_price !== null && product.compare_at_price > product.price,
    ).length,
  };
}

/** Counts shown next to the sidebar filters (head-only queries, very cheap). */
export async function getShopStats(): Promise<ShopStats> {
  const supabase = getPublicSupabase();
  if (!supabase) return statsFromCatalog();

  const count = async (
    filters: Array<[string, string | boolean]> = [],
  ): Promise<number | null> => {
    let query = supabase.from("products").select("slug", { count: "exact", head: true });
    for (const [column, value] of filters) {
      query = query.eq(column, value);
    }
    const { count: total, error } = await query;
    return error ? null : (total ?? 0);
  };

  const total = await count();
  if (total === null) return statsFromCatalog();

  const categoryCounts = await Promise.all(CATEGORY_SLUGS.map((slug) => count([["category", slug]])));
  if (categoryCounts.some((value) => value === null)) return statsFromCatalog();

  const [newArrivals, bestSellers] = await Promise.all([
    count([["is_new", true]]),
    count([["is_best_seller", true]]),
  ]);

  const { count: discountCount } = await supabase
    .from("products")
    .select("slug", { count: "exact", head: true })
    .not("compare_at_price", "is", null);

  const byCategory: Record<string, number> = {};
  CATEGORY_SLUGS.forEach((slug, index) => {
    byCategory[slug] = categoryCounts[index] ?? 0;
  });

  return {
    total,
    byCategory,
    newArrivals: newArrivals ?? 0,
    bestSellers: bestSellers ?? 0,
    onDiscount: discountCount ?? statsFromCatalog().onDiscount,
  };
}

