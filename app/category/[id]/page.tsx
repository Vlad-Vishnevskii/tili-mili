import { NAV_ITEMS } from "@/app/constants";
import styles from "./styles.module.css";
import { Breadcrumb, Flex, Button } from "antd";
import { PRODUCT_CARDS } from "@/app/constants";
import Image from "next/image";
import Link from "next/link";

export const generateStaticParams = async () => {
  return NAV_ITEMS.map((cat) => ({
    id: String(cat.id),
  }));
};

type Props = {
  params: { id: string };
};

const FILTERS = ["Курица", "Субпродукты", "Индейка", "Яйца"];

const CategoryPage = ({ params }: Props) => {
  return (
    <div className={styles.container}>
      <Breadcrumb
        items={[
          {
            title: <Link href="/">Главная</Link>,
          },
          {
            title: <Link href="">Продукция</Link>,
          },
          {
            title: <Link href="">Сыры</Link>,
          },
        ]}
      />
      <Flex gap={10} wrap style={{ marginTop: "15px" }}>
        {FILTERS.map((item) => (
          <Button key={item}>{item}</Button>
        ))}
      </Flex>
      <Flex gap={20} className={styles.cardList} style={{ marginTop: "25px" }}>
        {PRODUCT_CARDS.map((card) => (
          <Flex className={styles.card} key={card.id} vertical>
            <Image src={card.img} width={200} height={100} alt="" />
            <Flex vertical className={styles.cardBottom} gap={20}>
              <h3>{card.name}</h3>
              <Link className={styles.btnLink} href={card.link} passHref>
                <Button className={styles.buyBtn}>Купить</Button>
              </Link>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </div>
  );
};

export default CategoryPage;
