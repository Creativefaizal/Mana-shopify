"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  ChevronDown,
  ChevronRight,
  HardDrive,
  Home,
  Music2,
  Package,
  Smartphone,
  Sparkles,
  TicketPercent,
  type LucideIcon,
} from "lucide-react";
import { shopHref, type ShopParams } from "@/lib/shop-params";
import type { Category } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  Home,
  Music2,
  Smartphone,
  HardDrive,
  Package,
};

interface CategorySidebarProps {
  categories: Category[];
  params: ShopParams;
  stats: {
    total: number;
    byCategory: Record<string, number>;
    newArrivals: number;
    bestSellers: number;
    onDiscount: number;
  };
  /** Category links point at the landing page or the dedicated shop page. */
  basePath?: string;
}

export function CategorySidebar({
  categories,
  params,
  stats,
  basePath = "/shop",
}: CategorySidebarProps) {
  const [openAll, setOpenAll] = useState(true);
  const [openNew, setOpenNew] = useState(params.collection === "new");
  const [openBest, setOpenBest] = useState(params.collection === "best");
  const [openOffers, setOpenOffers] = useState(params.collection === "discount");

  const rowClass = (active: boolean) =>
    `inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
      active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink"
    }`;

  const collectionRows: Array<{
    key: "new" | "best" | "discount";
    label: string;
    icon: LucideIcon;
    count: number;
    open: boolean;
    toggle: () => void;
  }> = [
    {
      key: "new",
      label: "New Arrival",
      icon: Sparkles,
      count: stats.newArrivals,
      open: openNew,
      toggle: () => setOpenNew((value) => !value),
    },
    {
      key: "best",
      label: "Best Seller",
      icon: Award,
      count: stats.bestSellers,
      open: openBest,
      toggle: () => setOpenBest((value) => !value),
    },
    {
      key: "discount",
      label: "On Discount",
      icon: TicketPercent,
      count: stats.onDiscount,
      open: openOffers,
      toggle: () => setOpenOffers((value) => !value),
    },
  ];

  const sortLinks: Array<{ key: ShopParams["sort"]; label: string }> = [
    { key: "recommended", label: "Recommended" },
    { key: "newest", label: "Latest first" },
    { key: "price-asc", label: "Price: low to high" },
    { key: "price-desc", label: "Price: high to low" },
    { key: "rating", label: "Top rated" },
  ];

  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <h2 className="mb-3 text-[15px] font-semibold tracking-[-0.01em]">Category</h2>

      <div className="rounded-card border border-line bg-white p-3 shadow-panel">
        <button
          type="button"
          onClick={() => setOpenAll((value) => !value)}
          aria-expanded={openAll}
          className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Package className="h-4 w-4 text-ink-muted" strokeWidth={1.7} />
            All Product
          </span>
          <span className="flex items-center gap-2">
            <span className="rounded-md bg-sale px-1.5 py-0.5 text-[11px] font-semibold text-white">
              {stats.total}
            </span>
            {openAll ? (
              <ChevronDown className="h-4 w-4 text-ink-muted" strokeWidth={1.7} />
            ) : (
              <ChevronRight className="h-4 w-4 text-ink-muted" strokeWidth={1.7} />
            )}
          </span>
        </button>

        {openAll && (
          <ul className="mt-1 space-y-0.5 border-l border-line pl-3">
            {categories.map((category) => {
              const Icon = ICONS[category.icon] ?? Package;
              const active = params.category === category.slug;
              return (
                <li key={category.slug}>
                  <Link
                    href={shopHref(basePath, params, { category: category.slug, page: 1 })}
                    className={`flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm transition ${
                      active ? "bg-ink text-white" : "text-ink-muted hover:bg-surface hover:text-ink"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" strokeWidth={1.7} />
                      {category.label}
                    </span>
                    <span className={`text-[11px] ${active ? "text-white/70" : "text-ink-muted/70"}`}>
                      {stats.byCategory[category.slug] ?? 0}
                    </span>
                  </Link>
                </li>
              );
            })}
            {params.category !== "all" && (
              <li>
                <Link
                  href={shopHref(basePath, params, { category: "all", page: 1 })}
                  className="flex items-center rounded-lg px-2 py-2 text-xs text-ink-muted underline decoration-dotted"
                >
                  Clear category
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {collectionRows.map((row) => {
          const active = params.collection === row.key;
          const Icon = row.icon;
          return (
            <div
              key={row.key}
              className={`flex items-center gap-3 rounded-card border bg-white/70 p-2.5 transition ${
                active ? "border-ink" : "border-line"
              }`}
            >
              <span className={rowClass(active)}>
                <Icon className="h-4 w-4" strokeWidth={1.7} />
              </span>
              <Link
                href={shopHref(basePath, params, {
                  collection: active ? "all" : row.key,
                  page: 1,
                })}
                className="flex-1 text-sm font-medium"
              >
                {row.label}
                <span className="ml-1 text-[11px] text-ink-muted">({row.count})</span>
              </Link>
              <button
                type="button"
                onClick={row.toggle}
                aria-expanded={row.open}
                aria-label={`${row.open ? "Hide" : "Show"} ${row.label} details`}
                className="text-ink-muted transition hover:text-ink"
              >
                {row.open ? (
                  <ChevronDown className="h-4 w-4" strokeWidth={1.7} />
                ) : (
                  <ChevronRight className="h-4 w-4" strokeWidth={1.7} />
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-[15px] font-semibold tracking-[-0.01em]">Sort by</h3>
        <ul className="space-y-1">
          {sortLinks.map((link) => {
            const active = params.sort === link.key;
            return (
              <li key={link.key}>
                <Link
                  href={shopHref(basePath, params, { sort: link.key, page: 1 })}
                  className={`block rounded-lg px-2 py-2 text-sm transition ${
                    active
                      ? "bg-white font-medium text-ink shadow-[0_1px_2px_rgba(17,17,17,0.06)]"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
