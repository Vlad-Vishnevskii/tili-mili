import type { Metadata } from "next";
import {
  getAppIconPath,
  MANIFEST_PATH,
  STRAPI_DELIVERY_PAGE_PATH,
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

export type SiteDeliveryDateRange = {
  dateFrom: string;
  dateTo: string;
};

export type SiteDeliveryTimeInterval = {
  timeFrom: string;
  timeTo: string;
};

export type SiteSettings = {
  siteName: string;
  siteDescription: string;
  faviconUrl: string | null;
  appIconUrl: string | null;
  defaultSeo: SiteSeo;
  contacts: SiteContacts | null;
  socialLinks: SiteSocialLink[];
  promoText?: string;
  deliveryDateSpb: SiteDeliveryDateRange | null;
  deliveryDateMsk: SiteDeliveryDateRange | null;
  deliveryTimeIntervalsSpb: SiteDeliveryTimeInterval[];
  deliveryTimeIntervalsMsk: SiteDeliveryTimeInterval[];
};

export type HomeHeroButton = {
  id: string;
  text: string;
  link: string;
};

export type HomeHeroBanner = {
  id: string;
  title: string;
  text?: string;
  accent?: string;
  meta: string[];
  imageUrl?: string;
  mobileImageUrl?: string;
  blurBackground: boolean;
  buttons: HomeHeroButton[];
  isActive: boolean;
};

export type HomePageData = {
  title?: string;
  slug?: string;
  seo: SiteSeo;
  heroBanners: HomeHeroBanner[];
  promoText?: string;
};

export type DeliveryHero = {
  kicker: string;
  title: string;
  text: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  noteTitle: string;
  noteText: string;
};

export type DeliveryZone = {
  title: string;
  description: string;
  details: string[];
};

export type DeliveryListSection = {
  kicker: string;
  title: string;
  items: string[];
  listType: "ordered" | "unordered";
};

export type DeliveryContactSection = {
  kicker: string;
  title: string;
  text: string;
  useSiteSettingsContacts: boolean;
  fallbackPhone?: string;
  fallbackEmail?: string;
};

export type DeliveryPageData = {
  seo: SiteSeo;
  hero: DeliveryHero;
  zonesSectionKicker: string;
  zonesSectionTitle: string;
  deliveryZones: DeliveryZone[];
  orderSection: DeliveryListSection;
  paymentSection: DeliveryListSection;
  importantSectionKicker: string;
  importantSectionTitle: string;
  importantItems: string[];
  contactSection: DeliveryContactSection;
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

const unwrapComponent = (value: unknown): UnknownRecord | null =>
  extractSingleType(value) ?? unwrapEntry(value);

const extractStringList = (value: unknown): string[] => {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return [];
    }

    if (trimmedValue.startsWith("[") || trimmedValue.startsWith("{")) {
      try {
        return extractStringList(JSON.parse(trimmedValue) as unknown);
      } catch {
        return [trimmedValue];
      }
    }

    return [trimmedValue];
  }

  if (isRecord(value)) {
    return Object.values(value)
      .flatMap((item) => extractStringList(item))
      .filter(Boolean);
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

const extractArrayEntries = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  return isRecord(value) && Array.isArray(value.data) ? value.data : [];
};

const extractPlainText = (value: unknown): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return undefined;
    }

    if (trimmedValue.startsWith("[") || trimmedValue.startsWith("{")) {
      try {
        return extractPlainText(JSON.parse(trimmedValue) as unknown);
      } catch {
        return trimmedValue;
      }
    }

    return trimmedValue;
  }

  if (Array.isArray(value)) {
    const text = value
      .map((item) => extractPlainText(item))
      .filter((item): item is string => Boolean(item))
      .join("\n")
      .trim();

    return text || undefined;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const directText =
    getString(value.text) ?? getString(value.value) ?? getString(value.label);

  if (directText) {
    return directText;
  }

  return extractPlainText(value.children) ?? extractPlainText(value.content);
};

