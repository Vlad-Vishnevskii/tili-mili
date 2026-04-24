export const CART_STORAGE_KEY = "tili-mili-cart";

export type CartItem = {
  productId: number;
  quantity: number;
  packageWeight: number;
};

export type OrderRequestPayload = {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  comment: string;
  items: Array<{
    productId: number;
    quantity: number;
    packageWeight: number;
  }>;
};
