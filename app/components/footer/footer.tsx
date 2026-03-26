import styles from "./styles.module.css";
import Image from "next/image";
import { FOOTER_IMG_PATHS } from "./constants";
import { Flex } from "antd";
import { NAV_ITEMS } from "../../constants";
import Link from "next/link";

export const Footer = () => {
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
            {NAV_ITEMS.map((item) => (
              <Link href={item.link} key={item.id}>
                {item.name}
              </Link>
            ))}
          </div>
        </Flex>

        <Flex className={styles.contacts}>
          <h3>Контакты</h3>
          <a href="">{"+7(916)-367-28-25"}</a>
        </Flex>
      </div>
    </div>
  );
};
