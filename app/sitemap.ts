import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/constants";
import { getCategories, getProducts } from "@/app/lib/catalog-data";

export const dynamic = "force-dynamic";

const getAbsoluteUrl = (path: string) => new URL(path, SITE_URL).toString();

const createEntry = (
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
): MetadataRoute.Sitemap[number] => ({
  url: getAbsoluteUrl(path),
  lastModified: new Date(),
  changeFrequency,
  priority,
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    createEntry("/", "daily", 1),
    createEntry("/delivery", "monthly", 0.6),
  ];

  try {
    const [categories, products] = await Promise.all([
      getCategories(),
      getProducts(),
    ]);

    return [
      ...staticEntries,
      ...categories.map((category) =>
        createEntry(category.link, "weekly", 0.8),
      ),
      ...products.map((product) =>
        createEntry(product.link, "weekly", 0.7),
      ),
    ];
  } catch {
    return staticEntries;
  }
}
