import { HeroSlideshow } from "@/components/hero-slideshow";
import { SearchBar } from "@/components/search-bar";

/**
 * Landing hero: rotating lifestyle photos with the "Give All You Need" search
 * panel overlapping the bottom edge.
 */
export function ShopHero() {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 pt-4 sm:px-6">
      <div className="relative">
        <div className="relative h-[280px] overflow-hidden rounded-card bg-ink sm:h-[400px]">
          <HeroSlideshow />

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
