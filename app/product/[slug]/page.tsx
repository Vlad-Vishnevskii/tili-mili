import { getProducts } from "@/app/lib/catalog-data";
import { ProductPageClient } from "./product-page-client";

type Props = {
  params: Promise<{ slug: string }>;
};

const ProductPage = async ({ params }: Props) => {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((item) => item.slug === slug) ?? null;

  return <ProductPageClient product={product} />;
};

export default ProductPage;
