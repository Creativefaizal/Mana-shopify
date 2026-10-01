import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { pageWindow, shopHref, type ShopParams } from "@/lib/shop-params";

interface PaginationProps {
  page: number;
  pageCount: number;
  params: ShopParams;
  basePath?: string;
}

export function Pagination({ page, pageCount, params, basePath = "/shop" }: PaginationProps) {
  if (pageCount <= 1) return null;

  const items = pageWindow(page, pageCount);
  const hasPrev = page > 1;
  const hasNext = page < pageCount;

  const linkClass =
    "inline-flex items-center gap-2 text-sm text-ink-muted transition hover:text-ink";
  const disabledClass = "inline-flex items-center gap-2 text-sm text-ink-muted/40";

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex flex-wrap items-center justify-between gap-4"
    >
      {hasPrev ? (
        <Link href={shopHref(basePath, params, { page: page - 1 })} className={linkClass}>
          <ArrowLeft className="h-4 w-4" strokeWidth={1.6} />
          Previous
        </Link>
      ) : (
        <span className={disabledClass}>
          <ArrowLeft className="h-4 w-4" strokeWidth={1.6} />
          Previous
        </span>
      )}

      <ol className="flex items-center gap-1">
        {items.map((item, index) =>
          item === "gap" ? (
            <li key={`gap-${index}`} className="px-2 text-sm text-ink-muted">
              ...
            </li>
          ) : (
            <li key={item}>
              <Link
                href={shopHref(basePath, params, { page: item })}
                aria-current={item === page ? "page" : undefined}
                className={
                  item === page
                    ? "inline-flex h-9 min-w-9 items-center justify-center rounded-pill bg-white px-3 text-sm font-semibold text-ink shadow-[0_1px_2px_rgba(17,17,17,0.08)]"
                    : "inline-flex h-9 min-w-9 items-center justify-center rounded-pill px-3 text-sm text-ink-muted transition hover:bg-white hover:text-ink"
                }
              >
                {item}
              </Link>
            </li>
          ),
        )}
      </ol>

      {hasNext ? (
        <Link href={shopHref(basePath, params, { page: page + 1 })} className={linkClass}>
          Next
          <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
        </Link>
      ) : (
        <span className={disabledClass}>
          Next
          <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
        </span>
      )}
    </nav>
  );
}
