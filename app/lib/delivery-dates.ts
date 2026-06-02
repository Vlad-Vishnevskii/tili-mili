import type {
  SiteDeliveryDateRange,
  SiteDeliveryTimeInterval,
  SiteSettings,
} from "@/app/lib/site-data";

type DeliveryDateSettings = Pick<
  SiteSettings,
  "deliveryDateSpb" | "deliveryDateMsk"
>;

type DeliveryDateItem = {
  city: "СПб" | "Мск";
  date: string;
};

export type DeliveryRegion = "msk" | "spb";

export type DeliveryDateOption = {
  label: string;
  value: string;
};

export type DeliveryTimeIntervalOption = {
  label: string;
  value: string;
};

const deliveryDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const getStrapiDateParts = (value?: string | null) => {
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

  return { date, day, month, year };
};

export const formatStrapiDate = (value?: string | null) => {
  const parts = getStrapiDateParts(value);

  return parts ? deliveryDateFormatter.format(parts.date) : null;
};

export const formatStrapiDateRange = (
  range?: SiteDeliveryDateRange | null,
) => {
  if (!range) {
    return null;
  }

  const dateFrom = formatStrapiDate(range.dateFrom);
  const dateTo = formatStrapiDate(range.dateTo);

  if (dateFrom && dateTo) {
    return `с ${dateFrom} по ${dateTo}`;
  }

  return dateFrom ?? dateTo;
};

export const getDeliveryDateItems = (
  siteSettings: DeliveryDateSettings,
): DeliveryDateItem[] =>
  [
    {
      city: "Мск",
      date: formatStrapiDateRange(siteSettings.deliveryDateMsk),
    },
    {
      city: "СПб",
      date: formatStrapiDateRange(siteSettings.deliveryDateSpb),
    },
  ].filter((item): item is DeliveryDateItem => Boolean(item.date));

export const getDeliveryDateOptions = (
  range?: SiteDeliveryDateRange | null,
): DeliveryDateOption[] => {
  if (!range) {
    return [];
  }

  const from = getStrapiDateParts(range.dateFrom);
  const to = getStrapiDateParts(range.dateTo);

  if (!from || !to) {
    return [];
  }

  const startDate = from.date <= to.date ? from.date : to.date;
  const endDate = from.date <= to.date ? to.date : from.date;
  const options: DeliveryDateOption[] = [];

  for (
    const date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const value = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    options.push({
      label: deliveryDateFormatter.format(date),
      value,
    });
  }

  return options;
};

const formatTime = (value: string) => {
  const match = /^(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(
    value.trim(),
  );

  return match ? `${match[1]}:${match[2]}` : null;
};

export const getDeliveryTimeIntervalOptions = (
  intervals: SiteDeliveryTimeInterval[],
): DeliveryTimeIntervalOption[] =>
  intervals
    .map((interval) => {
      const timeFrom = formatTime(interval.timeFrom);
      const timeTo = formatTime(interval.timeTo);

      if (!timeFrom || !timeTo) {
        return null;
      }

      return {
        label: `${timeFrom}-${timeTo}`,
        value: `${timeFrom}-${timeTo}`,
      };
    })
    .filter((item): item is DeliveryTimeIntervalOption => item !== null);
