import { STRAPI_URL } from "@/app/constants";
import {
  normalizeCategories,
  normalizeProducts,
  type CatalogCategory,
  type CatalogProduct,
  type StrapiCategory,
  type StrapiCollectionResponse,
  type StrapiProduct,
} from "@/app/lib/catalog";

const fetchCatalogCollection = async <T>(path: string) => {
  const response = await fetch(`${STRAPI_URL}${path}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as StrapiCollectionResponse<T>;
};

export const getCategories = async (): Promise<CatalogCategory[]> => {
  const payload = await fetchCatalogCollection<StrapiCategory>(
    "/api/categories?populate=*&sort=sortOrder:asc",
  );

  return normalizeCategories(payload.data);
};

export const getProducts = async (): Promise<CatalogProduct[]> => {
  const payload = await fetchCatalogCollection<StrapiProduct>(
    "/api/products?populate=*",
  );

  return normalizeProducts(payload.data);
};
