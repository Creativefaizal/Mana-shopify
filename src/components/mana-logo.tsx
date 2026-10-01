import type { SVGProps } from "react";

/**
 * The Mana mark: two arches that read as an "M" with a filled centre dot.
 * Pure SVG (no icon font, no emoji) so it stays crisp at every size.
 */
export function ManaMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      role="img"
      aria-label="Mana"
      className={className}
      {...props}
    >
      <path
        d="M2.4 22.2V9.6c0-2.7 2-4.8 4.6-4.8 1.7 0 3.3.9 4.2 2.4L14 11.9l2.8-4.7c.9-1.5 2.5-2.4 4.2-2.4 2.6 0 4.6 2.1 4.6 4.8v12.6"
        stroke="currentColor"
        strokeWidth="3.1"
        strokeLinecap="round"
      />
      <circle cx="14" cy="18.9" r="2.7" fill="currentColor" />
    </svg>
  );
}

export function ManaLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <ManaMark className="h-6 w-6 text-ink" />
      <span className="text-[19px] font-semibold tracking-[-0.02em] text-ink">Mana</span>
    </span>
  );
}
