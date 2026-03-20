import styles from "./styles.module.css";
import { Breadcrumb, Flex, Button } from "antd";
import { PRODUCT_CARDS } from "@/app/constants";
import Image from "next/image";
import Link from "next/link";

export const generateStaticParams = async () => {
  return PRODUCT_CARDS.map((cat) => ({
    id: String(cat.id),
  }));
};

const ProductPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const currentProduct = PRODUCT_CARDS.find(
    (item) => item?.id.toString() === id,
  );

  if (!currentProduct) {
    return (
      <div className={styles.container}>
        <p>Продукт не найден</p>
      </div>
    );
  }

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
      <div className={styles.cardTop}>
        <Image src={currentProduct.img} width={300} height={100} alt="" />
        <Flex vertical gap={15}>
          <h2 className={styles.name}>{currentProduct?.name}</h2>
          <p className={styles.price}>
            <span
              className={styles.priceMain}
            >{`${currentProduct.price} ₽`}</span>
            <span
              className={styles.priceSmall}
            >{` / ${currentProduct?.unit?.value} ${currentProduct.unit?.name}`}</span>
          </p>
          <ul className={styles.descriptionList}>
            {currentProduct?.description?.map((item) => (
              <li key={item.name}>
                <b>{item.name}</b> <span>{item.text}</span>
              </li>
            ))}
          </ul>
          <Button className={styles.buyBtn}>Купить</Button>
        </Flex>
      </div>
    </div>
  );
};

export default ProductPage;
