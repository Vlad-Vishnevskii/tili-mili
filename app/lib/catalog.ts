import {
  CATEGORY_FALLBACK_IMAGES,
  DEFAULT_CATEGORY_IMAGE,
  DEFAULT_PRODUCT_IMAGE,
  PRODUCT_FALLBACK_IMAGES,
} from "@/app/constants";

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
  image?: StrapiImage | null;
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
  descriptionItems?: StrapiDescriptionItem[] | null;
  category?: StrapiCategoryRelation | null;
};

export type CatalogCategory = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  link: string;
  img: string;
  categoryDescription: string[];
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

const getImageUrl = (image?: StrapiImage | null) => {
  if (!image) {
    return null;
  }

  return (
    image.formats?.medium?.url ??
    image.formats?.small?.url ??
    image.formats?.thumbnail?.url ??
    image.url ??
    null
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
  categories.map((category) => ({
    id: category.id,
    documentId: category.documentId,
    name: category.name,
    slug: category.slug,
    link: `/category/${category.slug}`,
    img: getCategoryImage(category.slug, category.image),
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
