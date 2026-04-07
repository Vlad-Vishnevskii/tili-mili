"use client";

import Link from "next/link";
import classnames from "classnames";
import { usePathname } from "next/navigation";
import styles from "./styles.module.css";
import { Flex, Button, Input, Dropdown } from "antd";
import { DeliveryIcon } from "../icons/delivery";
import { HEADER_IMG_PATHS } from "./constants";
import { PhoneOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import Image from "next/image";
import { NAV_ITEMS } from "../../constants";

const MOCK_CART_TOTAL = "3 480 ₽";

export const Header = () => {
  const pathname = usePathname();

  return (
    <header className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.heroCard}>
          <Flex className={styles.fullWidth} gap={20}>
            <Link href="/" aria-label="На главную">
              <Flex vertical align="center">
                <Image
                  src={HEADER_IMG_PATHS.LOGO}
                  className={styles.logo}
                  width={150}
                  height={150}
                  alt="TILI-MILI"
                />
              </Flex>
            </Link>

            <div className={styles.mobileHeaderBox}>
              <Flex
                className={styles.iconWrapper}
                gap={20}
                align="center"
                style={{ width: "100%" }}
              >
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

                <Flex align="center" className={styles.rightIcons}>
                  <Link href="/" className={styles.cartSummary} aria-label="Корзина">
                    <Button
                      classNames={{ icon: classnames(styles.cartIcon) }}
                      variant="text"
                      type="text"
                      size="large"
                      icon={<ShoppingCartOutlined />}
                    />
                    <span className={styles.cartAmount}>{MOCK_CART_TOTAL}</span>
                  </Link>

                  <Link href="/delivery" aria-label="Страница доставки">
                    <Button
                      classNames={{ icon: classnames(styles.cargoIcon) }}
                      variant="text"
                      type="text"
                      size="large"
                      icon={<DeliveryIcon />}
                    />
                  </Link>

                  <a className={styles.phone} href="tel:8800">
                    <Button
                      classNames={{ icon: classnames(styles.phone) }}
                      variant="text"
                      type="text"
                      size="large"
                      icon={<PhoneOutlined />}
                    />
                  </a>
                </Flex>
              </Flex>
            </div>
          </Flex>

          <div className={styles.infoRow} />
        </div>
      </div>

      <div className={styles.navbarDesktop}>
        <div className={styles.navbarDesktopInner}>
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

      <div className={styles.navbarContainer}>
        <Flex className={styles.navbar} gap={20}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.id} className={styles.navbarItem} href={item.link}>
              {item.name}
            </Link>
          ))}
        </Flex>
      </div>
    </header>
  );
};
