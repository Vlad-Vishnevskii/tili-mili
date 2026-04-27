import { cache } from "react";
import { QUERY_STALE_TIME, STRAPI_URL } from "@/app/constants";
import {
  normalizeCategories,
  normalizeProducts,
  type CatalogCategory,
  type CatalogProduct,
  type StrapiCategory,
  type StrapiCollectionResponse,
  type StrapiProduct,
} from "@/app/lib/catalog";

const CATALOG_REVALIDATE_SECONDS = QUERY_STALE_TIME / 1000;

const fetchCatalogCollection = async <T>(path: string) => {
  const response = await fetch(`${STRAPI_URL}${path}`, {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: CATALOG_REVALIDATE_SECONDS,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as StrapiCollectionResponse<T>;
};

export const getCategories = cache(async (): Promise<CatalogCategory[]> => {
  const payload = await fetchCatalogCollection<StrapiCategory>(
    "/api/categories?populate=*",
  );

  return normalizeCategories(payload.data);
});

export const getProducts = cache(async (): Promise<CatalogProduct[]> => {
  const payload = await fetchCatalogCollection<StrapiProduct>(
    "/api/products?populate=*",
  );

  return normalizeProducts(payload.data);
});
