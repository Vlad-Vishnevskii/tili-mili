import type { Metadata } from "next";
import {
  SITE_URL,
  STRAPI_HOME_PAGE_PATH,
  STRAPI_SITE_SETTINGS_PATH,
  STRAPI_URL,
} from "@/app/constants";
import { resolveStrapiMediaUrl } from "@/app/lib/catalog";

type UnknownRecord = Record<string, unknown>;

export type SiteSeo = {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
};

export type SiteContacts = {
  phone?: string;
  secondaryPhone?: string;
  email?: string;
  address?: string;
  workingHours?: string;
};

export type SiteSocialLink = {
  id: string;
  label: string;
  href: string;
};

export type SiteSettings = {
  siteName: string;
  siteDescription: string;
  faviconUrl: string | null;
  defaultSeo: SiteSeo;
  contacts: SiteContacts | null;
  socialLinks: SiteSocialLink[];
  promoText?: string;
};

export type HomeHeroBanner = {
  id: string;
  title: string;
  text?: string;
  accent?: string;
  meta: string[];
  imageUrl?: string;
  mobileImageUrl?: string;
  isActive: boolean;
};

export type HomePageData = {
  title?: string;
  slug?: string;
  seo: SiteSeo;
  heroBanners: HomeHeroBanner[];
  promoText?: string;
};

const DEFAULT_SITE_NAME = "TILI-MILI";
const DEFAULT_SITE_DESCRIPTION = "Farm products with delivery from TILI-MILI.";
const DEFAULT_FAVICON = "/logo_32x32.svg";

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const getString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;

const getBoolean = (value: unknown): boolean | undefined =>
  typeof value === "boolean" ? value : undefined;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const unwrapEntry = (value: unknown): UnknownRecord | null => {
  if (!isRecord(value)) {
    return null;
  }

  if (isRecord(value.attributes)) {
    return {
      ...value.attributes,
      id: value.id,
      documentId: value.documentId,
    };
  }

  return value;
};

const extractSingleType = (payload: unknown): UnknownRecord | null => {
  if (!isRecord(payload)) {
    return null;
  }

  if ("data" in payload) {
    return unwrapEntry(payload.data);
  }

  return unwrapEntry(payload);
};

const extractStringList = (value: unknown): string[] => {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    return [value];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .flatMap((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (!isRecord(item)) {
        return [];
      }

      return (
        getString(item.text) ??
        getString(item.label) ??
        getString(item.title) ??
        getString(item.value) ??
        []
      );
    })
    .filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
};

const extractMediaUrl = (value: unknown): string | null => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return resolveStrapiMediaUrl(value);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nestedUrl = extractMediaUrl(item);

      if (nestedUrl) {
        return nestedUrl;
      }
    }

    return null;
  }

  if (!isRecord(value)) {
    return null;
  }

  const directUrl =
    getString(value.url) ??
    getString(value["medium"]) ??
    getString(value["small"]) ??
    getString(value["thumbnail"]);

  if (directUrl) {
    return resolveStrapiMediaUrl(directUrl);
  }

  if (isRecord(value.formats)) {
    const formattedUrl =
      extractMediaUrl(value.formats.large) ??
      extractMediaUrl(value.formats.medium) ??
      extractMediaUrl(value.formats.small) ??
      extractMediaUrl(value.formats.thumbnail);

    if (formattedUrl) {
      return formattedUrl;
    }
  }

  return (
    extractMediaUrl(value.data) ?? extractMediaUrl(value.attributes) ?? null
  );
};

export const normalizeSeo = (value: unknown): SiteSeo => {
  if (!isRecord(value)) {
    return {};
  }

  const metaRobots = getString(value.metaRobots)?.toLowerCase();
  const keywordsValue = value.keywords;
  const keywords =
    typeof keywordsValue === "string"
      ? keywordsValue
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : extractStringList(keywordsValue);

  return {
    title: getString(value.metaTitle) ?? getString(value.title),
    description:
      getString(value.metaDescription) ?? getString(value.description),
    keywords: keywords.length ? keywords : undefined,
    canonicalUrl:
      getString(value.canonicalURL) ?? getString(value.canonicalUrl),
    ogTitle: getString(value.ogTitle),
    ogDescription: getString(value.ogDescription),
    ogImageUrl:
      extractMediaUrl(value.ogImage) ?? undefined,
    noIndex:
      getBoolean(value.noIndex) ??
      (metaRobots ? metaRobots.includes("noindex") : undefined),
    noFollow:
      getBoolean(value.noFollow) ??
      (metaRobots ? metaRobots.includes("nofollow") : undefined),
  };
};

