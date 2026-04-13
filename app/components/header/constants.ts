export const HEADER_IMG_PATHS = {
  LOGO: "/logo.png",
};

export const MOCK_CART_ITEMS = [
  {
    productId: 0,
    quantity: 2,
    packageWeight: 0.5,
  },
  {
    productId: 1,
    quantity: 1,
    packageWeight: 0.3,
  },
  {
    productId: 3,
    quantity: 1,
    packageWeight: 0.2,
  },
] as const;

export const FREE_DELIVERY_THRESHOLD = 3900;
