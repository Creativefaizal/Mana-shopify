import { CategorySidebar } from "@/components/category-sidebar";
import { Pagination } from "@/components/pagination";
import { ProductGrid } from "@/components/product-grid";
import { getCategories, getProducts, getShopStats } from "@/lib/products";
import type { ShopParams } from "@/lib/shop-params";
import { formatMoney } from "@/lib/format";

interface ShopViewProps {
  params: ShopParams;
  basePath: string;
}

/**
 * The catalogue body shared by the landing page (`/`) and `/shop`: sidebar
 * filters on the left, product grid plus pagination on the right.
 */
export async function ShopView({ params, basePath }: ShopViewProps) {
  const [page, categories, stats] = await Promise.all([
    getProducts({
      q: params.q,
      category: params.category,
      collection: params.collection,
      sort: params.sort,
      page: params.page,
    }),
    getCategories(),
    getShopStats(),
  ]);

  const activeCategory = categories.find((category) => category.slug === params.category);
  const collectionLabels: Record<string, string> = {
    new: "New arrival",
    best: "Best seller",
    discount: "On discount",
  };
  const activeCollection = collectionLabels[params.collection];

  const from = page.total === 0 ? 0 : (page.page - 1) * page.perPage + 1;
  const to = Math.min(page.page * page.perPage, page.total);
  const cheapest = page.items.length
    ? Math.min(...page.items.map((product) => product.price))
    : 0;

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <CategorySidebar categories={categories} params={params} stats={stats} basePath={basePath} />

        <section aria-labelledby="products-heading">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 id="products-heading" className="text-[22px] font-semibold tracking-[-0.02em]">
                {params.q
                  ? `Results for "${params.q}"`
                  : activeCategory
                    ? activeCategory.label
                    : "All products"}
              </h1>
              <p className="mt-1 text-sm text-ink-muted">
                {page.total} product{page.total === 1 ? "" : "s"}
                {page.total > 0 ? ` · showing ${from}–${to}` : ""}
                {activeCollection ? ` · ${activeCollection}` : ""}
                {cheapest > 0 ? ` · from ${formatMoney(cheapest)}` : ""}
              </p>
            </div>
            <p className="text-xs text-ink-muted">
              Catalogue source:{" "}
              <span className="font-medium text-ink">
                {page.source === "supabase" ? "Supabase" : "bundled seed data"}
              </span>
            </p>
          </div>

          <ProductGrid products={page.items} />
          <Pagination page={page.page} pageCount={page.pageCount} params={params} basePath={basePath} />
        </section>
      </div>
    </div>
  );
}
