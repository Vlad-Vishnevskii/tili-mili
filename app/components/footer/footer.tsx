import styles from "./styles.module.css";
import Image from "next/image";
import { FOOTER_IMG_PATHS } from "./constants";
import { Flex } from "antd";
import { NAV_ITEMS } from "../../constants";
import Link from "next/link";

export const Footer = () => {
  return (
    <div className={styles.footer}>
      <Flex className={styles.container} justify="space-between" align="center">
        <Image
          src={FOOTER_IMG_PATHS.LOGO}
          className={styles.logo}
          width={200}
          height={200}
          alt="TILI-MILI"
        />
        <Flex className={styles.nav} vertical gap={8}>
          <h3>Продукция</h3>
          <Flex gap={10} wrap="wrap">
            {NAV_ITEMS.map((item) => (
              <Link href={item.link} key={item.id}>
                {item.name}
              </Link>
            ))}
          </Flex>
        </Flex>

        <Flex vertical gap={8}>
          <h3>Контакты</h3>
          <a href="">{"+7(916)-367-28-25"}</a>
        </Flex>
      </Flex>
    </div>
  );
};
