import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { BuyBox } from "@/components/buy-box";
import { RecommendationsRail } from "@/components/recommendations-rail";
import { StarRating } from "@/components/star-rating";
import { discountPercent, formatMoney, PRICING } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.description ?? `Buy ${product.name} at Mana.`,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: [product.image_url],
    },
  };
}

const PERKS = [
  { Icon: Truck, title: "Free standard shipping", copy: `On every order over ${formatMoney(PRICING.freeShippingThreshold)}.` },
  { Icon: RotateCcw, title: "30 day returns", copy: "Unopened or not, we take it back." },
  { Icon: ShieldCheck, title: "2 year warranty", copy: "Handled in house, not by a call centre." },
];

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 6);
  const off = discountPercent(product.price, product.compare_at_price);

  return (
    <div className="space-y-16 pb-4">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-muted">
          <Link href="/" className="transition hover:text-ink">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" strokeWidth={2} />
          <Link href={`/shop?category=${product.category}`} className="transition hover:text-ink">
            {product.category_name}
          </Link>
          <ChevronRight className="h-3 w-3" strokeWidth={2} />
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="relative overflow-hidden rounded-card bg-tile">
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full max-h-[560px] w-full object-contain p-10"
            />
            <span className="absolute right-4 top-4 rounded-pill bg-white/95 px-3 py-1 text-[11px] font-medium shadow-sm">
              {product.category_name}
            </span>
            {off !== null && (
              <span className="absolute left-4 top-4 rounded-pill bg-sale px-3 py-1 text-[11px] font-semibold text-white">
                Save {off}%
              </span>
            )}
          </div>

          <div>
            <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.03em] sm:text-[40px]">
              {product.name}
            </h1>

            <div className="mt-3">
              <StarRating rating={product.rating} reviews={product.reviews_count} size={16} />
            </div>

            <div className="mt-6 flex items-end gap-3">
              <span className="text-[30px] font-bold tracking-[-0.03em]">
                {formatMoney(product.price)}
              </span>
              {product.compare_at_price !== null && product.compare_at_price > product.price && (
                <span className="pb-1 text-sm text-ink-muted line-through">
                  {formatMoney(product.compare_at_price)}
                </span>
              )}
            </div>

            <p className="mt-6 max-w-[54ch] text-sm leading-7 text-ink-muted">
              {product.description ?? "A Mana essential, built to be used every day."}
            </p>

            <BuyBox product={product} />

            <dl className="mt-10 grid gap-4 border-t border-line pt-6 sm:grid-cols-3">
              {PERKS.map(({ Icon, title, copy }) => (
                <div key={title}>
                  <dt className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="h-4 w-4 text-ink-muted" strokeWidth={1.7} />
                    {title}
                  </dt>
                  <dd className="mt-1 text-xs leading-5 text-ink-muted">{copy}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <RecommendationsRail products={related} />
    </div>
  );
}
