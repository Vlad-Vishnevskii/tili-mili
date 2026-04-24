"use client";

import { Button } from "antd";
import Image from "next/image";
import Link from "next/link";
import { FreezeBadge } from "@/app/components/freeze-badge/freeze-badge";
import { useCategoriesQuery, useProductsQuery } from "@/app/lib/catalog-queries";
import { ProductCardPurchase } from "./product-card-purchase";
import styles from "./styles.module.css";

type CategoryPageClientProps = {
  categorySlug: string;
};

export const CategoryPageClient = ({
  categorySlug,
}: CategoryPageClientProps) => {
  const { data: categories = [], isLoading, isError } = useCategoriesQuery();
  const { data: products = [] } = useProductsQuery();

  const category = categories.find((item) => item.slug === categorySlug);
  const categoryProducts = products.filter(
    (product) => product.category?.id === category?.id,
  );
  const availableProducts = categoryProducts.filter(
    (card) => !card.isOutOfStock,
  );
  const minPrice = categoryProducts.length
    ? Math.min(...categoryProducts.map((product) => product.price))
    : null;

  if (isLoading) {
    return <div className={styles.container}>Загружаем категорию...</div>;
  }

  if (isError || !category) {
    return (
      <div className={styles.container}>
        <div className={styles.categoryDescription}>
          <div className={styles.categoryDescriptionHeader}>
            <span>Категория</span>
            <h2>Категория не найдена</h2>
          </div>
          <div className={styles.categoryDescriptionBody}>
            <p>Проверьте данные в Strapi или выберите другой раздел каталога.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
        <Link href="/">Главная</Link>
        <span>/</span>
        <Link href="/">Продукция</Link>
        <span>/</span>
        <span aria-current="page">{category.name}</span>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.kicker}>Категория</span>
          <h1>{category.name}</h1>
          <p>
            Подобрали позиции с чистым составом, аккуратной разделкой и
            фермерским качеством, чтобы категория выглядела цельно и удобно для
            выбора.
          </p>

          <div className={styles.heroFacts}>
            <div className={styles.factCard}>
              <strong>{availableProducts.length}</strong>
              <span>позиций в наличии</span>
            </div>
            <div className={styles.factCard}>
              <strong>{minPrice ? `от ${minPrice} ₽` : "по запросу"}</strong>
              <span>стартовая цена</span>
            </div>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <Image
            src={category.img}
            width={420}
            height={420}
            alt={category.name}
          />
        </div>
      </section>

      {category.subCategories.length ? (
        <section className={styles.filtersSection}>
          <div className={styles.filtersHeader}>
            <span>Подборка</span>
            <h2>Фильтры внутри категории</h2>
          </div>

          <div className={styles.filters}>
            {category.subCategories.map((item, index) => (
              <Button
                key={item.id}
                className={
                  index === 0 ? styles.filterActive : styles.filterButton
                }
              >
                {item.label}
              </Button>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.catalogSection}>
        <div className={styles.catalogHeader}>
          <div>
            <span>Каталог</span>
            <h2>Товары в разделе {category.name}</h2>
          </div>
        </div>

        <div className={styles.cardList}>
          {categoryProducts.map((card) => (
            <article className={styles.card} key={card.id}>
              <Link href={card.link} className={styles.cardImageWrap}>
                {card.promoLabel ? (
                  <span className={styles.promoBadge}>{card.promoLabel}</span>
                ) : null}

                {card.isOutOfStock ? (
                  <span className={styles.outOfStockBadge}>Нет в наличии</span>
                ) : null}

                {card.freezeLabel ? (
                  <FreezeBadge
                    className={styles.freezeBadge}
                    label={card.freezeLabel}
                  />
                ) : null}
                <Image src={card.img} width={320} height={280} alt={card.name} />
              </Link>

              <div className={styles.cardBody}>
                <span className={styles.cardMeta}>Фермерский продукт</span>
                <h3>
                  <Link href={card.link} className={styles.cardTitleLink}>
                    {card.name}
                  </Link>
                </h3>
                <p>
                  {card.description[0]?.text ??
                    "Свежий продукт с аккуратной подготовкой и понятным составом."}
                </p>

                <div className={styles.cardFooter}>
                  <ProductCardPurchase
                    productId={card.id}
                    productLink={card.link}
                    unitPrice={card.price}
                    unitName={card.unit.name}
                    unitValue={card.unit.value}
                    isOutOfStock={card.isOutOfStock}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {category.categoryDescription.length ? (
        <section className={styles.categoryDescription}>
          <div className={styles.categoryDescriptionHeader}>
            <span>О категории</span>
            <h2>{category.name} от фермы до вашего стола</h2>
          </div>

          <div className={styles.categoryDescriptionBody}>
            {category.categoryDescription.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};