const normalizeHeroButtons = (
  value: unknown,
  fallback: UnknownRecord,
): HomeHeroButton[] => {
  const entries = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.data)
      ? value.data
      : [];

  const buttons = entries
    .map((item, index): HomeHeroButton | null => {
      const entry = unwrapEntry(item);

      if (!entry) {
        return null;
      }

      const text =
        getString(entry.text) ??
        getString(entry.label) ??
        getString(entry.title) ??
        getString(entry.buttonText);
      const link =
        getString(entry.link) ??
        getString(entry.href) ??
        getString(entry.url) ??
        getString(entry.buttonLink);

      if (!text || !link) {
        return null;
      }

      return {
        id:
          getString(entry.documentId) ??
          String(entry.id ?? `${slugify(text)}-${index + 1}`),
        text,
        link,
      };
    })
    .filter((item): item is HomeHeroButton => item !== null);

  if (buttons.length) {
    return buttons;
  }

  const text = getString(fallback.buttonText);
  const link = getString(fallback.buttonLink);

  return text && link
    ? [
        {
          id: "legacy-button",
          text,
          link,
        },
      ]
    : [];
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

const normalizeDeliveryDateRange = (
  value: unknown,
): SiteDeliveryDateRange | null => {
  const entry = extractSingleType(value) ?? unwrapEntry(value);

  if (!entry) {
    return null;
  }

  const dateFrom = getString(entry.dateFrom);
  const dateTo = getString(entry.dateTo);

  return dateFrom && dateTo ? { dateFrom, dateTo } : null;
};

const normalizeDeliveryTimeIntervals = (
  value: unknown,
): SiteDeliveryTimeInterval[] => {
  const entries = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.data)
      ? value.data
      : [];

  if (!entries.length) {
    return [];
  }

  return entries
    .map((item) => {
      const entry = unwrapEntry(item);

      if (!entry) {
        return null;
      }

      const timeFrom = getString(entry.timeFrom);
      const timeTo = getString(entry.timeTo);

      return timeFrom && timeTo ? { timeFrom, timeTo } : null;
    })
    .filter((item): item is SiteDeliveryTimeInterval => item !== null);
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
        text:
          getString(item.text) ??
          getString(item.subtitle) ??
          getString(item.description),
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
        blurBackground: getBoolean(item.blurBackground) ?? true,
        buttons: normalizeHeroButtons(item.buttons, item),
        isActive: getBoolean(item.isActive) ?? true,
      };
    })
    .filter((item): item is HomeHeroBanner => item !== null);

  return banners.filter((item) => item.isActive);
};

const normalizeDeliveryHero = (
  value: unknown,
  fallback: DeliveryHero,
): DeliveryHero => {
  const entry = unwrapComponent(value);

  if (!entry) {
    return fallback;
  }

  return {
    kicker: extractPlainText(entry.kicker) ?? fallback.kicker,
    title: extractPlainText(entry.title) ?? fallback.title,
    text: extractPlainText(entry.text) ?? fallback.text,
    primaryButtonText:
      extractPlainText(entry.primaryButtonText) ?? fallback.primaryButtonText,
    primaryButtonLink:
      getString(entry.primaryButtonLink) ?? fallback.primaryButtonLink,
    secondaryButtonText:
      extractPlainText(entry.secondaryButtonText) ??
      fallback.secondaryButtonText,
    secondaryButtonLink:
      getString(entry.secondaryButtonLink) ?? fallback.secondaryButtonLink,
    noteTitle: extractPlainText(entry.noteTitle) ?? fallback.noteTitle,
    noteText: extractPlainText(entry.noteText) ?? fallback.noteText,
  };
};

const normalizeDeliveryZones = (
  value: unknown,
  fallback: DeliveryZone[],
): DeliveryZone[] => {
  const zones = extractArrayEntries(value)
    .map((item): DeliveryZone | null => {
      const entry = unwrapEntry(item);

      if (!entry) {
        return null;
      }

      const title = extractPlainText(entry.title);
      const description = extractPlainText(entry.description);

      if (!title || !description) {
        return null;
      }

      return {
        title,
        description,
        details: extractStringList(entry.details),
      };
    })
    .filter((item): item is DeliveryZone => item !== null);

  return zones.length ? zones : fallback;
};

const normalizeDeliveryListSection = (
  value: unknown,
  fallback: DeliveryListSection,
): DeliveryListSection => {
  const entry = unwrapComponent(value);

  if (!entry) {
    return fallback;
  }

  const listType = getString(entry.listType);
  const items = extractStringList(entry.items);

  return {
    kicker: extractPlainText(entry.kicker) ?? fallback.kicker,
    title: extractPlainText(entry.title) ?? fallback.title,
    items: items.length ? items : fallback.items,
    listType:
      listType === "ordered" || listType === "unordered"
        ? listType
        : fallback.listType,
  };
};

