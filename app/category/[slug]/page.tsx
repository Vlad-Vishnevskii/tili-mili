import { CategoryPageClient } from "./category-page-client";

type Props = {
  params: Promise<{ slug: string }>;
};

const CategoryPage = async ({ params }: Props) => {
  const { slug } = await params;

  return <CategoryPageClient categorySlug={slug} />;
};

export default CategoryPage;
