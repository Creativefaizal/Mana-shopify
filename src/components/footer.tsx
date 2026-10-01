import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ManaMark } from "@/components/mana-logo";
import {
  FacebookGlyph,
  InstagramGlyph,
  LinkedinGlyph,
  XGlyph,
} from "@/components/social-icons";

const ABOUT_LINKS = [
  { href: "/blog", label: "Blog" },
  { href: "/branda", label: "Meet The Team" },
  { href: "/contact", label: "Contact Us" },
];

const SUPPORT_LINKS = [
  { href: "/contact", label: "Contact Us" },
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Return" },
  { href: "/faq", label: "FAQ" },
];

const SOCIALS = [
  { href: "https://x.com", label: "X", Icon: XGlyph },
  { href: "https://facebook.com", label: "Facebook", Icon: FacebookGlyph },
  { href: "https://linkedin.com", label: "LinkedIn", Icon: LinkedinGlyph },
  { href: "https://instagram.com", label: "Instagram", Icon: InstagramGlyph },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mx-auto mt-16 w-full max-w-[1240px] px-4 pb-10 sm:px-6">
      <div className="grid gap-10 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-2">
            <ManaMark className="h-6 w-6 text-ink" />
            <span className="text-[19px] font-semibold tracking-[-0.02em]">Mana</span>
          </p>
          <p className="mt-3 max-w-[24ch] text-sm leading-6 text-ink-muted">
            Devices, audio and home essentials chosen for how they feel after a year, not a week.
          </p>
        </div>

        <nav aria-label="About">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em]">About</h2>
          <ul className="mt-4 space-y-2.5">
            {ABOUT_LINKS.map((link) => (
              <li key={`${link.href}-${link.label}`}>
                <Link
                  href={link.href}
                  className="group inline-flex items-center gap-1 text-sm text-ink-muted transition hover:text-ink"
                >
                  {link.label}
                  <ArrowUpRight
                    className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100"
                    strokeWidth={1.8}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Support">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em]">Support</h2>
          <ul className="mt-4 space-y-2.5">
            {SUPPORT_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-ink-muted transition hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.01em]">Social Media</h2>
          <ul className="mt-4 flex items-center gap-3">
            {SOCIALS.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Mana on ${label}`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/70 text-ink transition hover:bg-ink hover:text-white"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.7} />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-muted">
            Support hours: Mon to Fri, 09:00 - 18:00 CET.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
        <p className="text-xs text-ink-muted">
          Copyright © {year} Mana. All Rights Reserved
        </p>
        <div className="flex items-center gap-6">
          <Link href="/terms" className="text-xs text-ink-muted transition hover:text-ink">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-xs text-ink-muted transition hover:text-ink">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
