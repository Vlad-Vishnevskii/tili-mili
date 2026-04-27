import { getCategories, getProducts } from "@/app/lib/catalog-data";
import { CategoryPageClient } from "./category-page-client";

type Props = {
  params: Promise<{ slug: string }>;
};

const CategoryPage = async ({ params }: Props) => {
  const { slug } = await params;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);
  const category = categories.find((item) => item.slug === slug) ?? null;

  return <CategoryPageClient category={category} products={products} />;
};

export default CategoryPage;
