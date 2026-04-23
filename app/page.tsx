"use client";

import Link from "next/link";
import Image from "next/image";
import { Flex, Carousel } from "antd";
import { CATEGORY_CARD_COPY, HERO_SLIDES } from "./constants";
import { useCategoriesQuery } from "@/app/lib/catalog-queries";
import styles from "./page.module.css";

export default function Home() {
  const { data: categories = [], isLoading, isError } = useCategoriesQuery();

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
          <h2>Вкусные продукты из деревни с чистым составом</h2>
          <p>
            От основного семейного заказа до деликатесов, подарочных наборов и
            сезонных позиций для красивого стола.
          </p>
        </div>

        {isLoading ? <p>Загружаем категории из Strapi...</p> : null}
        {isError ? <p>Не удалось загрузить категории.</p> : null}

        <div className={styles.categoryList}>
          {categories.map((item, index) => (
            <Link
              className={styles.categoryItem}
              key={item.id}
              href={item.link}
            >
              <div className={styles.categoryImageWrap}>
                <Image src={item.img} width={220} height={220} alt={item.name} />
              </div>
              <div className={styles.categoryBody}>
                <span className={styles.categoryIndex}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <strong>{item.name}</strong>
                <p>{CATEGORY_CARD_COPY}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Flex>
  );
}
