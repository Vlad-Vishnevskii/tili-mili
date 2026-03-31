import { NAV_ITEMS } from "./constants";
import Link from "next/link";
import Image from "next/image";
import { Flex, Carousel } from "antd";
import styles from "./page.module.css";

const HERO_SLIDES = [
  {
    title: "Ближайшие доставки",
    text: "Собираем заказы вручную и привозим фермерские продукты в удобные даты без лишней суеты.",
    meta: ["Москва и область: 25.02.26", "Санкт-Петербург и область: 14.11.26"],
    accent: "Свежие поставки каждую неделю",
  },
  {
    title: "Предложение месяца",
    text: "Выбрали продукты, которые особенно хороши сейчас: с чистым составом, красивой подачей и настоящим деревенским вкусом.",
    meta: ["Наборы к семейному столу", "Сезонные позиции и деликатесы"],
    accent: "Собрано с акцентом на сезон",
  },
  {
    title: "Акции",
    text: "Подбираем выгодные предложения так, чтобы скидка помогала собрать корзину, а не отвлекала от качества продукта.",
    meta: ["Спеццены на категории", "Подарочные варианты к заказу"],
    accent: "Спокойные выгодные покупки",
  },
];

export default function Home() {
  return (
    <Flex vertical gap={48} className={styles.home}>
      <Carousel arrows autoplay>
        {HERO_SLIDES.map((slide) => (
          <div key={slide.title}>
            <div className={styles.banner}>
              <div className={styles.bannerGlow} />
              <div className={styles.bannerContent}>
                <span className={styles.bannerAccent}>{slide.accent}</span>
                <h2>{slide.title}</h2>
                <p>{slide.text}</p>
                <div className={styles.bannerMeta}>
                  {slide.meta.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      <section className={styles.categoriesSection}>
        <div className={styles.sectionHeading}>
          <span>Каталог</span>
          <h2>Выберите категорию продуктов</h2>
          <p>
            От основного семейного заказа до деликатесов, подарочных наборов и
            сезонных позиций для красивого стола.
          </p>
        </div>

        <div className={styles.categoryList}>
          {NAV_ITEMS.map((item, index) => (
            <Link className={styles.categoryItem} key={item.id} href={item.link}>
              <div className={styles.categoryImageWrap}>
                <Image src={item.img} width={220} height={220} alt={item.name} />
              </div>
              <div className={styles.categoryBody}>
                <span className={styles.categoryIndex}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <strong>{item.name}</strong>
                <p>
                  Свежие позиции, аккуратная сборка и честный вкус без лишних
                  компромиссов.
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Flex>
  );
}
