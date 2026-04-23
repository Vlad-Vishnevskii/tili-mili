"use client";

import styles from "./styles.module.css";
import Image from "next/image";
import {
  FOOTER_DISCLAIMER,
  FOOTER_IMG_PATHS,
  FOOTER_SOCIALS,
} from "./constants";
import { Flex } from "antd";
import Link from "next/link";
import { useCategoriesQuery } from "@/app/lib/catalog-queries";

export const Footer = () => {
  const { data: categories = [] } = useCategoriesQuery();

  return (
    <div className={styles.footer}>
      <div className={styles.container}>
        <Image
          src={FOOTER_IMG_PATHS.LOGO}
          className={styles.logo}
          width={200}
          height={200}
          alt="TILI-MILI"
        />
        <Flex className={styles.nav}>
          <h3>Продукция</h3>
          <div className={styles.navList}>
            {categories.map((item) => (
              <Link href={item.link} key={item.id}>
                {item.name}
              </Link>
            ))}
            <Link href="/blog" className={styles.blogLink}>
              Блог
            </Link>
          </div>
        </Flex>

        <Flex className={styles.contacts}>
          <h3>Контакты</h3>
          <a href="">{"+7(916)-367-28-25"}</a>
          <div className={styles.socials}>
            {FOOTER_SOCIALS.map((social) => (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className={styles.socialLink}
              >
                {social.id === "vk" ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.socialIcon}
                    aria-hidden="true"
                  >
                    <path
                      d="M4 7.5C4.12 13.02 6.88 16.33 11.72 16.5V13.37C13.45 13.54 14.76 14.8 15.29 16.5H18C17.32 14 15.52 12.62 14.39 12.09C15.52 11.44 17.08 9.86 17.46 7.5H15C14.5 9.42 13.06 11 11.72 11.16V7.5H9.27V13.92C7.91 13.58 6.19 11.88 6.11 7.5H4Z"
                      fill="currentColor"
                    />
                  </svg>
                ) : null}
                {social.id === "instagram" ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.socialIcon}
                    aria-hidden="true"
                  >
                    <rect
                      x="4.25"
                      y="4.25"
                      width="15.5"
                      height="15.5"
                      rx="4.75"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3.6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <circle cx="17.35" cy="6.65" r="1.1" fill="currentColor" />
                  </svg>
                ) : null}
                {social.id === "telegram" ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.socialIcon}
                    aria-hidden="true"
                  >
                    <path
                      d="M20.45 5.06L3.93 11.43C2.8 11.88 2.81 12.51 3.72 12.79L7.96 14.11L17.78 7.91C18.24 7.63 18.66 7.78 18.31 8.09L10.35 15.27L10.06 19.44C10.48 19.44 10.67 19.25 10.9 19.03L12.96 17.03L17.24 20.19C18.03 20.62 18.59 20.4 18.79 19.46L21.6 6.22C21.89 5.07 21.16 4.55 20.45 5.06Z"
                      fill="currentColor"
                    />
                  </svg>
                ) : null}
              </a>
            ))}
          </div>
        </Flex>
      </div>

      <div className={styles.disclaimerWrap}>
        <div className={styles.disclaimer}>
          {FOOTER_DISCLAIMER.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
};
