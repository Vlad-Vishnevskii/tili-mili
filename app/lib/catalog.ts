import {
  CATEGORY_FALLBACK_IMAGES,
  DEFAULT_CATEGORY_IMAGE,
  DEFAULT_PRODUCT_IMAGE,
  PRODUCT_FALLBACK_IMAGES,
} from "@/app/constants";
import { STRAPI_URL } from "@/app/constants";
import { normalizeSeo, type SiteSeo } from "@/app/lib/site-data";

type StrapiImageFormat = {
  url?: string | null;
};

type StrapiImage = {
  url?: string | null;
  formats?: Record<string, StrapiImageFormat> | null;
};

type StrapiDescriptionBlock = {
  id: number;
  text: string;
};

type StrapiDescriptionItem = {
  id: number;
  name: string;
  text: string;
};

type StrapiSubcategory = {
  id: number;
  label: string;
};

type StrapiCategoryRelation = {
  id: number;
  name: string;
  slug: string;
};

type StrapiProductSummary = {
  id: number;
};

export type StrapiCategory = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  sortOrder?: number | null;
  image?: StrapiImage | null;
  seo?: unknown;
  descriptionBlocks?: StrapiDescriptionBlock[] | null;
  subcategories?: StrapiSubcategory[] | null;
  products?: StrapiProductSummary[] | null;
};

export type StrapiProduct = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  price: number;
  promoLabel?: string | null;
  freezeLabel?: string | null;
  isOutOfStock?: boolean | null;
  unitValue: number;
  unitName: string;
  image?: StrapiImage | null;
  seo?: unknown;
  descriptionItems?: StrapiDescriptionItem[] | null;
  category?: StrapiCategoryRelation | null;
};

export type CatalogCategory = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  sortOrder: number | null;
  link: string;
  img: string;
  categoryDescription: string[];
  seo: SiteSeo;
  subCategories: Array<{
    id: number;
    label: string;
  }>;
  productIds: number[];
};

export type CatalogProduct = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  img: string;
  link: string;
  price: number;
  promoLabel?: string;
  freezeLabel?: string;
  isOutOfStock: boolean;
  seo: SiteSeo;
  unit: {
    value: number;
    name: string;
  };
  description: Array<{
    name: string;
    text: string;
  }>;
  category: {
    id: number;
    name: string;
    slug: string;
    link: string;
  } | null;
};

export type StrapiCollectionResponse<T> = {
  data: T[];
};

export const resolveStrapiMediaUrl = (value?: string | null) => {
  if (!value) {
    return null;
  }

  if (value.startsWith("/")) {
    return `${STRAPI_URL}${value}`;
  }

  try {
    const assetUrl = new URL(value);
    const strapiUrl = new URL(STRAPI_URL);

    if (
      assetUrl.hostname === "localhost" ||
      assetUrl.hostname === "127.0.0.1" ||
      assetUrl.pathname.startsWith("/uploads/")
    ) {
      assetUrl.protocol = strapiUrl.protocol;
      assetUrl.host = strapiUrl.host;
    }

    return assetUrl.toString();
  } catch {
    return value;
  }
};

const getImageUrl = (image?: StrapiImage | null) => {
  if (!image) {
    return null;
  }

  return resolveStrapiMediaUrl(
    image.formats?.medium?.url ??
      image.formats?.small?.url ??
      image.formats?.thumbnail?.url ??
      image.url ??
      null,
  );
};

const getCategoryImage = (slug: string, image?: StrapiImage | null) =>
  getImageUrl(image) ??
  CATEGORY_FALLBACK_IMAGES[slug] ??
  DEFAULT_CATEGORY_IMAGE;

const getProductImage = (
  slug: string,
  categorySlug: string | undefined,
  image?: StrapiImage | null,
) =>
  getImageUrl(image) ??
  PRODUCT_FALLBACK_IMAGES[slug] ??
  (categorySlug ? CATEGORY_FALLBACK_IMAGES[categorySlug] : null) ??
  DEFAULT_PRODUCT_IMAGE;

export const normalizeCategories = (
  categories: StrapiCategory[],
): CatalogCategory[] =>
  [...categories]
    .sort((left, right) => {
      const leftSortOrder =
        typeof left.sortOrder === "number" ? left.sortOrder : Number.POSITIVE_INFINITY;
      const rightSortOrder =
        typeof right.sortOrder === "number"
          ? right.sortOrder
          : Number.POSITIVE_INFINITY;

      if (leftSortOrder !== rightSortOrder) {
        return leftSortOrder - rightSortOrder;
      }

      return left.name.localeCompare(right.name, "ru");
    })
    .map((category) => ({
      id: category.id,
      documentId: category.documentId,
      name: category.name,
      slug: category.slug,
      sortOrder:
        typeof category.sortOrder === "number" ? category.sortOrder : null,
      link: `/category/${category.slug}`,
      img: getCategoryImage(category.slug, category.image),
      seo: normalizeSeo(category.seo),
      categoryDescription:
        category.descriptionBlocks?.map((block) => block.text).filter(Boolean) ??
        [],
      subCategories:
        category.subcategories?.map((item) => ({
          id: item.id,
          label: item.label,
        })) ?? [],
      productIds: category.products?.map((product) => product.id) ?? [],
    }));

export const normalizeProducts = (products: StrapiProduct[]): CatalogProduct[] =>
  products.map((product) => ({
    id: product.id,
    documentId: product.documentId,
    name: product.name,
    slug: product.slug,
    img: getProductImage(product.slug, product.category?.slug, product.image),
    link: `/product/${product.slug}`,
    price: product.price,
    promoLabel: product.promoLabel ?? undefined,
    freezeLabel: product.freezeLabel ?? undefined,
    isOutOfStock: Boolean(product.isOutOfStock),
    seo: normalizeSeo(product.seo),
    unit: {
      value: product.unitValue,
      name: product.unitName,
    },
    description:
      product.descriptionItems?.map((item) => ({
        name: item.name,
        text: item.text,
      })) ?? [],
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
          link: `/category/${product.category.slug}`,
        }
      : null,
  }));
