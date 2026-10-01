import type { Collection, SortKey } from "./types";

/** Query-string plumbing shared by the shop page, its sidebar and pagination. */

export interface ShopParams {
  q: string;
  category: string;
  collection: Collection;
  sort: SortKey;
  page: number;
}

export const DEFAULT_PARAMS: ShopParams = {
  q: "",
  category: "all",
  collection: "all",
  sort: "recommended",
  page: 1,
};

const COLLECTIONS: Collection[] = ["all", "new", "best", "discount"];
const SORTS: SortKey[] = ["recommended", "newest", "price-asc", "price-desc", "rating"];

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseShopParams(raw: RawSearchParams | undefined): ShopParams {
  if (!raw) return { ...DEFAULT_PARAMS };

  const collection = first(raw.collection) as Collection | undefined;
  const sort = first(raw.sort) as SortKey | undefined;
  const page = Number.parseInt(first(raw.page) ?? "1", 10);

  return {
    q: (first(raw.q) ?? "").slice(0, 80),
    category: first(raw.category) ?? "all",
    collection: collection && COLLECTIONS.includes(collection) ? collection : "all",
    sort: sort && SORTS.includes(sort) ? sort : "recommended",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function buildShopQuery(
  params: Partial<ShopParams>,
  overrides: Partial<ShopParams> = {},
): string {
  const merged = { ...params, ...overrides };
  const search = new URLSearchParams();

  if (merged.q) search.set("q", merged.q);
  if (merged.category && merged.category !== "all") search.set("category", merged.category);
  if (merged.collection && merged.collection !== "all") search.set("collection", merged.collection);
  if (merged.sort && merged.sort !== "recommended") search.set("sort", merged.sort);
  if (merged.page && merged.page > 1) search.set("page", String(merged.page));

  const value = search.toString();
  return value ? `?${value}` : "";
}

export function shopHref(
  basePath: string,
  params: Partial<ShopParams>,
  overrides: Partial<ShopParams> = {},
): string {
  return `${basePath}${buildShopQuery(params, overrides)}`;
}

/** Compact windowed page list: 1 2 3 ... 8 9 10 */
export function pageWindow(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((value) => pages.add(value));
  if (page >= pageCount - 2) [pageCount - 1, pageCount - 2, pageCount - 3].forEach((value) => pages.add(value));

  const sorted = [...pages].filter((value) => value >= 1 && value <= pageCount).sort((a, b) => a - b);
  const output: (number | "gap")[] = [];
  let previous = 0;

  for (const value of sorted) {
    if (previous && value - previous > 1) output.push("gap");
    output.push(value);
    previous = value;
  }

  return output;
}
