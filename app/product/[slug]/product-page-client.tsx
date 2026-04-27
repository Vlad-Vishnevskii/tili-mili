import Image from "next/image";
import Link from "next/link";
import { FreezeBadge } from "@/app/components/freeze-badge/freeze-badge";
import type { CatalogProduct } from "@/app/lib/catalog";
import { PurchaseControls } from "./purchase-controls";
import styles from "./styles.module.css";

type ProductPageClientProps = {
  product: CatalogProduct | null;
};

export const ProductPageClient = ({ product }: ProductPageClientProps) => {
  if (!product) {
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
        <Link href={product.category?.link ?? "/"}>Продукция</Link>
        <span>/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <section className={styles.productShell}>
        <div className={styles.galleryCard}>
          <div className={styles.imageWrap}>
            {product.isOutOfStock ? (
              <span className={styles.outOfStockBadge}>Нет в наличии</span>
            ) : null}
            <Image
              src={product.img}
              width={620}
              height={620}
              alt={product.name}
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
            <h1 className={styles.name}>{product.name}</h1>
            {product.freezeLabel ? (
              <FreezeBadge label={product.freezeLabel} />
            ) : null}
          </div>

          <PurchaseControls
            productId={product.id}
            unitPrice={product.price}
            unitName={product.unit.name}
            unitValue={product.unit.value}
            isOutOfStock={product.isOutOfStock}
          />

          <p className={styles.lead}>
            {product.description[0]?.text ??
              "Живой фермерский продукт с понятными характеристиками, который удобно заказать как для повседневного рациона, так и для семейного стола."}
          </p>

          <ul id="description" className={styles.descriptionList}>
            {product.description.map((item) => (
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
