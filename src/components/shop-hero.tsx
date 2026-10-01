import { SearchBar } from "@/components/search-bar";

/**
 * Landing hero: interior photograph, the oversized "Shop" wordmark drifting
 * slowly across it, and the "Give All You Need" search panel that overlaps the
 * bottom edge - exactly like the reference layout.
 */
export function ShopHero() {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 pt-4 sm:px-6">
      <div className="relative">
        <div className="relative h-[280px] overflow-hidden rounded-card bg-ink sm:h-[400px]">
          <img
            src="/hero-interior.svg"
            alt="A calm living room with Mana devices"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-ink/10 to-transparent" />

          <div className="absolute inset-x-0 bottom-4 overflow-hidden sm:bottom-8">
            <div className="flex w-max animate-marquee pl-6">
              {[0, 1].map((copy) => (
                <span
                  key={copy}
                  aria-hidden={copy === 1}
                  className="whitespace-nowrap pr-10 text-[132px] font-bold leading-[0.8] tracking-[-0.04em] text-white/95 sm:text-[248px]"
                >
                  Shop
                </span>
              ))}
            </div>
          </div>

          <h1 className="sr-only">Shop the Mana collection</h1>
        </div>

        <div className="relative mx-2 -mt-8 rounded-card border border-line bg-white p-4 shadow-panel sm:mx-6 sm:-mt-10 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-[20px] font-semibold tracking-[-0.02em] sm:text-[24px]">
              Give All You Need
            </h2>
            <div className="w-full lg:max-w-[520px]">
              <SearchBar />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