const getContactField = (value: UnknownRecord, keys: string[]) => {
  for (const key of keys) {
    const fieldValue = getString(value[key]);

    if (fieldValue) {
      return fieldValue;
    }
  }

  return undefined;
};

const normalizeContacts = (value: unknown): SiteContacts | null => {
  if (!isRecord(value)) {
    return null;
  }

  const contacts: SiteContacts = {
    phone: getContactField(value, [
      "phone",
      "phoneNumber",
      "primaryPhone",
      "telephone",
      "tel",
    ]),
    secondaryPhone: getContactField(value, [
      "secondaryPhone",
      "additionalPhone",
      "mobilePhone",
    ]),
    email: getContactField(value, ["email", "mail"]),
    address: getContactField(value, ["address", "location"]),
    workingHours: getContactField(value, [
      "workingHours",
      "workHours",
      "schedule",
    ]),
  };

  return Object.values(contacts).some(Boolean) ? contacts : null;
};

const normalizeSocialLinks = (value: unknown): SiteSocialLink[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!isRecord(item)) {
        return null;
      }

      const href = getString(item.url) ?? getString(item.href);

      if (!href) {
        return null;
      }

      const label =
        getString(item.label) ??
        getString(item.platform) ??
        getString(item.title) ??
        `Social ${index + 1}`;

      return {
        id: slugify(
          getString(item.platform) ??
            getString(item.label) ??
            getString(item.title) ??
            label,
        ),
        label,
        href,
      };
    })
    .filter((item): item is SiteSocialLink => item !== null);
};

const normalizeHeroBanners = (value: unknown): HomeHeroBanner[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const banners = value
    .map((item, index): HomeHeroBanner | null => {
      if (!isRecord(item)) {
        return null;
      }

      const title =
        getString(item.title) ??
        getString(item.heading) ??
        getString(item.name) ??
        `Banner ${index + 1}`;

      return {
        id:
          getString(item.documentId) ??
          String(item.id ?? `${slugify(title)}-${index + 1}`),
        title,
        text: getString(item.text) ?? getString(item.description),
        accent:
          getString(item.accent) ??
          getString(item.eyebrow) ??
          getString(item.kicker),
        meta: [
          ...extractStringList(item.meta),
          ...extractStringList(item.metaItems),
          ...extractStringList(item.highlights),
        ],
        imageUrl: extractMediaUrl(item.image) ?? undefined,
        mobileImageUrl: extractMediaUrl(item.mobileImage) ?? undefined,
        isActive: getBoolean(item.isActive) ?? true,
      };
    })
    .filter((item): item is HomeHeroBanner => item !== null);

  return banners.filter((item) => item.isActive);
};

const getFallbackSiteSettings = (): SiteSettings => ({
  siteName: DEFAULT_SITE_NAME,
  siteDescription: DEFAULT_SITE_DESCRIPTION,
  faviconUrl: DEFAULT_FAVICON,
  defaultSeo: {
    title: DEFAULT_SITE_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
  },
  contacts: null,
  socialLinks: [],
});

const getFallbackHomePage = (): HomePageData => ({
  seo: {},
  heroBanners: [],
});

