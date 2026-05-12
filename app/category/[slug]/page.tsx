import type { Metadata } from "next";
import { getCategories, getProducts } from "@/app/lib/catalog-data";
import { buildMetadata, getSiteSettings } from "@/app/lib/site-data";
import { CategoryPageClient } from "./category-page-client";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [categories, siteSettings] = await Promise.all([
    getCategories(),
    getSiteSettings(),
  ]);
  const category = categories.find((item) => item.slug === slug) ?? null;

  return buildMetadata({
    seo: category?.seo,
    fallbackSeo: siteSettings.defaultSeo,
    titleFallback: category?.name,
    descriptionFallback: category?.categoryDescription[0] ?? siteSettings.siteDescription,
    siteName: siteSettings.siteName,
    faviconUrl: siteSettings.faviconUrl,
  });
}

const CategoryPage = async ({ params }: Props) => {
  const { slug } = await params;
  const [categories, products, siteSettings] = await Promise.all([
    getCategories(),
    getProducts(),
    getSiteSettings(),
  ]);
  const category = categories.find((item) => item.slug === slug) ?? null;

  return (
    <CategoryPageClient
      category={category}
      products={products}
      siteSettings={siteSettings}
    />
  );
};

export default CategoryPage;
