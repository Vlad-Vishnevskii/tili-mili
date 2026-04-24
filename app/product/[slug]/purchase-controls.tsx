"use client";

import { Button } from "antd";
import { useState } from "react";
import { useCart } from "@/app/providers/cart-provider";
import styles from "./styles.module.css";

type PurchaseControlsProps = {
  productId: number;
  unitPrice: number;
  unitName: string;
  unitValue: number;
  packageWeight?: number;
  isOutOfStock?: boolean;
};

const formatWeight = (value: number) => value.toFixed(1).replace(".", ",");

const formatPrice = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));

export const PurchaseControls = ({
  productId,
  unitPrice,
  unitName,
  unitValue,
  packageWeight = 0.3,
  isOutOfStock = false,
}: PurchaseControlsProps) => {
  const [portionCount, setPortionCount] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const { addToCart } = useCart();

  const totalWeight = packageWeight * portionCount;
  const totalPrice = (unitPrice / unitValue) * totalWeight;

  if (isOutOfStock) {
    return (
      <div className={styles.purchaseBlock}>
        <div className={styles.outOfStockCard}>
          <span className={styles.packageLabel}>Нет в наличии</span>
          <strong className={styles.packageWeight}>
            Товар сейчас недоступен
          </strong>
          <span className={styles.outOfStockText}>
            Пока можно посмотреть только описание и характеристики товара.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.purchaseBlock}>
      <div className={styles.purchaseMeta}>
        <div className={styles.packageCard}>
          <span className={styles.packageLabel}>Стандартная упаковка</span>
          <strong className={styles.packageWeight}>
            {formatWeight(packageWeight)} {unitName}
          </strong>
          <span className={styles.packagePrice}>
            {formatPrice(totalPrice)} ₽
          </span>
        </div>

        <div className={styles.counter} aria-label="Количество порций">
          <button
            type="button"
            className={styles.counterButton}
            onClick={() =>
              setPortionCount((current) => Math.max(1, current - 1))
            }
            aria-label="Уменьшить количество"
          >
            -
          </button>

          <div className={styles.counterValue}>
            <strong>{portionCount}</strong>
            <span>
              {formatWeight(totalWeight)} {unitName}
            </span>
          </div>

          <button
            type="button"
            className={styles.counterButton}
            onClick={() => setPortionCount((current) => current + 1)}
            aria-label="Увеличить количество"
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.purchaseActions}>
        <Button
          className={`${styles.buyBtn} ${isAddedToCart ? styles.buyBtnActive : ""}`}
          onClick={() => {
            addToCart({
              productId,
              quantity: portionCount,
              packageWeight,
            });
            setIsAddedToCart(true);
          }}
          aria-pressed={isAddedToCart}
        >
          {isAddedToCart
            ? `Добавлено • ${formatPrice(totalPrice)} ₽`
            : `Добавить • ${formatPrice(totalPrice)} ₽`}
        </Button>
      </div>
    </div>
  );
};
