import { NAV_ITEMS } from "@/app/constants";
import styles from "./styles.module.css";
import { Breadcrumb, Flex, Button } from "antd";
import { PRODUCT_CARDS } from "@/app/constants";
import Image from "next/image";

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
            title: "Главная",
          },
          {
            title: <a href="">Продукция</a>,
          },
          {
            title: <a href="">Сыры</a>,
          },
        ]}
      />
      <Flex gap={10} style={{ marginTop: "15px" }}>
        {FILTERS.map((item) => (
          <Button key={item}>{item}</Button>
        ))}
      </Flex>
      <Flex gap={20} className={styles.cardList}>
        {PRODUCT_CARDS.map((card) => (
          <Flex className={styles.card} key={card.id} vertical>
            <Image src={card.img} width={200} height={100} alt="" />
            <Flex vertical className={styles.cardBottom} gap={20}>
              <h3>{card.name}</h3>
              <Button className={styles.buyBtn}>Купить</Button>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </div>
  );
};

export default CategoryPage;
