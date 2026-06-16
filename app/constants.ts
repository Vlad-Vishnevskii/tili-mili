const removeTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const DEFAULT_STRAPI_URL = "https://api.tili-mili.ru";
const DEFAULT_SITE_URL = "https://tili-mili.ru";

export const STRAPI_URL = removeTrailingSlash(
  process.env.STRAPI_URL ??
    process.env.NEXT_PUBLIC_STRAPI_URL ??
    DEFAULT_STRAPI_URL,
);

export const SITE_URL = removeTrailingSlash(
  process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL,
);

export const STRAPI_SITE_SETTINGS_PATH = "/api/site-setting?populate=*";

export const STRAPI_DELIVERY_PAGE_PATH = "/api/delivery-page";

export const STRAPI_HOME_PAGE_PATH =
  "/api/home-page?populate[seo][populate]=*&populate[heroBanners][populate][image]=true&populate[heroBanners][populate][mobileImage]=true&populate[heroBanners][populate][buttons]=true";

export const STRAPI_CATEGORIES_PATH =
  "/api/categories?populate[image]=true&populate[seo]=true&populate[descriptionBlocks]=true&populate[products]=true&populate[subcategories][populate][products]=true&sort=sortOrder:asc";

export const STRAPI_PRODUCTS_PATH = "/api/products?populate=*";

export const API_BASE_URL = removeTrailingSlash(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
);

export const APP_ICON_PATH = "/app-icon";

export const getAppIconPath = (size: 180 | 192 | 512) =>
  `${APP_ICON_PATH}?size=${size}`;

export const MANIFEST_PATH = "/manifest.webmanifest";

export const QUERY_STALE_TIME = 1000 * 60 * 5;

export const HERO_SLIDES = [
  {
    title: "Ближайшие доставки",
    text: "Собираем заказы вручную и привозим фермерские продукты в удобные даты без лишней суеты.",
    meta: ["Москва и область: 25.02.26", "Санкт-Петербург и область: 14.11.26"],
    accent: "Свежие поставки каждую неделю",
  },
  {
    title: "Предложение месяца",
    text: "Выбрали продукты, которые особенно хороши сейчас: с чистым составом, красивой подачей и настоящим деревенским вкусом.",
    meta: ["Наборы к семейному столу", "Сезонные позиции и деликатесы"],
    accent: "Собрано с акцентом на сезон",
  },
  {
    title: "Акции",
    text: "Подбираем выгодные предложения так, чтобы скидка помогала собрать корзину, а не отвлекала от качества продукта.",
    meta: ["Спеццены на категории", "Подарочные варианты к заказу"],
    accent: "Спокойные выгодные покупки",
  },
] as const;

export const CATEGORY_CARD_COPY =
  "Свежие позиции, аккуратная сборка и честный вкус без лишних компромиссов.";

export const DEFAULT_CATEGORY_IMAGE = "/eggs.jpg";
export const DEFAULT_PRODUCT_IMAGE = "/delicates-1.jpg";

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  "ptica-myaso": "/bird.jpg",
  polufabrikaty: "/polyfabricat.jpg",
  marinady: "/marinad.jpg",
  "myasnye-delikatesy": "/delicates-1.jpg",
  "molochnaya-produkciya-yajca": "/eggs.jpg",
  syry: "/eggs.jpg",
  "podarochnye-nabory": "/delicates-1.jpg",
  konservaciya: "/marinad.jpg",
};

export const PRODUCT_FALLBACK_IMAGES: Record<string, string> = {
  "file-bedra-indejki": "/delicates-1.jpg",
  "bedro-cyplenka-brojlera": "/bird.jpg",
  "domashnie-kotlety": "/polyfabricat.jpg",
  "marinad-dlya-kuricy": "/marinad.jpg",
  "kopchenyj-rulet": "/delicates-1.jpg",
  "yajca-fermerskie": "/eggs.jpg",
  "syr-vyderzhannyj": "/eggs.jpg",
  "tushenka-domashnyaya": "/marinad.jpg",
};
