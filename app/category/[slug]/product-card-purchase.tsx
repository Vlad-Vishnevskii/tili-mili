"use client";

import { Button } from "antd";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/app/providers/cart-provider";
import styles from "./styles.module.css";

type ProductCardPurchaseProps = {
  productId: number;
  productLink: string;
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

export const ProductCardPurchase = ({
  productId,
  productLink,
  unitPrice,
  unitName,
  unitValue,
  packageWeight = 0.3,
  isOutOfStock = false,
}: ProductCardPurchaseProps) => {
  const [portionCount, setPortionCount] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const { addToCart } = useCart();

  const totalWeight = packageWeight * portionCount;
  const totalPrice = (unitPrice / unitValue) * totalWeight;

  if (isOutOfStock) {
    return (
      <div className={styles.cardPurchase}>
        <div className={styles.cardPurchaseInfo}>
          <span className={styles.cardPurchaseLabel}>Нет в наличии</span>
          <strong>Товар временно недоступен</strong>
          <span className={styles.cardPurchasePrice}>
            Можно посмотреть описание
          </span>
        </div>

        <Link href={productLink} className={styles.detailsLink}>
          Подробнее
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.cardPurchase}>
      <div className={styles.cardPurchaseTop}>
        <div className={styles.cardPurchaseInfo}>
          <span className={styles.cardPurchaseLabel}>Стандарт</span>
          <strong>
            {formatWeight(totalWeight)} {unitName}
          </strong>
          <span className={styles.cardPurchasePrice}>
            {formatPrice(totalPrice)} ₽
          </span>
        </div>

        <div className={styles.cardCounter} aria-label="Количество порций">
          <button
            type="button"
            className={styles.cardCounterButton}
            onClick={() =>
              setPortionCount((current) => Math.max(1, current - 1))
            }
            aria-label="Уменьшить количество"
          >
            -
          </button>

          <span className={styles.cardCounterValue}>{portionCount}</span>

          <button
            type="button"
            className={styles.cardCounterButton}
            onClick={() => setPortionCount((current) => current + 1)}
            aria-label="Увеличить количество"
          >
            +
          </button>
        </div>
      </div>

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
  );
};
