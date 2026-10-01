"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, Search, X } from "lucide-react";
import { clearRecentSearches, pushRecentSearch, readRecentSearches } from "@/lib/search";

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  /** The big pill under "Give All You Need" vs the compact one in the header. */
  variant?: "hero" | "compact";
}

export function SearchBar({
  defaultValue = "",
  placeholder = "Search on Mana",
  variant = "hero",
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [recent, setRecent] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => setValue(defaultValue), [defaultValue]);

  useEffect(() => {
    setRecent(readRecentSearches());
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const submit = (term: string) => {
    const clean = term.trim();
    if (clean) {
      setRecent(pushRecentSearch(clean));
      router.push(`/shop?q=${encodeURIComponent(clean)}`);
    } else {
      router.push("/shop");
    }
    setOpen(false);
  };

  const hero = variant === "hero";

  return (
    <div ref={wrapper} className="relative w-full">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submit(value);
        }}
        className={
          hero
            ? "flex items-center gap-2 rounded-pill border border-line bg-white p-1.5 pl-4 shadow-[0_10px_30px_-24px_rgba(17,17,17,0.5)]"
            : "flex items-center gap-2 rounded-pill border border-line bg-surface p-1 pl-3"
        }
      >
        <Search className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={1.8} aria-hidden="true" />
        <label className="sr-only" htmlFor={`mana-search-${variant}`}>
          Search products
        </label>
        <input
          id={`mana-search-${variant}`}
          name="q"
          type="search"
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(event) => setValue(event.target.value)}
          className={`w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted ${
            hero ? "py-2.5" : "py-1.5"
          }`}
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Clear search"
            className="text-ink-muted transition hover:text-ink"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        )}
        <button
          type="submit"
          className={`shrink-0 rounded-pill bg-ink font-medium text-white transition hover:bg-ink-soft ${
            hero ? "px-7 py-2.5 text-sm" : "px-4 py-1.5 text-xs"
          }`}
        >
          Search
        </button>
      </form>

      {open && recent.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-2xl border border-line bg-white p-2 shadow-float">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
              Recent searches
            </span>
            <button
              type="button"
              onClick={() => {
                clearRecentSearches();
                setRecent([]);
              }}
              className="text-[11px] text-ink-muted underline transition hover:text-ink"
            >
              Clear
            </button>
          </div>
          <ul>
            {recent.map((term) => (
              <li key={term}>
                <button
                  type="button"
                  onClick={() => {
                    setValue(term);
                    submit(term);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm text-ink-muted transition hover:bg-surface hover:text-ink"
                >
                  <Clock3 className="h-3.5 w-3.5" strokeWidth={1.7} />
                  {term}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
