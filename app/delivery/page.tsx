import type { Metadata } from "next";
import Link from "next/link";
import { DeliveryZoneMap } from "./delivery-zone-map";
import styles from "./styles.module.css";

const DELIVERY_ZONES = [
  {
    title: "Москва и Московская область",
    description:
      "Доставляем заказы курьером в согласованный день и удобный временной интервал. После оформления обязательно связываемся для подтверждения состава и адреса.",
    details: [
      "Бережно упаковываем охлажденные и замороженные продукты.",
      "Уточняем стоимость доставки по адресу при подтверждении заказа.",
      "Сообщаем дату ближайшего выезда заранее.",
    ],
  },
  {
    title: "Санкт-Петербург и Ленинградская область",
    description:
      "Отправляем сборные доставки по графику. Если вы оформляете заказ заранее, мы резервируем позиции и подтверждаем дату отправки отдельно.",
    details: [
      "Доставка выполняется в согласованный день.",
      "Перед отправкой менеджер подтверждает наличие и итоговую сумму.",
      "Для удаленных адресов время и стоимость согласовываются индивидуально.",
    ],
  },
];

const ORDER_STEPS = [
  "Выберите товары в каталоге и оформите заказ на сайте.",
  "Мы свяжемся с вами, подтвердим наличие, адрес и удобное время.",
  "Соберем заказ, бережно упакуем продукты и передадим в доставку.",
  "В день доставки напомним о заказе и передадим актуальный статус.",
];

const PAYMENT_ITEMS = [
  "Наличными или переводом при получении, если это согласовано при подтверждении заказа.",
  "Предоплатой для крупных, праздничных и индивидуально собранных заказов.",
  "Итоговая сумма может корректироваться для весовых позиций после фактической сборки.",
];

const IMPORTANT_ITEMS = [
  "Минимальную сумму заказа и стоимость доставки уточняем при подтверждении, так как они зависят от направления и объема корзины.",
  "Если какого-то товара не оказалось в наличии, мы заранее предложим замену и ничего не добавим без вашего согласия.",
  "Просим проверять заказ при получении, чтобы мы сразу помогли решить любой вопрос.",
];

export const metadata: Metadata = {
  title: "Доставка | TILI-MILI",
  description:
    "Условия доставки фермерских продуктов TILI-MILI по Москве, Московской области, Санкт-Петербургу и Ленинградской области.",
};

export default function DeliveryPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
        <Link href="/">Главная</Link>
        <span>/</span>
        <span aria-current="page">Доставка</span>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.kicker}>Доставка фермерских продуктов</span>
          <h1>Привозим свежие деревенские продукты домой в удобное время</h1>
          <p>
            Мы сохраняем аккуратную доставку, бережную упаковку и живое
            подтверждение каждого заказа без автоматических сюрпризов.
          </p>
          <div className={styles.heroActions}>
            <Link href="/" className={styles.primaryAction}>
              Перейти в каталог
            </Link>
            <a href="tel:+79163672825" className={styles.secondaryAction}>
              Позвонить менеджеру
            </a>
          </div>
        </div>

        <div className={styles.heroNote}>
          <p className={styles.noteTitle}>Как мы работаем</p>
          <p>
            После оформления заказа мы всегда подтверждаем наличие товаров,
            итоговую стоимость и ближайшую дату доставки лично.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span>География доставки</span>
          <h2>Доставляем по основным направлениям</h2>
        </div>

        <div className={styles.zoneGrid}>
          {DELIVERY_ZONES.map((zone) => (
            <article key={zone.title} className={styles.zoneCard}>
              <h3>{zone.title}</h3>
              <p>{zone.description}</p>
              <ul>
                {zone.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span>Проверка адреса</span>
          <h2>Интерактивная карта зон доставки</h2>
        </div>

        <DeliveryZoneMap />
      </section>

      <section className={styles.infoLayout}>
        <article className={styles.infoCard}>
          <span>Оформление</span>
          <h2>Как проходит заказ</h2>
          <ol className={styles.stepsList}>
            {ORDER_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article className={styles.infoCard}>
          <span>Оплата</span>
          <h2>Условия оплаты</h2>
          <ul className={styles.simpleList}>
            {PAYMENT_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span>Важно знать</span>
          <h2>Несколько деталей перед оформлением</h2>
        </div>

        <div className={styles.importantGrid}>
          {IMPORTANT_ITEMS.map((item) => (
            <article key={item} className={styles.importantCard}>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.contactCard}>
        <div>
          <span>Есть вопросы?</span>
          <h2>Поможем подобрать доставку под ваш адрес</h2>
          <p>
            Если вы оформляете заказ впервые или хотите уточнить условия по
            конкретному району, свяжитесь с нами, и мы быстро сориентируем по
            срокам.
          </p>
        </div>

        <div className={styles.contactActions}>
          <a href="tel:+79163672825" className={styles.contactLink}>
            +7 (916) 367-28-25
          </a>
          <a href="mailto:info@tili-mili.ru" className={styles.contactLink}>
            info@tili-mili.ru
          </a>
        </div>
      </section>
    </div>
  );
}
