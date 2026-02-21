"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import classnames from "classnames";
import styles from "./styles.module.css";
import { Flex, Typography, Button } from "antd";
import { DeliveryIcon } from "../icons/delivery";
import { HEADER_IMG_PATHS } from "./constants";
import {
  CloseOutlined,
  MenuOutlined,
  PhoneOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { NAV_ITEMS } from "../../constants";

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className={styles.wrapper}>
      <div className={styles.container}>
        <Flex
          align="center"
          justify="space-between"
          className={styles.fullWidth}
        >
          <a className={styles.phone} href="tel:8800">
            <Button
              classNames={{ icon: classnames(styles.cargoIcon) }}
              variant="text"
              type="text"
              size="large"
              icon={<PhoneOutlined />}
            />
            <Typography.Text>{"+7(916)-367-28-25"}</Typography.Text>
          </a>
          <Flex vertical align="center">
            <Image
              src={HEADER_IMG_PATHS.LOGO}
              className={styles.logo}
              width={200}
              height={200}
              alt="TILI-MILI"
            />
            <Typography.Title level={3}>
              Вкусные продукты из деревни с чистым составом
            </Typography.Title>
          </Flex>
          <Flex gap={12} align="center">
            <Button
              classNames={{ icon: classnames(styles.cartIcon) }}
              variant="text"
              type="text"
              size="large"
              icon={<ShoppingCartOutlined />}
            />
            <Button
              classNames={{ icon: classnames(styles.cargoIcon) }}
              variant="text"
              type="text"
              size="large"
              icon={<DeliveryIcon />}
            />
          </Flex>
          <button className={styles.burgerBtn} onClick={toggleMenu}>
            <MenuOutlined />
          </button>
        </Flex>
      </div>

      <Flex justify="center" className={styles.navbar} gap={20}>
        {NAV_ITEMS.map((item) => (
          <Link className={styles.navbarItem} key={item.id} href={item.link}>
            {item.name}
          </Link>
        ))}
      </Flex>

      {menuOpen && <div className={styles.overlay} onClick={toggleMenu} />}

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ""}`}>
        <button onClick={toggleMenu} className={styles.mobileMenu_closeBtn}>
          <CloseOutlined />
        </button>
        <Link href="/" onClick={toggleMenu}>
          Главная
        </Link>
        <Link href="/blog" onClick={toggleMenu}>
          Блог
        </Link>
        <Link href="/map" onClick={toggleMenu}>
          Где купить
        </Link>
        <a href="tel:88007003334" onClick={toggleMenu}>
          {"8 (800) 700-33-34"}
        </a>
      </div>
    </header>
  );
};
