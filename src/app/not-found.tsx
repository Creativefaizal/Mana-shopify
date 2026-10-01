import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-panel">
        <Compass className="h-7 w-7 text-ink" strokeWidth={1.6} />
      </span>
      <h1 className="mt-6 text-[34px] font-semibold tracking-[-0.035em] sm:text-[44px]">
        This shelf is empty
      </h1>
      <p className="mt-3 max-w-[46ch] text-sm leading-7 text-ink-muted">
        The page you asked for does not exist - it may have sold out permanently. Try the shop, or
        search for what you had in mind.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/shop"
          className="rounded-pill bg-ink px-6 py-3 text-sm font-medium text-white transition hover:bg-ink-soft"
        >
          Browse the shop
        </Link>
        <Link
          href="/contact"
          className="rounded-pill border border-line bg-white px-6 py-3 text-sm font-medium transition hover:border-ink"
        >
          Ask support
        </Link>
      </div>
    </div>
  );
}
