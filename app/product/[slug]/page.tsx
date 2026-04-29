import type { Metadata } from "next";
import { getProducts } from "@/app/lib/catalog-data";
import { buildMetadata, getSiteSettings } from "@/app/lib/site-data";
import { ProductPageClient } from "./product-page-client";

type Props = {
  params: Promise<{ slug: string }>;
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
  const products = await getProducts();
  const product = products.find((item) => item.slug === slug) ?? null;

  return <ProductPageClient product={product} />;
};

export default ProductPage;
