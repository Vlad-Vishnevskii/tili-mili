"use client";

import Image from "next/image";
import Link from "next/link";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FreezeBadge } from "@/app/components/freeze-badge/freeze-badge";
import { ProductCardPurchase } from "@/app/category/[slug]/product-card-purchase";
import type { CatalogProduct } from "@/app/lib/catalog";
import styles from "./styles.module.css";

type ProductRecommendationsProps = {
  products: CatalogProduct[];
};

export const ProductRecommendations = ({
  products,
}: ProductRecommendationsProps) => {
  if (!products.length) {
    return null;
  }

  return (
    <section className={styles.recommendations}>
      <div className={styles.recommendationsTop}>
        <div className={styles.recommendationsHeader}>
          <span>Вам может понравиться</span>
          <h2>Другие товары</h2>
        </div>

        <div className={styles.recommendationsNavigation}>
          <button
            type="button"
            className={styles.recommendationsPrev}
            aria-label="Предыдущие товары"
          >
            <LeftOutlined />
          </button>
          <button
            type="button"
            className={styles.recommendationsNext}
            aria-label="Следующие товары"
          >
            <RightOutlined />
          </button>
        </div>
      </div>

      <Swiper
        className={styles.recommendationsSwiper}
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation={{
          prevEl: `.${styles.recommendationsPrev}`,
          nextEl: `.${styles.recommendationsNext}`,
        }}
        pagination={{ clickable: true }}
        spaceBetween={18}
        slidesPerView={1.12}
        slidesOffsetBefore={16}
        slidesOffsetAfter={16}
        breakpoints={{
          640: {
            slidesPerView: 2,
            slidesOffsetBefore: 16,
            slidesOffsetAfter: 16,
          },
          960: {
            slidesPerView: 3,
            slidesOffsetBefore: 16,
            slidesOffsetAfter: 16,
          },
          1280: {
            slidesPerView: 4,
            slidesOffsetBefore: 25,
            slidesOffsetAfter: 25,
          },
          1680: {
            slidesPerView: 5,
            slidesOffsetBefore: 25,
            slidesOffsetAfter: 25,
          },
        }}
      >
        {products.map((product) => (
          <SwiperSlide className={styles.recommendationSlide} key={product.id}>
            <article className={styles.recommendationCard}>
              <Link
                href={product.link}
                className={styles.recommendationImageWrap}
              >
                {product.promoLabel || product.dietLabel ? (
                  <div className={styles.recommendationBadges}>
                    {product.promoLabel ? (
                      <span className={styles.promoBadge}>
                        {product.promoLabel}
                      </span>
                    ) : null}
                    {product.dietLabel ? (
                      <span className={styles.dietBadge}>
                        {product.dietLabel}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {product.isOutOfStock ? (
                  <span className={styles.recommendationOutOfStock}>
                    Нет в наличии
                  </span>
                ) : null}

                {product.freezeLabel ? (
                  <FreezeBadge
                    className={styles.recommendationFreezeBadge}
                    label={product.freezeLabel}
                  />
                ) : null}

                <Image
                  src={product.img}
                  width={360}
                  height={300}
                  alt={product.name}
                />
              </Link>

              <div className={styles.recommendationBody}>
                <span className={styles.recommendationMeta}>
                  Фермерский продукт
                </span>
                <h3>
                  <Link href={product.link}>{product.name}</Link>
                </h3>
                <p>
                  {product.description[0]?.text ??
                    "Свежий продукт с аккуратной подготовкой и понятным составом."}
                </p>

                <div className={styles.recommendationPurchase}>
                  <ProductCardPurchase
                    productId={product.id}
                    productLink={product.link}
                    unitPrice={product.price}
                    unitName={product.unit.name}
                    unitValue={product.unit.value}
                    isOutOfStock={product.isOutOfStock}
                  />
                </div>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};
