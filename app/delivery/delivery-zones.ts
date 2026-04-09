export type DeliveryZone = {
  id: string;
  name: string;
  intervalLabel: string;
  description: string;
  color: string;
  polygon: [number, number][];
};

export type DeliveryCityMap = {
  id: string;
  label: string;
  title: string;
  searchPrefix: string;
  addressPlaceholder: string;
  center: [number, number];
  zoom: number;
  zones: DeliveryZone[];
};

export const DELIVERY_CITY_MAPS: DeliveryCityMap[] = [
  {
    id: "msk",
    label: "Москва и область",
    title: "Зоны доставки по Москве и Московской области",
    searchPrefix: "Москва",
    addressPlaceholder: "Например, Москва, Ленинский проспект, 30",
    center: [55.751244, 37.618423],
    zoom: 9,
    zones: [
      {
        id: "msk-zone-1",
        name: "Зона 1",
        intervalLabel: "Ежедневно, 10:00-18:00",
        description:
          "Ближняя зона по Москве. Здесь можно показывать собственные интервалы, стоимость и любые пояснения.",
        color: "#607d83",
        polygon: [
          [55.8705, 37.3565],
          [55.8705, 37.7895],
          [55.584, 37.7895],
          [55.584, 37.3565],
        ],
      },
      {
        id: "msk-zone-2",
        name: "Зона 2",
        intervalLabel: "По согласованию, 12:00-21:00",
        description:
          "Расширенная зона вокруг Москвы. Эти координаты стартовые и их удобно заменить на реальные полигоны перевозчика.",
        color: "#d6a652",
        polygon: [
          [56.0205, 37.145],
          [56.0205, 38.0205],
          [55.35, 38.0205],
          [55.35, 37.145],
        ],
      },
    ],
  },
  {
    id: "spb",
    label: "Санкт-Петербург и область",
    title: "Зоны доставки по Санкт-Петербургу и области",
    searchPrefix: "Санкт-Петербург",
    addressPlaceholder: "Например, Санкт-Петербург, Невский проспект, 28",
    center: [59.93863, 30.31413],
    zoom: 9,
    zones: [
      {
        id: "spb-zone-1",
        name: "Зона 1",
        intervalLabel: "Ежедневно, 11:00-19:00",
        description:
          "Городская зона Санкт-Петербурга. Здесь можно хранить свои тексты, стоимость и правила доставки.",
        color: "#607d83",
        polygon: [
          [60.1005, 30.05],
          [60.1005, 30.62],
          [59.78, 30.62],
          [59.78, 30.05],
        ],
      },
      {
        id: "spb-zone-2",
        name: "Зона 2",
        intervalLabel: "По графику, 12:00-22:00",
        description:
          "Расширенная зона Ленинградской области. Контуры здесь тоже стартовые и рассчитаны на последующую замену.",
        color: "#d6a652",
        polygon: [
          [60.23, 29.72],
          [60.23, 31.08],
          [59.55, 31.08],
          [59.55, 29.72],
        ],
      },
    ],
  },
];
