export const CART_STORAGE_KEY = "tili-mili-cart";

export type CartItem = {
  productId: number;
  quantity: number;
  packageWeight: number;
};

export type OrderRequestPayload = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryRegion: string;
  deliveryRegionCode: "msk" | "spb";
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTimeInterval: string;
  comment: string;
  items: Array<{
    productId: number;
    quantity: number;
    packageWeight: number;
  }>;
};
