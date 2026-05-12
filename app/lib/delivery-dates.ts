import type { SiteSettings } from "@/app/lib/site-data";

type DeliveryDateSettings = Pick<
  SiteSettings,
  "deliveryDateSpb" | "deliveryDateMsk"
>;

type DeliveryDateItem = {
  city: "СПб" | "МСК";
  date: string;
};

const deliveryDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const formatStrapiDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return deliveryDateFormatter.format(date);
};

export const getDeliveryDateItems = (
  siteSettings: DeliveryDateSettings,
): DeliveryDateItem[] =>
  [
    {
      city: "Мск",
      date: formatStrapiDate(siteSettings.deliveryDateMsk),
    },
    {
      city: "СПб",
      date: formatStrapiDate(siteSettings.deliveryDateSpb),
    },
  ].filter((item): item is DeliveryDateItem => Boolean(item.date));
