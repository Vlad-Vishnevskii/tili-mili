import type { Metadata } from "next";
import { getProducts } from "@/app/lib/catalog-data";
import { buildMetadata, getSiteSettings } from "@/app/lib/site-data";
import { ProductPageClient } from "./product-page-client";

type Props = {
  params: Promise<{ slug: string }>;
};

const getRandomProducts = <T,>(items: T[], limit: number) => {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledItems[index], shuffledItems[randomIndex]] = [
      shuffledItems[randomIndex],
      shuffledItems[index],
    ];
  }

  return shuffledItems.slice(0, limit);
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [products, siteSettings] = await Promise.all([
    getProducts(),
    getSiteSettings(),
  ]);
  const product = products.find((item) => item.slug === slug) ?? null;

  return buildMetadata({
    seo: product?.seo,
    fallbackSeo: siteSettings.defaultSeo,
    titleFallback: product?.name,
    descriptionFallback: product?.description[0]?.text ?? siteSettings.siteDescription,
    siteName: siteSettings.siteName,
    faviconUrl: siteSettings.faviconUrl,
  });
}

const ProductPage = async ({ params }: Props) => {
  const { slug } = await params;
  const [products, siteSettings] = await Promise.all([
    getProducts(),
    getSiteSettings(),
  ]);
  const product = products.find((item) => item.slug === slug) ?? null;
  const recommendedProducts = product
    ? getRandomProducts(
        products.filter((item) => item.id !== product.id),
        8,
      )
    : [];

  return (
    <ProductPageClient
      product={product}
      recommendedProducts={recommendedProducts}
      siteSettings={siteSettings}
    />
  );
};

export default ProductPage;
