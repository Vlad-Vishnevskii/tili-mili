"use client";

import Link from "next/link";
import classnames from "classnames";
import styles from "./styles.module.css";
import { Flex, Typography, Button, Input, Dropdown } from "antd";
import { DeliveryIcon } from "../icons/delivery";
import { HEADER_IMG_PATHS } from "./constants";
import { PhoneOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import Image from "next/image";
import { NAV_ITEMS } from "../../constants";

export const Header = () => {
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
              classNames={{ icon: classnames(styles.phone) }}
              variant="text"
              type="text"
              size="large"
              icon={<PhoneOutlined />}
            />
            <Typography.Text className={styles.phoneText}>
              {"+7(916)-367-28-25"}
            </Typography.Text>
          </a>
          <Flex vertical align="center">
            <Image
              src={HEADER_IMG_PATHS.LOGO}
              className={styles.logo}
              width={200}
              height={200}
              alt="TILI-MILI"
            />
          </Flex>
          <Flex align="center" className={styles.rightIcons}>
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
        </Flex>
        <Typography.Title className={styles.slogan} level={2}>
          Вкусные продукты из деревни с чистым составом
        </Typography.Title>
      </div>

      <Flex justify="center" className={styles.navbarDesktop} gap={20}>
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
            <Link className={styles.navbarItem} href={item.link}>
              {item.name}
            </Link>
          </Dropdown>
        ))}
      </Flex>

      <div className={styles.navbarContainer}>
        <Flex className={styles.navbar} gap={20}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.id} className={styles.navbarItem} href={item.link}>
              {item.name}
            </Link>
          ))}
        </Flex>
      </div>

      <div className={styles.container}>
        <Input.Search
          placeholder="Что вы хотите найти"
          onSearch={() => {}}
          enterButton
          styles={{
            button: { root: { backgroundColor: "#607d83" } },
            input: { borderColor: "#607d83", color: "#607d83" },
            root: { width: "70%", marginTop: "30px" },
          }}
        />
      </div>
    </header>
  );
};
