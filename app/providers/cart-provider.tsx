"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CART_STORAGE_KEY, type CartItem } from "@/app/lib/cart";

type CartContextValue = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  updateCartItemQuantity: (productId: number, nextQuantity: number) => void;
  removeCartItem: (productId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const isCartItem = (value: unknown): value is CartItem => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<CartItem>;

  return (
    typeof candidate.productId === "number" &&
    typeof candidate.quantity === "number" &&
    candidate.quantity > 0 &&
    typeof candidate.packageWeight === "number" &&
    candidate.packageWeight > 0
  );
};

const readStoredCart = (): CartItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(isCartItem);
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(readStoredCart);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const value = useMemo<CartContextValue>(
    () => ({
      cartItems,
      addToCart: (item) => {
        setCartItems((current) => {
          const existingItem = current.find(
            (cartItem) => cartItem.productId === item.productId,
          );

          if (!existingItem) {
            return [...current, item];
          }

          return current.map((cartItem) =>
            cartItem.productId === item.productId
              ? {
                  ...cartItem,
                  quantity: cartItem.quantity + item.quantity,
                  packageWeight: item.packageWeight,
                }
              : cartItem,
          );
        });
      },
      updateCartItemQuantity: (productId, nextQuantity) => {
        setCartItems((current) =>
          current
            .map((item) =>
              item.productId === productId
                ? { ...item, quantity: nextQuantity }
                : item,
            )
            .filter((item) => item.quantity > 0),
        );
      },
      removeCartItem: (productId) => {
        setCartItems((current) =>
          current.filter((item) => item.productId !== productId),
        );
      },
      clearCart: () => {
        setCartItems([]);
      },
    }),
    [cartItems],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
};