const normalizeImportantItems = (
  value: unknown,
  fallback: string[],
): string[] => {
  const entries = extractArrayEntries(value);
  const items = entries.length
    ? entries
        .map((item) => {
          const entry = unwrapEntry(item);

          return entry
            ? extractPlainText(entry.text) ?? extractPlainText(entry.value)
            : extractPlainText(item);
        })
        .filter((item): item is string => Boolean(item))
    : extractStringList(value);

  return items.length ? items : fallback;
};

const normalizeDeliveryContactSection = (
  value: unknown,
  fallback: DeliveryContactSection,
): DeliveryContactSection => {
  const entry = unwrapComponent(value);

  if (!entry) {
    return fallback;
  }

  return {
    kicker: extractPlainText(entry.kicker) ?? fallback.kicker,
    title: extractPlainText(entry.title) ?? fallback.title,
    text: extractPlainText(entry.text) ?? fallback.text,
    useSiteSettingsContacts:
      getBoolean(entry.useSiteSettingsContacts) ??
      fallback.useSiteSettingsContacts,
    fallbackPhone: getString(entry.fallbackPhone) ?? fallback.fallbackPhone,
    fallbackEmail: getString(entry.fallbackEmail) ?? fallback.fallbackEmail,
  };
};

const getFallbackDeliveryPage = (): DeliveryPageData => ({
  seo: {
    title: "Доставка | TILI-MILI",
    description:
      "Условия доставки фермерских продуктов TILI-MILI по Москве, Московской области, Санкт-Петербургу и Ленинградской области.",
  },
  hero: {
    kicker: "Доставка фермерских продуктов",
    title: "Привозим свежие деревенские продукты домой в удобное время",
    text: "Мы сохраняем аккуратную доставку, бережную упаковку и живое подтверждение каждого заказа без автоматических сюрпризов.",
    primaryButtonText: "Перейти в каталог",
    primaryButtonLink: "/",
    secondaryButtonText: "Позвонить менеджеру",
    secondaryButtonLink: "tel:+79163672825",
    noteTitle: "Как мы работаем",
    noteText:
      "После оформления заказа мы всегда подтверждаем наличие товаров, итоговую стоимость и ближайшую дату доставки лично.",
  },
  zonesSectionKicker: "География доставки",
  zonesSectionTitle: "Доставляем по основным направлениям",
  deliveryZones: [
    {
      title: "Москва и Московская область",
      description:
        "Доставляем заказы курьером в согласованный день и удобный временной интервал. После оформления обязательно связываемся для подтверждения состава и адреса.",
      details: [
        "Бережно упаковываем охлажденные и замороженные продукты.",
        "Уточняем стоимость доставки по адресу при подтверждении заказа.",
        "Сообщаем дату ближайшего выезда заранее.",
      ],
    },
    {
      title: "Санкт-Петербург и Ленинградская область",
      description:
        "Отправляем сборные доставки по графику. Если вы оформляете заказ заранее, мы резервируем позиции и подтверждаем дату отправки отдельно.",
      details: [
        "Доставка выполняется в согласованный день.",
        "Перед отправкой менеджер подтверждает наличие и итоговую сумму.",
        "Для удаленных адресов время и стоимость согласовываются индивидуально.",
      ],
    },
  ],
  orderSection: {
    kicker: "Оформление",
    title: "Как проходит заказ",
    listType: "ordered",
    items: [
      "Выберите товары в каталоге и оформите заказ на сайте.",
      "Мы свяжемся с вами, подтвердим наличие, адрес и удобное время.",
      "Соберем заказ, бережно упакуем продукты и передадим в доставку.",
      "В день доставки напомним о заказе и передадим актуальный статус.",
    ],
  },
  paymentSection: {
    kicker: "Оплата",
    title: "Условия оплаты",
    listType: "unordered",
    items: [
      "Наличными или переводом при получении, если это согласовано при подтверждении заказа.",
      "Предоплатой для крупных, праздничных и индивидуально собранных заказов.",
      "Итоговая сумма может корректироваться для весовых позиций после фактической сборки.",
    ],
  },
  importantSectionKicker: "Важно знать",
  importantSectionTitle: "Несколько деталей перед оформлением",
  importantItems: [
    "Минимальную сумму заказа и стоимость доставки уточняем при подтверждении, так как они зависят от направления и объема корзины.",
    "Если какого-то товара не оказалось в наличии, мы заранее предложим замену и ничего не добавим без вашего согласия.",
    "Просим проверять заказ при получении, чтобы мы сразу помогли решить любой вопрос.",
  ],
  contactSection: {
    kicker: "Есть вопросы?",
    title: "Поможем подобрать доставку под ваш адрес",
    text: "Если вы оформляете заказ впервые или хотите уточнить условия по конкретному району, свяжитесь с нами, и мы быстро сориентируем по срокам.",
    useSiteSettingsContacts: true,
    fallbackPhone: "+7 (916) 367-28-25",
    fallbackEmail: "info@tili-mili.ru",
  },
});

