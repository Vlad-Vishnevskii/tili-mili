import { NAV_ITEMS } from "./constants";
import Link from "next/link";
import Image from "next/image";
import { Flex, Carousel } from "antd";
import styles from "./page.module.css";

export default function Home() {
  return (
    <Flex vertical gap={40} style={{ width: "100%", maxWidth: 1000 }}>
      <Carousel arrows autoplay>
        <div>
          <div className={styles.banner}>
            <Flex vertical>
              <h2>Ближайшие доставки</h2>
              <p>МСК и ОБЛ: 25.02.26</p>
              <p>СПБ и ОБЛ: 29.02.26</p>
            </Flex>
          </div>
        </div>
        <div>
          <div className={styles.banner}>
            <Flex vertical>
              <h2>Предложение месяца</h2>
            </Flex>
          </div>
        </div>
        <div>
          <div className={styles.banner}>
            <Flex vertical>
              <h2>Акции</h2>
            </Flex>
          </div>
        </div>
      </Carousel>

      <div className={styles.categoryList}>
        {NAV_ITEMS.map((item) => (
          <Link className={styles.categoryItem} key={item.id} href={item.link}>
            <Image src={item?.img} width={160} height={160} alt="" />
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </Flex>
  );
}
