import { Button } from "antd";
import Image from "next/image";
import Link from "next/link";
import { FreezeBadge } from "@/app/components/freeze-badge/freeze-badge";
import type { CatalogCategory, CatalogProduct } from "@/app/lib/catalog";
import { getDeliveryDateItems } from "@/app/lib/delivery-dates";
import { calculateItemTotal } from "@/app/lib/pricing";
import type { SiteSettings } from "@/app/lib/site-data";
import { ProductCardPurchase } from "./product-card-purchase";
import styles from "./styles.module.css";

type CategoryPageClientProps = {
  category: CatalogCategory | null;
  products: CatalogProduct[];
  selectedSubcategorySlug?: string | null;
  siteSettings: Pick<SiteSettings, "deliveryDateSpb" | "deliveryDateMsk">;
};

const sortProductsByRelationOrder = (
  products: CatalogProduct[],
  productIds: number[],
) => {
  if (!productIds.length) {
    return products;
  }

  const productOrder = new Map(
    productIds.map((productId, index) => [productId, index]),
  );

  return [...products].sort((left, right) => {
    const leftOrder = productOrder.get(left.id);
    const rightOrder = productOrder.get(right.id);

    if (leftOrder !== undefined && rightOrder !== undefined) {
      return leftOrder - rightOrder;
    }

    if (leftOrder !== undefined) {
      return -1;
    }

    if (rightOrder !== undefined) {
      return 1;
    }

    return 0;
  });
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));

export const CategoryPageClient = ({
  category,
  products,
  selectedSubcategorySlug,
  siteSettings,
}: CategoryPageClientProps) => {
  const selectedSubcategory = selectedSubcategorySlug
    ? (category?.subCategories.find(
        (item) => item.slug === selectedSubcategorySlug,
      ) ?? null)
    : null;
  const relationProductIds = selectedSubcategory?.productIds.length
    ? selectedSubcategory.productIds
    : (category?.productIds ?? []);
  const categoryProducts = sortProductsByRelationOrder(
    products.filter((product) => {
      if (selectedSubcategory?.productIds.length) {
        return selectedSubcategory.productIds.includes(product.id);
      }

      if (selectedSubcategory) {
        if (product.category?.id !== category?.id) {
          return false;
        }

        return product.subcategories.some(
          (item) => item.slug === selectedSubcategory.slug,
        );
      }

      if (category?.productIds.length) {
        return category.productIds.includes(product.id);
      }

      return product.category?.id === category?.id;
    }),
    relationProductIds,
  );
  const availableProducts = categoryProducts.filter(
    (card) => !card.isOutOfStock,
  );
  const minPrice = categoryProducts.length
    ? Math.min(
        ...categoryProducts.map((product) =>
          calculateItemTotal({
            packageWeight: product.unit.value,
            quantity: 1,
            unitName: product.unit.name,
            unitPrice: product.price,
          }),
        ),
      )
    : null;
  const deliveryDates = getDeliveryDateItems(siteSettings);

  if (!category) {
    return (
      <div className={styles.container}>
        <div className={styles.categoryDescription}>
          <div className={styles.categoryDescriptionHeader}>
            <span>Категория</span>
            <h2>Категория не найдена</h2>
          </div>
          <div className={styles.categoryDescriptionBody}>
            <p>
              Проверьте данные в Strapi или выберите другой раздел каталога.
            </p>
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
        {selectedSubcategory ? (
          <>
            <Link href={category.link}>{category.name}</Link>
            <span>/</span>
            <span aria-current="page">{selectedSubcategory.name}</span>
          </>
        ) : (
          <span aria-current="page">{category.name}</span>
        )}
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
              <strong>
                {minPrice ? `от ${formatPrice(minPrice)} ₽` : "по запросу"}
              </strong>
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
            {category.subCategories.map((item, index) => {
              const isActive = selectedSubcategory
                ? selectedSubcategory.id === item.id
                : index === 0;

              return (
                <Button
                  key={item.id}
                  href={item.link}
                  className={
                    isActive ? styles.filterActive : styles.filterButton
                  }
                >
                  {item.label}
                </Button>
              );
            })}
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
                {card.promoLabel || card.dietLabel ? (
                  <div className={styles.imageBadgeStack}>
                    {card.promoLabel ? (
                      <span className={styles.promoBadge}>
                        {card.promoLabel}
                      </span>
                    ) : null}

                    {card.dietLabel ? (
                      <span className={styles.dietBadge}>{card.dietLabel}</span>
                    ) : null}
                  </div>
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
                <Image
                  src={card.img}
                  width={320}
                  height={280}
                  alt={card.name}
                />
              </Link>

              <div className={styles.cardBody}>
                {deliveryDates.length ? (
                  <div className={styles.deliveryDates}>
                    {deliveryDates.map((item) => (
                      <span
                        key={item.region}
                        className={`${styles.deliveryDate} ${
                          item.region === "msk"
                            ? styles.deliveryDateMsk
                            : styles.deliveryDateSpb
                        }`}
                      >
                        {item.city}: {item.date}
                      </span>
                    ))}
                  </div>
                ) : null}

                {/* <span className={styles.cardMeta}>Фермерский продукт</span> */}

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
