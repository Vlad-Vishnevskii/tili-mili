"use client";

import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, QUERY_STALE_TIME } from "@/app/constants";
import type { CatalogCategory, CatalogProduct } from "@/app/lib/catalog";

const fetchCatalog = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};

export const useCategoriesQuery = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCatalog<CatalogCategory[]>("/api/categories"),
    staleTime: QUERY_STALE_TIME,
  });

export const useProductsQuery = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: () => fetchCatalog<CatalogProduct[]>("/api/products"),
    staleTime: QUERY_STALE_TIME,
  });
