"use client";

import { useEffect, useRef, useState, type FocusEvent } from "react";
import Link from "next/link";
import classnames from "classnames";
import { usePathname, useRouter } from "next/navigation";
import { Flex, Input, Dropdown } from "antd";
import {
  LeftOutlined,
  PhoneOutlined,
  RightOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import styles from "./styles.module.css";
import { FREE_DELIVERY_THRESHOLD, HEADER_IMG_PATHS } from "./constants";
import { CartModal } from "./cart-modal";
import type { CatalogCategory, CatalogProduct } from "@/app/lib/catalog";
import { useCart } from "@/app/providers/cart-provider";

const DESKTOP_NAV_SCROLL_STEP = 280;
const SEARCH_RESULTS_LIMIT = 8;

const formatPrice = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  link: string;
  type: "category" | "product";
};

const normalizeSearchValue = (value: string) =>
  value.toLowerCase().trim().replace(/\s+/g, " ");

const getCategorySearchResults = (
  categories: CatalogCategory[],
  searchValue: string,
): SearchResult[] =>
  categories
    .filter((category) => {
      const haystack = normalizeSearchValue(
        [
          category.name,
          category.slug,
          ...category.subCategories.map((item) => item.label),
        ].join(" "),
      );

      return haystack.includes(searchValue);
    })
    .map((category) => ({
      id: `category-${category.id}`,
      title: category.name,
      subtitle: "Категория",
      link: category.link,
      type: "category",
    }));

const getProductSearchResults = (
  products: CatalogProduct[],
  searchValue: string,
): SearchResult[] =>
  products
    .filter((product) => {
      const haystack = normalizeSearchValue(
        [
          product.name,
          product.slug,
          product.category?.name ?? "",
          product.freezeLabel ?? "",
          product.promoLabel ?? "",
        ].join(" "),
      );

      return haystack.includes(searchValue);
    })
    .map((product) => ({
      id: `product-${product.id}`,
      title: product.name,
      subtitle: product.category?.name
        ? `Товар • ${product.category.name}`
        : "Товар",
      link: product.link,
      type: "product",
    }));

type HeaderProps = {
  categories: CatalogCategory[];
  products: CatalogProduct[];
};

export const Header = ({ categories, products }: HeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { cartItems, clearCart, removeCartItem, updateCartItemQuantity } =
    useCart();
  const desktopNavRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const normalizedSearchValue = normalizeSearchValue(searchValue);
  const searchResults = normalizedSearchValue
    ? [
        ...getCategorySearchResults(categories, normalizedSearchValue),
        ...getProductSearchResults(products, normalizedSearchValue),
      ].slice(0, SEARCH_RESULTS_LIMIT)
    : [];
  const isSearchDropdownOpen = Boolean(
    normalizedSearchValue && isSearchFocused,
  );

  const cartProducts = cartItems
    .map((item) => {
      const product = products.find((card) => card.id === item.productId);

      if (!product) {
        return null;
      }

      const unitPrice = Number(product.price);
      const itemWeight = item.packageWeight * item.quantity;
      const itemTotal = unitPrice * item.packageWeight * item.quantity;

      return {
        ...item,
        product,
        itemWeight,
        itemTotal,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeight = cartProducts.reduce(
    (sum, item) => sum + item.itemWeight,
    0,
  );
  const totalPrice = cartProducts.reduce(
    (sum, item) => sum + item.itemTotal,
    0,
  );
  const amountLeftForFreeDelivery = Math.max(
    FREE_DELIVERY_THRESHOLD - totalPrice,
    0,
  );
  const cartAmountLabel = totalItems ? `${formatPrice(totalPrice)} ₽` : "";

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

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
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

  const handleSearchNavigate = (link: string) => {
    router.push(link);
    setSearchValue("");
    setIsSearchFocused(false);
  };

  const handleSearchSubmit = () => {
    if (!searchResults.length) {
      return;
    }

    handleSearchNavigate(searchResults[0].link);
  };

  const handleSearchBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (searchRef.current?.contains(event.relatedTarget as Node | null)) {
      return;
    }

    setIsSearchFocused(false);
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
                <button
                  type="button"
                  className={classnames(
                    styles.cartSummary,
                    styles.cartSummaryButton,
                    styles.desktopHidden,
                  )}
                  aria-label="Корзина"
                  onClick={() => setIsCartOpen(true)}
                >
                  <span className={styles.cartButton} aria-hidden="true">
                    <ShoppingCartOutlined className={styles.cartIcon} />
                  </span>
                  <span className={styles.cartAmount}>{cartAmountLabel}</span>
                </button>

                <a
                  className={classnames(styles.phone, styles.desktopHidden)}
                  href="tel:+79163672825"
                >
                  <span className={styles.actionButton} aria-hidden="true">
                    <PhoneOutlined className={styles.phoneIcon} />
                  </span>
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

                <div
                  ref={searchRef}
                  className={styles.searchShell}
                  onBlur={handleSearchBlur}
                >
                  <Input.Search
                    placeholder="Что вы хотите найти"
                    value={searchValue}
                    onChange={(event) => {
                      setSearchValue(event.target.value);
                      setIsSearchFocused(true);
                    }}
                    onFocus={() => setIsSearchFocused(true)}
                    onSearch={handleSearchSubmit}
                    enterButton
                    className={styles.search}
                    styles={{
                      button: { root: { backgroundColor: "#607d83" } },
                      input: { borderColor: "#607d83", color: "#607d83" },
                    }}
                  />

                  {isSearchDropdownOpen ? (
                    <div className={styles.searchResults} role="listbox">
                      {searchResults.length ? (
                        searchResults.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className={styles.searchResultItem}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleSearchNavigate(item.link)}
                          >
                            <span className={styles.searchResultType}>
                              {item.type === "category" ? "Категория" : "Товар"}
                            </span>
                            <strong>{item.title}</strong>
                            <span className={styles.searchResultSubtitle}>
                              {item.subtitle}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className={styles.searchEmpty}>
                          Ничего не найдено
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <Flex gap={10} align="center" className={styles.mibileHidden}>
              <button
                type="button"
                className={classnames(
                  styles.cartSummary,
                  styles.cartSummaryButton,
                )}
                aria-label="Корзина"
                onClick={() => setIsCartOpen(true)}
              >
                <span className={styles.cartButton} aria-hidden="true">
                  <ShoppingCartOutlined className={styles.cartIcon} />
                </span>
                <span className={styles.cartAmount}>{cartAmountLabel}</span>
              </button>

              <a className={styles.phone} href="tel:8800">
                <span className={styles.actionButton} aria-hidden="true">
                  <PhoneOutlined className={styles.phoneIcon} />
                </span>
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
              {categories.map((item) => (
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
          {categories.map((item) => (
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

      <CartModal
        amountLeftForFreeDelivery={amountLeftForFreeDelivery}
        cartProducts={cartProducts}
        isOpen={isCartOpen}
        onClearCart={clearCart}
        onClose={() => setIsCartOpen(false)}
        onRemoveItem={removeCartItem}
        onSubmitSuccess={clearCart}
        onUpdateQuantity={updateCartItemQuantity}
        totalItems={totalItems}
        totalPrice={totalPrice}
        totalWeight={totalWeight}
      />
    </header>
  );
};
