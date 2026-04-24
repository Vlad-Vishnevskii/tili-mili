"use client";

import Image from "next/image";
import Link from "next/link";
import { FreezeBadge } from "@/app/components/freeze-badge/freeze-badge";
import { useProductsQuery } from "@/app/lib/catalog-queries";
import { PurchaseControls } from "./purchase-controls";
import styles from "./styles.module.css";

type ProductPageClientProps = {
  productSlug: string;
};

export const ProductPageClient = ({ productSlug }: ProductPageClientProps) => {
  const { data: products = [], isLoading, isError } = useProductsQuery();
  const currentProduct = products.find((item) => item.slug === productSlug);

  if (isLoading) {
    return <div className={styles.container}>Загружаем товар...</div>;
  }

  if (isError || !currentProduct) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <p>Продукт не найден</p>
          <Link href="/">Вернуться на главную</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
        <Link href="/">Главная</Link>
        <span>/</span>
        <Link href={currentProduct.category?.link ?? "/"}>Продукция</Link>
        <span>/</span>
        <span aria-current="page">{currentProduct.name}</span>
      </nav>

      <section className={styles.productShell}>
        <div className={styles.galleryCard}>
          <div className={styles.imageWrap}>
            {currentProduct.isOutOfStock ? (
              <span className={styles.outOfStockBadge}>Нет в наличии</span>
            ) : null}
            <Image
              src={currentProduct.img}
              width={620}
              height={620}
              alt={currentProduct.name}
            />
          </div>

          <div className={styles.imageNote}>
            <span>Фермерский продукт</span>
            <p>
              Аккуратная подготовка, натуральный состав и бережная упаковка.
            </p>
          </div>
        </div>

        <div className={styles.infoCard}>
          <span className={styles.kicker}>Карточка товара</span>
          <div className={styles.titleBlock}>
            <h1 className={styles.name}>{currentProduct.name}</h1>
            {currentProduct.freezeLabel ? (
              <FreezeBadge label={currentProduct.freezeLabel} />
            ) : null}
          </div>

          <PurchaseControls
            productId={currentProduct.id}
            unitPrice={currentProduct.price}
            unitName={currentProduct.unit.name}
            unitValue={currentProduct.unit.value}
            isOutOfStock={currentProduct.isOutOfStock}
          />

          <p className={styles.lead}>
            {currentProduct.description[0]?.text ??
              "Живой фермерский продукт с понятными характеристиками, который удобно заказать как для повседневного рациона, так и для семейного стола."}
          </p>

          <ul id="description" className={styles.descriptionList}>
            {currentProduct.description.map((item) => (
              <li key={item.name} className={styles.descriptionItem}>
                <strong>{item.name}</strong>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <Link href="/delivery" className={styles.secondaryLink}>
              Условия доставки
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
