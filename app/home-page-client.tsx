"use client";

import Link from "next/link";
import Image from "next/image";
import classnames from "classnames";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Flex } from "antd";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { CATEGORY_CARD_COPY, HERO_SLIDES } from "./constants";
import type { CatalogCategory } from "@/app/lib/catalog";
import { getDeliveryDateItems } from "@/app/lib/delivery-dates";
import type { HomePageData, SiteSettings } from "@/app/lib/site-data";
import styles from "./page.module.css";

type HomePageClientProps = {
  categories: CatalogCategory[];
  homePage: HomePageData;
  siteSettings: Pick<SiteSettings, "deliveryDateSpb" | "deliveryDateMsk">;
};

type HeroButtonViewModel = {
  id: string;
  text: string;
  link: string;
};

type HeroSlideViewModel = {
  id: string;
  title: string;
  text?: string;
  accent?: string;
  meta: string[];
  imageUrl?: string;
  mobileImageUrl?: string;
  blurBackground: boolean;
  buttons: HeroButtonViewModel[];
};

const fallbackSlides: HeroSlideViewModel[] = HERO_SLIDES.map((slide, index) => ({
  id: `fallback-slide-${index + 1}`,
  title: slide.title,
  text: slide.text,
  accent: slide.accent,
  meta: [...slide.meta],
  blurBackground: true,
  buttons: [],
}));

const isInternalHref = (href: string) => href.startsWith("/") && !href.startsWith("//");

const isExternalHref = (href: string) => /^(https?:)?\/\//i.test(href);

export default function HomePageClient({
  categories,
  homePage,
  siteSettings,
}: HomePageClientProps) {
  const deliveryDates = getDeliveryDateItems(siteSettings);
  const heroSlides = homePage.heroBanners.length
    ? homePage.heroBanners.map((banner) => ({
        id: banner.id,
        title: banner.title,
        text: banner.text,
        accent: banner.accent,
        meta: banner.meta,
        imageUrl: banner.imageUrl,
        mobileImageUrl: banner.mobileImageUrl,
        blurBackground: banner.blurBackground,
        buttons: banner.buttons,
      }))
    : fallbackSlides;
  const hasMultipleHeroSlides = heroSlides.length > 1;

  return (
    <Flex vertical gap={48} className={styles.home}>
      <div className={styles.heroCarousel}>
        <Swiper
          className={styles.heroSwiper}
          modules={[Autoplay, Navigation, Pagination]}
          autoplay={
            hasMultipleHeroSlides
              ? {
                  delay: 5000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          loop={hasMultipleHeroSlides}
          navigation={
            hasMultipleHeroSlides
              ? {
                  prevEl: `.${styles.heroPrev}`,
                  nextEl: `.${styles.heroNext}`,
                }
              : false
          }
          pagination={hasMultipleHeroSlides ? { clickable: true } : false}
          slidesPerView={1}
          spaceBetween={20}
        >
          {heroSlides.map((slide) => (
            <SwiperSlide className={styles.heroSlide} key={slide.id}>
              <div
                className={classnames(styles.banner, {
                  [styles.bannerOriginalImage]: !slide.blurBackground,
                })}
              >
              {slide.imageUrl || slide.mobileImageUrl ? (
                <picture className={styles.bannerMedia}>
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
                {slide.buttons.length ? (
                  <div className={styles.bannerActions}>
                    {slide.buttons.map((button) =>
                      isInternalHref(button.link) ? (
                        <Link
                          className={styles.bannerButton}
                          href={button.link}
                          key={button.id}
                        >
                          {button.text}
                        </Link>
                      ) : (
                        <a
                          className={styles.bannerButton}
                          href={button.link}
                          key={button.id}
                          rel={isExternalHref(button.link) ? "noreferrer" : undefined}
                          target={isExternalHref(button.link) ? "_blank" : undefined}
                        >
                          {button.text}
                        </a>
                      ),
                    )}
                  </div>
                ) : null}
              </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {hasMultipleHeroSlides ? (
          <>
            <button
              type="button"
              className={styles.heroPrev}
              aria-label="Предыдущий баннер"
            >
              <LeftOutlined />
            </button>
            <button
              type="button"
              className={styles.heroNext}
              aria-label="Следующий баннер"
            >
              <RightOutlined />
            </button>
          </>
        ) : null}
      </div>

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
                {deliveryDates.length ? (
                  <div className={styles.deliveryDates}>
                    {deliveryDates.map((dateItem) => (
                      <span
                        key={dateItem.region}
                        className={classnames(styles.deliveryDate, {
                          [styles.deliveryDateMsk]:
                            dateItem.region === "msk",
                          [styles.deliveryDateSpb]:
                            dateItem.region === "spb",
                        })}
                      >
                        {dateItem.city}: {dateItem.date}
                      </span>
                    ))}
                  </div>
                ) : null}
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
