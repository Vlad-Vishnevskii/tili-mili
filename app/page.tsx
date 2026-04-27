import HomePageClient from "./home-page-client";
import { getCategories } from "./lib/catalog-data";

export default async function Home() {
  const categories = await getCategories();

  return <HomePageClient categories={categories} />;
}