const normalizeDeliveryPage = (payload: UnknownRecord): DeliveryPageData => {
  const fallback = getFallbackDeliveryPage();

  return {
    seo: normalizeSeo(payload.seo),
    hero: normalizeDeliveryHero(payload.hero, fallback.hero),
    zonesSectionKicker:
      extractPlainText(payload.zonesSectionKicker) ??
      fallback.zonesSectionKicker,
    zonesSectionTitle:
      extractPlainText(payload.zonesSectionTitle) ??
      fallback.zonesSectionTitle,
    deliveryZones: normalizeDeliveryZones(
      payload.deliveryZones,
      fallback.deliveryZones,
    ),
    orderSection: normalizeDeliveryListSection(
      payload.orderSection,
      fallback.orderSection,
    ),
    paymentSection: normalizeDeliveryListSection(
      payload.paymentSection,
      fallback.paymentSection,
    ),
    importantSectionKicker:
      extractPlainText(payload.importantSectionKicker) ??
      fallback.importantSectionKicker,
    importantSectionTitle:
      extractPlainText(payload.importantSectionTitle) ??
      fallback.importantSectionTitle,
    importantItems: normalizeImportantItems(
      payload.importantItems,
      fallback.importantItems,
    ),
    contactSection: normalizeDeliveryContactSection(
      payload.contactSection,
      fallback.contactSection,
    ),
  };
};

const getFallbackSiteSettings = (): SiteSettings => ({
  siteName: DEFAULT_SITE_NAME,
  siteDescription: DEFAULT_SITE_DESCRIPTION,
  faviconUrl: DEFAULT_FAVICON,
  appIconUrl: DEFAULT_FAVICON,
  defaultSeo: {
    title: DEFAULT_SITE_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
  },
  contacts: null,
  socialLinks: [],
  deliveryDateSpb: null,
  deliveryDateMsk: null,
  deliveryTimeIntervalsSpb: [],
  deliveryTimeIntervalsMsk: [],
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
    const faviconUrl = extractMediaUrl(payload.favicon) ?? fallback.faviconUrl;

    return {
      siteName: getString(payload.siteName) ?? fallback.siteName,
      siteDescription:
        getString(payload.siteDescription) ?? fallback.siteDescription,
      faviconUrl,
      appIconUrl:
        extractMediaUrl(payload.appIcon) ??
        extractMediaUrl(payload.pwaIcon) ??
        extractMediaUrl(payload.homeScreenIcon) ??
        extractMediaUrl(payload.appleTouchIcon) ??
        faviconUrl,
      defaultSeo: normalizeSeo(payload.defaultSeo),
      contacts: normalizeContacts(payload.contacts),
      socialLinks: normalizeSocialLinks(payload.socialLinks),
      promoText: getString(payload.promoText),
      deliveryDateSpb: normalizeDeliveryDateRange(payload.deliveryDateSpb),
      deliveryDateMsk: normalizeDeliveryDateRange(payload.deliveryDateMsk),
      deliveryTimeIntervalsSpb: normalizeDeliveryTimeIntervals(
        payload.deliveryTimeIntervalsSpb,
      ),
      deliveryTimeIntervalsMsk: normalizeDeliveryTimeIntervals(
        payload.deliveryTimeIntervalsMsk,
      ),
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

export const getDeliveryPage = async (): Promise<DeliveryPageData> => {
  try {
    const payload = await fetchStrapiSingle(STRAPI_DELIVERY_PAGE_PATH);

    if (!payload) {
      return getFallbackDeliveryPage();
    }

    return normalizeDeliveryPage(payload);
  } catch {
    return getFallbackDeliveryPage();
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
    applicationName: siteName ?? DEFAULT_SITE_NAME,
    title,
    description,
    keywords: mergedSeo.keywords,
    manifest: MANIFEST_PATH,
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
    appleWebApp: {
      capable: true,
      title: siteName ?? title,
      statusBarStyle: "default",
    },
    icons: {
      icon: iconUrl,
      shortcut: iconUrl,
      apple: [
        {
          url: getAppIconPath(180),
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
  };
};
