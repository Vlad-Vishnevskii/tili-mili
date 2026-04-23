import { ProductPageClient } from "./product-page-client";

type Props = {
  params: Promise<{ slug: string }>;
};

const ProductPage = async ({ params }: Props) => {
  const { slug } = await params;

  return <ProductPageClient productSlug={slug} />;
};

export default ProductPage;
