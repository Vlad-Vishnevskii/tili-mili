"use client";

import Link from "next/link";
import Image from "next/image";
import { Flex, Carousel } from "antd";
import { CATEGORY_CARD_COPY, HERO_SLIDES } from "./constants";
import type { CatalogCategory } from "@/app/lib/catalog";
import type { HomePageData } from "@/app/lib/site-data";
import styles from "./page.module.css";

type HomePageClientProps = {
  categories: CatalogCategory[];
  homePage: HomePageData;
};

type HeroSlideViewModel = {
  id: string;
  title: string;
  text?: string;
  accent?: string;
  meta: string[];
  imageUrl?: string;
  mobileImageUrl?: string;
};

const fallbackSlides: HeroSlideViewModel[] = HERO_SLIDES.map((slide, index) => ({
  id: `fallback-slide-${index + 1}`,
  title: slide.title,
  text: slide.text,
  accent: slide.accent,
  meta: [...slide.meta],
}));

export default function HomePageClient({
  categories,
  homePage,
}: HomePageClientProps) {
  const heroSlides = homePage.heroBanners.length
    ? homePage.heroBanners.map((banner) => ({
        id: banner.id,
        title: banner.title,
        text: banner.text,
        accent: banner.accent,
        meta: banner.meta,
        imageUrl: banner.imageUrl,
        mobileImageUrl: banner.mobileImageUrl,
      }))
    : fallbackSlides;

  return (
    <Flex vertical gap={48} className={styles.home}>
      <Carousel arrows autoplay>
        {heroSlides.map((slide) => (
          <div key={slide.id}>
            <div className={styles.banner}>
              {slide.imageUrl || slide.mobileImageUrl ? (
                <picture className={styles.bannerMedia} aria-hidden="true">
                  {slide.mobileImageUrl ? (
                    <source
                      media="(max-width: 767px)"
                      srcSet={slide.mobileImageUrl}
                    />
                  ) : null}
                  <img
                    src={slide.imageUrl ?? slide.mobileImageUrl}
                    alt=""
                    className={styles.bannerMediaImage}
                  />
                </picture>
              ) : null}
              <div className={styles.bannerGlow} />
              <div className={styles.bannerContent}>
                {slide.accent ? (
                  <span className={styles.bannerAccent}>{slide.accent}</span>
                ) : null}
                <h2>{slide.title}</h2>
                {slide.text ? <p>{slide.text}</p> : null}
                {slide.meta.length ? (
                  <div className={styles.bannerMeta}>
                    {slide.meta.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      <section className={styles.categoriesSection}>
        <div className={styles.sectionHeading}>
          {homePage.promoText ? <span>{homePage.promoText}</span> : null}
          <h2>{homePage.title ?? "Вкусные продукты из деревни с чистым составом"}</h2>
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
