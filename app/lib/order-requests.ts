import { STRAPI_URL } from "@/app/constants";
import type { OrderRequestPayload } from "@/app/lib/cart";

type OrderRequestResponse = {
  success?: boolean;
  orderNumber?: string;
  id?: number | string;
  message?: string;
  error?: {
    message?: string;
  };
};

export const createOrderRequest = async (payload: OrderRequestPayload) => {
  const response = await fetch(`${STRAPI_URL}/api/order-requests`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as
    | OrderRequestResponse
    | null;

  if (!response.ok) {
    throw new Error(
      data?.error?.message ??
        data?.message ??
        "Не удалось отправить заявку. Попробуйте еще раз.",
    );
  }

  return data;
};
