import { NewsletterCta } from "@/components/newsletter-cta";
import { RecommendationsRail } from "@/components/recommendations-rail";
import { ShopHero } from "@/components/shop-hero";
import { ShopView } from "@/components/shop-view";
import { getRecommendations } from "@/lib/products";
import { parseShopParams } from "@/lib/shop-params";

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = parseShopParams(await searchParams);
  const recommendations = await getRecommendations(8);

  return (
    <div className="space-y-16 pb-4">
      <ShopHero />
      <ShopView params={params} basePath="/" />
      <RecommendationsRail products={recommendations} />
      <NewsletterCta />
    </div>
  );
}
