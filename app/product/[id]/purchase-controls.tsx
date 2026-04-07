"use client";

import { Button } from "antd";
import { useState } from "react";
import styles from "./styles.module.css";

type PurchaseControlsProps = {
  unitPrice: number;
  unitName: string;
  unitValue: number;
  packageWeight?: number;
};

const formatWeight = (value: number) => value.toFixed(1).replace(".", ",");

const formatPrice = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));

export const PurchaseControls = ({
  unitPrice,
  unitName,
  unitValue,
  packageWeight = 0.3,
}: PurchaseControlsProps) => {
  const [portionCount, setPortionCount] = useState(1);

  const totalWeight = packageWeight * portionCount;
  const totalPrice = (unitPrice / unitValue) * totalWeight;

  return (
    <div className={styles.purchaseBlock}>
      <div className={styles.purchaseMeta}>
        <div className={styles.packageCard}>
          <span className={styles.packageLabel}>Стандартная упаковка</span>
          <strong className={styles.packageWeight}>
            {formatWeight(packageWeight)} {unitName}
          </strong>
          <span className={styles.packagePrice}>{formatPrice(totalPrice)} ₽</span>
        </div>

        <div className={styles.counter} aria-label="Количество порций">
          <button
            type="button"
            className={styles.counterButton}
            onClick={() => setPortionCount((current) => Math.max(1, current - 1))}
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
        <Button className={styles.buyBtn}>
          Добавить в корзину • {formatPrice(totalPrice)} ₽
        </Button>
      </div>
    </div>
  );
};