const fetchStrapiSingle = async (
  path: string,
): Promise<UnknownRecord | null> => {
  const response = await fetch(`${STRAPI_URL}${path}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return extractSingleType((await response.json()) as unknown);
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
  try {
    const payload = await fetchStrapiSingle(STRAPI_SITE_SETTINGS_PATH);

    if (!payload) {
      return getFallbackSiteSettings();
    }

    const fallback = getFallbackSiteSettings();

    return {
      siteName: getString(payload.siteName) ?? fallback.siteName,
      siteDescription:
        getString(payload.siteDescription) ?? fallback.siteDescription,
      faviconUrl: extractMediaUrl(payload.favicon) ?? fallback.faviconUrl,
      defaultSeo: normalizeSeo(payload.defaultSeo),
      contacts: normalizeContacts(payload.contacts),
      socialLinks: normalizeSocialLinks(payload.socialLinks),
      promoText: getString(payload.promoText),
    };
  } catch {
    return getFallbackSiteSettings();
  }
};

export const getHomePage = async (): Promise<HomePageData> => {
  try {
    const payload = await fetchStrapiSingle(STRAPI_HOME_PAGE_PATH);

    if (!payload) {
      return getFallbackHomePage();
    }

    return {
      title: getString(payload.title),
      slug: getString(payload.slug),
      seo: normalizeSeo(payload.seo),
      heroBanners: normalizeHeroBanners(payload.heroBanners),
      promoText: getString(payload.promoText),
    };
  } catch {
    return getFallbackHomePage();
  }
};

export const mergeSeoWithFallback = (
  pageSeo: SiteSeo | undefined,
  fallbackSeo: SiteSeo | undefined,
): SiteSeo => ({
  title: pageSeo?.title ?? fallbackSeo?.title,
  description: pageSeo?.description ?? fallbackSeo?.description,
  keywords:
    pageSeo?.keywords && pageSeo.keywords.length > 0
      ? pageSeo.keywords
      : fallbackSeo?.keywords,
  canonicalUrl: pageSeo?.canonicalUrl ?? fallbackSeo?.canonicalUrl,
  ogTitle:
    pageSeo?.ogTitle ??
    fallbackSeo?.ogTitle ??
    pageSeo?.title ??
    fallbackSeo?.title,
  ogDescription:
    pageSeo?.ogDescription ??
    fallbackSeo?.ogDescription ??
    pageSeo?.description ??
    fallbackSeo?.description,
  ogImageUrl: pageSeo?.ogImageUrl ?? fallbackSeo?.ogImageUrl,
  noIndex: pageSeo?.noIndex ?? fallbackSeo?.noIndex,
  noFollow: pageSeo?.noFollow ?? fallbackSeo?.noFollow,
});

const resolveSiteUrl = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).toString();
  } catch {
    if (!SITE_URL) {
      return undefined;
    }

    return new URL(value, SITE_URL).toString();
  }
};

type BuildMetadataInput = {
  seo?: SiteSeo;
  fallbackSeo?: SiteSeo;
  titleFallback?: string;
  descriptionFallback?: string;
  siteName?: string;
  faviconUrl?: string | null;
};

export const buildMetadata = ({
  seo,
  fallbackSeo,
  titleFallback,
  descriptionFallback,
  siteName,
  faviconUrl,
}: BuildMetadataInput): Metadata => {
  const mergedSeo = mergeSeoWithFallback(seo, fallbackSeo);
  const title =
    mergedSeo.title ?? titleFallback ?? siteName ?? DEFAULT_SITE_NAME;
  const description =
    mergedSeo.description ?? descriptionFallback ?? DEFAULT_SITE_DESCRIPTION;
  const canonicalUrl = resolveSiteUrl(mergedSeo.canonicalUrl);
  const iconUrl = faviconUrl ?? DEFAULT_FAVICON;

  return {
    metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
    title,
    description,
    keywords: mergedSeo.keywords,
    alternates: canonicalUrl
      ? {
          canonical: canonicalUrl,
        }
      : undefined,
    openGraph: {
      title: mergedSeo.ogTitle ?? title,
      description: mergedSeo.ogDescription ?? description,
      siteName: siteName ?? DEFAULT_SITE_NAME,
      url: canonicalUrl,
      type: "website",
      images: mergedSeo.ogImageUrl
        ? [{ url: mergedSeo.ogImageUrl }]
        : undefined,
    },
    twitter: {
      card: mergedSeo.ogImageUrl ? "summary_large_image" : "summary",
      title: mergedSeo.ogTitle ?? title,
      description: mergedSeo.ogDescription ?? description,
      images: mergedSeo.ogImageUrl ? [mergedSeo.ogImageUrl] : undefined,
    },
    robots:
      mergedSeo.noIndex !== undefined || mergedSeo.noFollow !== undefined
        ? {
            index: !mergedSeo.noIndex,
            follow: !mergedSeo.noFollow,
          }
        : undefined,
    icons: {
      icon: iconUrl,
      shortcut: iconUrl,
      apple: iconUrl,
    },
  };
};
