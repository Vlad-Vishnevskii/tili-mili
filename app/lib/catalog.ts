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

type StrapiCategoryRelation = {
  id: number;
  name: string;
  slug: string;
};

type StrapiProductSummary = {
  id: number;
};

type StrapiSubcategory = {
  id: number;
  documentId?: string | null;
  name?: string | null;
  label?: string | null;
  slug?: string | null;
  sortOrder?: number | null;
  products?: StrapiProductSummary[] | null;
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
  dietLabel?: string | null;
  isOutOfStock?: boolean | null;
  unitValue: number;
  unitName: string;
  image?: StrapiImage | null;
  seo?: unknown;
  descriptionItems?: StrapiDescriptionItem[] | null;
  category?: StrapiCategoryRelation | null;
  subcategory?: StrapiCategoryRelation | null;
  subcategories?: StrapiSubcategory[] | null;
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
    documentId: string | null;
    name: string;
    label: string;
    slug: string | null;
    sortOrder: number | null;
    link: string;
    productIds: number[];
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
  dietLabel?: string;
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
  subcategory: {
    id: number;
    name: string;
    slug: string;
    link: string | null;
  } | null;
  subcategories: Array<{
    id: number;
    name: string;
    slug: string;
    link: string | null;
  }>;
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

export const getSubcategoryLink = (
  categorySlug: string,
  subcategorySlug?: string | null,
) =>
  subcategorySlug
    ? `/category/${categorySlug}?subcategory=${encodeURIComponent(subcategorySlug)}`
    : `/category/${categorySlug}`;

const normalizeSubcategories = (
  categorySlug: string,
  subcategories?: StrapiSubcategory[] | null,
): CatalogCategory["subCategories"] =>
  (subcategories ?? [])
    .map((item) => {
      const name = (item.name ?? item.label ?? "").trim();
      const slug = item.slug?.trim() || null;

      if (!name) {
        return null;
      }

      return {
        id: item.id,
        documentId: item.documentId ?? null,
        name,
        label: name,
        slug,
        sortOrder:
          typeof item.sortOrder === "number" ? item.sortOrder : null,
        link: getSubcategoryLink(categorySlug, slug),
        productIds: item.products?.map((product) => product.id) ?? [],
      };
    })
    .filter(
      (item): item is CatalogCategory["subCategories"][number] =>
        item !== null,
    );

const normalizeProductSubcategories = (
  product: StrapiProduct,
): CatalogProduct["subcategories"] => {
  const categorySlug = product.category?.slug ?? null;
  const subcategories = [
    ...(product.subcategories ?? []),
    ...(product.subcategory ? [product.subcategory] : []),
  ];
  const seenSlugs = new Set<string>();

  return subcategories
    .map((item) => {
      const name = item.name?.trim() ?? "";
      const slug = item.slug?.trim() ?? "";

      if (!name || !slug || seenSlugs.has(slug)) {
        return null;
      }

      seenSlugs.add(slug);

      return {
        id: item.id,
        name,
        slug,
        link: categorySlug ? getSubcategoryLink(categorySlug, slug) : null,
      };
    })
    .filter(
      (item): item is CatalogProduct["subcategories"][number] =>
        item !== null,
    );
};

export const normalizeCategories = (
  categories: StrapiCategory[],
): CatalogCategory[] =>
  categories.map((category) => ({
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
    subCategories: normalizeSubcategories(
      category.slug,
      category.subcategories,
    ),
    productIds: category.products?.map((product) => product.id) ?? [],
  }));

export const normalizeProducts = (products: StrapiProduct[]): CatalogProduct[] =>
  products.map((product) => {
    const subcategories = normalizeProductSubcategories(product);

    return {
      id: product.id,
      documentId: product.documentId,
      name: product.name,
      slug: product.slug,
      img: getProductImage(product.slug, product.category?.slug, product.image),
      link: `/product/${product.slug}`,
      price: product.price,
      promoLabel: product.promoLabel ?? undefined,
      freezeLabel: product.freezeLabel ?? undefined,
      dietLabel: product.dietLabel?.trim() || undefined,
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
      subcategory: subcategories[0] ?? null,
      subcategories,
    };
  });
