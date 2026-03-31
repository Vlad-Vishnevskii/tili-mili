import { NAV_ITEMS, PRODUCT_CARDS } from "@/app/constants";
import styles from "./styles.module.css";
import { Button } from "antd";
import Image from "next/image";
import Link from "next/link";

export const generateStaticParams = async () => {
  return NAV_ITEMS.map((cat) => ({
    id: String(cat.id),
  }));
};

type Props = {
  params: Promise<{ id: string }>;
};

const FILTERS = ["Курица", "Субпродукты", "Индейка", "Яйца"];

const CategoryPage = async ({ params }: Props) => {
  const { id } = await params;
  const category =
    NAV_ITEMS.find((item) => String(item.id) === id) ?? NAV_ITEMS[0];

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
              <strong>{PRODUCT_CARDS.length}</strong>
              <span>позиций в наличии</span>
            </div>
            <div className={styles.factCard}>
              <strong>от 910 ₽</strong>
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

      <section className={styles.filtersSection}>
        <div className={styles.filtersHeader}>
          <span>Подборка</span>
          <h2>Фильтры внутри категории</h2>
        </div>

        <div className={styles.filters}>
          {FILTERS.map((item, index) => (
            <Button
              key={item}
              className={
                index === 0 ? styles.filterActive : styles.filterButton
              }
            >
              {item}
            </Button>
          ))}
        </div>
      </section>

      <section className={styles.catalogSection}>
        <div className={styles.catalogHeader}>
          <div>
            <span>Каталог</span>
            <h2>Товары в разделе {category.name}</h2>
          </div>
          {/* <p>
            Все карточки оформлены так, чтобы легче считывались фото, цена и
            переход к подробному описанию.
          </p> */}
        </div>

        <div className={styles.cardList}>
          {PRODUCT_CARDS.map((card) => (
            <article className={styles.card} key={card.id}>
              <Link href={card.link} className={styles.cardImageWrap}>
                <Image
                  src={card.img}
                  width={320}
                  height={280}
                  alt={card.name}
                />
              </Link>

              <div className={styles.cardBody}>
                <span className={styles.cardMeta}>Фермерский продукт</span>
                <h3>{card.name}</h3>
                <p>
                  {card.description[0]?.text ??
                    "Свежий продукт с аккуратной подготовкой и понятным составом."}
                </p>

                <div className={styles.cardFooter}>
                  <div className={styles.priceBlock}>
                    <strong>{card.price} ₽</strong>
                    <span>за {card.unit.name}</span>
                  </div>

                  <Link className={styles.btnLink} href={card.link}>
                    <Button className={styles.buyBtn}>Подробнее</Button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CategoryPage;
