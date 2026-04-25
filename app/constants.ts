const removeTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const DEFAULT_STRAPI_URL = "http://72.56.6.211:1337";

export const STRAPI_URL = removeTrailingSlash(
  process.env.STRAPI_URL ??
    process.env.NEXT_PUBLIC_STRAPI_URL ??
    DEFAULT_STRAPI_URL,
);

export const API_BASE_URL = removeTrailingSlash(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
);

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
