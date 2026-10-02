"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LayoutGrid,
  LogIn,
  LogOut,
  Package,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { ManaLogo } from "@/components/mana-logo";
import { SearchBar } from "@/components/search-bar";
import { useCart } from "@/components/cart-provider";
import type { Profile } from "@/lib/types";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/blog", label: "Blog" },
];

interface HeaderProps {
  profile: Profile | null;
}

export function Header({ profile }: HeaderProps) {
  const pathname = usePathname();
  const { count, openCart, hydrated } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setSearchOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-5">
      <div className="mx-auto flex max-w-[1240px] items-center gap-4 rounded-2xl border border-line/70 bg-white px-4 py-3 shadow-[0_16px_40px_-32px_rgba(17,17,17,0.55)] sm:px-6">
        <Link href="/" aria-label="Mana home" className="shrink-0">
          <ManaLogo />
        </Link>

        <nav aria-label="Primary" className="mx-auto hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm transition ${
                isActive(item.href)
                  ? "font-medium text-ink underline decoration-1 underline-offset-[6px]"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label={searchOpen ? "Close search" : "Open search"}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((value) => !value)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-surface"
          >
            {searchOpen ? (
              <X className="h-[18px] w-[18px]" strokeWidth={1.8} />
            ) : (
              <Search className="h-[18px] w-[18px]" strokeWidth={1.8} />
            )}
          </button>

          <button
            type="button"
            onClick={openCart}
            aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-surface"
          >
            <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={1.8} />
            {hydrated && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 text-[10px] font-semibold text-white">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>

          {profile ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-2 transition hover:border-ink"
              >
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white">
                    {(profile.full_name ?? profile.email ?? "M").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.8} />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+10px)] w-56 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-float"
                >
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-medium">
                      {profile.full_name ?? "Mana customer"}
                    </p>
                    <p className="truncate text-xs text-ink-muted">{profile.email}</p>
                  </div>
                  <Link
                    href="/account"
                    role="menuitem"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-muted transition hover:bg-surface hover:text-ink"
                  >
                    <LayoutGrid className="h-4 w-4" strokeWidth={1.7} />
                    Account overview
                  </Link>
                  <Link
                    href="/account/orders"
                    role="menuitem"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-muted transition hover:bg-surface hover:text-ink"
                  >
                    <Package className="h-4 w-4" strokeWidth={1.7} />
                    My orders
                  </Link>
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      role="menuitem"
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-ink-muted transition hover:bg-surface hover:text-ink"
                    >
                      <LogOut className="h-4 w-4" strokeWidth={1.7} />
                      Sign out
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-pill bg-ink px-4 py-2 text-xs font-medium text-white transition hover:bg-ink-soft"
            >
              <LogIn className="h-3.5 w-3.5" strokeWidth={1.8} />
              Sign in
            </Link>
          )}
        </div>
      </div>

      {searchOpen && (
        <div className="mx-auto mt-2 max-w-[1240px] rounded-2xl border border-line bg-white p-3 shadow-panel sm:p-4">
          <SearchBar variant="compact" placeholder="Search phones, audio, home tech..." />
        </div>
      )}

      <nav
        aria-label="Primary, mobile"
        className="mx-auto mt-2 flex max-w-[1240px] items-center gap-2 md:hidden"
      >
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 rounded-pill border px-3 py-2 text-center text-xs transition ${
              isActive(item.href)
                ? "border-ink bg-ink text-white"
                : "border-line bg-white text-ink-muted"
            }`}
          >
            {item.label}
          </Link>
        ))}
        <Link
          href={profile ? "/account" : "/auth/login"}
          aria-label={profile ? "Account" : "Sign in"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink"
        >
          <User className="h-4 w-4" strokeWidth={1.8} />
        </Link>
      </nav>
    </header>
  );
}
