import { PRODUCT_CARDS } from "@/app/constants";
import Image from "next/image";
import Link from "next/link";
import { FreezeBadge } from "@/app/components/freeze-badge/freeze-badge";
import { PurchaseControls } from "./purchase-controls";
import styles from "./styles.module.css";

export const generateStaticParams = async () => {
  return PRODUCT_CARDS.map((cat) => ({
    id: String(cat.id),
  }));
};

const ProductPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const currentProduct = PRODUCT_CARDS.find(
    (item) => item.id.toString() === id,
  );

  if (!currentProduct) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <p>Продукт не найден</p>
          <Link href="/">Вернуться на главную</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
        <Link href="/">Главная</Link>
        <span>/</span>
        <Link href="/category/0">Продукция</Link>
        <span>/</span>
        <span aria-current="page">{currentProduct.name}</span>
      </nav>

      <section className={styles.productShell}>
        <div className={styles.galleryCard}>
          <div className={styles.imageWrap}>
            <Image
              src={currentProduct.img}
              width={620}
              height={620}
              alt={currentProduct.name}
            />
          </div>

          <div className={styles.imageNote}>
            <span>Фермерский продукт</span>
            <p>
              Аккуратная подготовка, натуральный состав и бережная упаковка.
            </p>
          </div>
        </div>

        <div className={styles.infoCard}>
          <span className={styles.kicker}>Карточка товара</span>
          <div className={styles.titleBlock}>
            <h1 className={styles.name}>{currentProduct.name}</h1>
            {currentProduct.freezeLabel ? (
              <FreezeBadge label={currentProduct.freezeLabel} />
            ) : null}
          </div>

          <PurchaseControls
            unitPrice={Number(currentProduct.price)}
            unitName={currentProduct.unit.name}
            unitValue={currentProduct.unit.value}
          />

          <p className={styles.lead}>
            Живой фермерский продукт с понятными характеристиками, который
            удобно заказать как для повседневного рациона, так и для семейного
            стола.
          </p>

          <ul className={styles.descriptionList}>
            {currentProduct.description.map((item) => (
              <li key={item.name} className={styles.descriptionItem}>
                <strong>{item.name}</strong>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <Link href="/delivery" className={styles.secondaryLink}>
              Условия доставки
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductPage;
