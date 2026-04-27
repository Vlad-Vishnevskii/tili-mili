"use client";

import Link from "next/link";
import Image from "next/image";
import { Flex, Carousel } from "antd";
import { CATEGORY_CARD_COPY, HERO_SLIDES } from "./constants";
import type { CatalogCategory } from "@/app/lib/catalog";
import styles from "./page.module.css";

type HomePageClientProps = {
  categories: CatalogCategory[];
};

export default function HomePageClient({
  categories,
}: HomePageClientProps) {
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

        <div className={styles.categoryList}>
          {categories.map((item) => (
            <Link
              className={styles.categoryItem}
              key={item.id}
              href={item.link}
            >
              <div className={styles.categoryImageWrap}>
                <Image
                  src={item.img}
                  width={220}
                  height={220}
                  alt={item.name}
                />
              </div>
              <div className={styles.categoryBody}>
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
