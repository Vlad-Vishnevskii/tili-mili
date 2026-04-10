"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import classnames from "classnames";
import { usePathname } from "next/navigation";
import styles from "./styles.module.css";
import { Flex, Button, Input, Dropdown } from "antd";
import { HEADER_IMG_PATHS } from "./constants";
import {
  LeftOutlined,
  PhoneOutlined,
  RightOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { NAV_ITEMS } from "../../constants";

const MOCK_CART_TOTAL = "3 480 ₽";
const DESKTOP_NAV_SCROLL_STEP = 280;

export const Header = () => {
  const pathname = usePathname();
  const desktopNavRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const navElement = desktopNavRef.current;

    if (!navElement) {
      return;
    }

    const updateDesktopNavState = () => {
      const maxScrollLeft = navElement.scrollWidth - navElement.clientWidth;

      setCanScrollLeft(navElement.scrollLeft > 8);
      setCanScrollRight(maxScrollLeft - navElement.scrollLeft > 8);
    };

    updateDesktopNavState();

    navElement.addEventListener("scroll", updateDesktopNavState, {
      passive: true,
    });

    const resizeObserver = new ResizeObserver(() => {
      updateDesktopNavState();
    });

    resizeObserver.observe(navElement);

    return () => {
      navElement.removeEventListener("scroll", updateDesktopNavState);
      resizeObserver.disconnect();
    };
  }, []);

  const scrollDesktopNav = (direction: "left" | "right") => {
    const navElement = desktopNavRef.current;

    if (!navElement) {
      return;
    }

    navElement.scrollBy({
      left:
        direction === "left"
          ? -DESKTOP_NAV_SCROLL_STEP
          : DESKTOP_NAV_SCROLL_STEP,
      behavior: "smooth",
    });
  };

  return (
    <header className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.heroCard}>
          <div className={styles.headerGrid}>
            <div className={styles.mobileTopRow}>
              <Link
                href="/"
                aria-label="На главную"
                className={styles.brandLink}
              >
                <Flex align="center" className={styles.brandBlock}>
                  <Image
                    src={HEADER_IMG_PATHS.LOGO}
                    className={styles.logo}
                    width={150}
                    height={150}
                    alt="TILI-MILI"
                  />
                </Flex>
              </Link>

              <Flex align="center" className={styles.rightIcons}>
                <div className={styles.brandText}>
                  <span className={styles.brandEyebrow}>
                    Фермерские продукты из деревни
                  </span>
                </div>
                <Link
                  href="/"
                  className={classnames(
                    styles.cartSummary,
                    styles.desktopHidden,
                  )}
                  aria-label="Корзина"
                >
                  <Button
                    className={styles.cartButton}
                    classNames={{ icon: classnames(styles.cartIcon) }}
                    variant="text"
                    type="text"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                  />
                  <span className={styles.cartAmount}>{MOCK_CART_TOTAL}</span>
                </Link>

                <a
                  className={classnames(styles.phone, styles.desktopHidden)}
                  href="tel:8800"
                >
                  <Button
                    classNames={{
                      root: styles.actionButton,
                      icon: classnames(styles.phone),
                    }}
                    variant="text"
                    type="text"
                    size="large"
                    icon={<PhoneOutlined />}
                  />
                </a>
              </Flex>
            </div>

            <div className={styles.mobileHeaderBox}>
              <div className={styles.mobileSearchBlock}>
                <div className={styles.mobileSearchMeta}>
                  <Link href="/delivery" aria-label="Страница доставки">
                    <span className={styles.searchBadge}>Доставка</span>
                  </Link>

                  <span className={styles.searchHint}>
                    Выберите любимые блюда за пару касаний
                  </span>
                </div>

                <Input.Search
                  placeholder="Что вы хотите найти"
                  onSearch={() => {}}
                  enterButton
                  className={styles.search}
                  styles={{
                    button: { root: { backgroundColor: "#607d83" } },
                    input: { borderColor: "#607d83", color: "#607d83" },
                  }}
                />
              </div>
            </div>

            <Flex gap={10} align="center" className={styles.mibileHidden}>
              <Link
                href="/"
                className={styles.cartSummary}
                aria-label="Корзина"
              >
                <Button
                  className={styles.cartButton}
                  classNames={{ icon: classnames(styles.cartIcon) }}
                  variant="text"
                  type="text"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                />
                <span className={styles.cartAmount}>{MOCK_CART_TOTAL}</span>
              </Link>

              <a className={styles.phone} href="tel:8800">
                <Button
                  classNames={{
                    root: styles.actionButton,
                    icon: classnames(styles.phone),
                  }}
                  variant="text"
                  type="text"
                  size="large"
                  icon={<PhoneOutlined />}
                />
              </a>
            </Flex>
          </div>
        </div>
      </div>

      <div className={styles.navbarDesktop}>
        <div
          className={classnames(styles.navbarDesktopShell, {
            [styles.navbarDesktopShellScrollable]:
              canScrollLeft || canScrollRight,
          })}
        >
          <button
            type="button"
            className={classnames(
              styles.navScrollButton,
              styles.navScrollButtonLeft,
              {
                [styles.navScrollButtonHidden]: !canScrollLeft,
              },
            )}
            onClick={() => scrollDesktopNav("left")}
            aria-label="Прокрутить меню влево"
            tabIndex={canScrollLeft ? 0 : -1}
          >
            <LeftOutlined />
          </button>

          <div
            className={classnames(styles.navbarDesktopViewport, {
              [styles.navbarDesktopViewportLeftFade]: canScrollLeft,
              [styles.navbarDesktopViewportRightFade]: canScrollRight,
            })}
          >
            <div ref={desktopNavRef} className={styles.navbarDesktopInner}>
              {NAV_ITEMS.map((item) => (
                <Dropdown
                  key={item.id}
                  menu={{
                    items: item.subCategories.map((subCategory) => ({
                      key: subCategory.id.toString(),
                      label: <Link href="/">{subCategory.label}</Link>,
                    })),
                  }}
                >
                  <Link
                    className={classnames(styles.navbarItem, {
                      [styles.navbarItemActive]: pathname === item.link,
                    })}
                    href={item.link}
                  >
                    {item.name}
                  </Link>
                </Dropdown>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={classnames(
              styles.navScrollButton,
              styles.navScrollButtonRight,
              {
                [styles.navScrollButtonHidden]: !canScrollRight,
              },
            )}
            onClick={() => scrollDesktopNav("right")}
            aria-label="Прокрутить меню вправо"
            tabIndex={canScrollRight ? 0 : -1}
          >
            <RightOutlined />
          </button>
        </div>
      </div>

      <div className={styles.navbarContainer}>
        <Flex className={styles.navbar} gap={20}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              className={classnames(styles.navbarItem, {
                [styles.navbarItemActive]: pathname === item.link,
              })}
              href={item.link}
            >
              {item.name}
            </Link>
          ))}
        </Flex>
      </div>
    </header>
  );
};
