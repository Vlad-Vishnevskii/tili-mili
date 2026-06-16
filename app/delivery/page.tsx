import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  buildMetadata,
  getDeliveryPage,
  getSiteSettings,
} from "@/app/lib/site-data";
import styles from "./styles.module.css";

const toPhoneHref = (value: string) => `tel:${value.replace(/[^\d+]/g, "")}`;

const isInternalHref = (href: string) =>
  href.startsWith("/") && !href.startsWith("//");

const isExternalHref = (href: string) => /^(https?:)?\/\//i.test(href);

const ActionLink = ({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className: string;
  href: string;
}) =>
  isInternalHref(href) ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <a
      href={href}
      className={className}
      rel={isExternalHref(href) ? "noreferrer" : undefined}
      target={isExternalHref(href) ? "_blank" : undefined}
    >
      {children}
    </a>
  );

export async function generateMetadata(): Promise<Metadata> {
  const [deliveryPage, siteSettings] = await Promise.all([
    getDeliveryPage(),
    getSiteSettings(),
  ]);

  return buildMetadata({
    seo: deliveryPage.seo,
    fallbackSeo: siteSettings.defaultSeo,
    titleFallback: "Доставка | TILI-MILI",
    descriptionFallback: siteSettings.siteDescription,
    siteName: siteSettings.siteName,
    faviconUrl: siteSettings.faviconUrl,
  });
}

export default async function DeliveryPage() {
  const [deliveryPage, siteSettings] = await Promise.all([
    getDeliveryPage(),
    getSiteSettings(),
  ]);
  const { contactSection } = deliveryPage;
  const sitePrimaryPhone = siteSettings.contacts?.phone;
  const siteSecondaryPhone = siteSettings.contacts?.secondaryPhone;
  const primaryPhone = contactSection.useSiteSettingsContacts
    ? sitePrimaryPhone ?? siteSecondaryPhone ?? contactSection.fallbackPhone
    : contactSection.fallbackPhone ?? sitePrimaryPhone ?? siteSecondaryPhone;
  const secondaryPhone =
    contactSection.useSiteSettingsContacts &&
    sitePrimaryPhone &&
    siteSecondaryPhone &&
    siteSecondaryPhone !== sitePrimaryPhone
      ? siteSecondaryPhone
      : undefined;
  const email = contactSection.useSiteSettingsContacts
    ? siteSettings.contacts?.email ?? contactSection.fallbackEmail
    : contactSection.fallbackEmail ?? siteSettings.contacts?.email;

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
        <Link href="/">Главная</Link>
        <span>/</span>
        <span aria-current="page">Доставка</span>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.kicker}>{deliveryPage.hero.kicker}</span>
          <h1>{deliveryPage.hero.title}</h1>
          <p>{deliveryPage.hero.text}</p>
          <div className={styles.heroActions}>
            <ActionLink
              href={deliveryPage.hero.primaryButtonLink}
              className={styles.primaryAction}
            >
              {deliveryPage.hero.primaryButtonText}
            </ActionLink>
            <ActionLink
              href={deliveryPage.hero.secondaryButtonLink}
              className={styles.secondaryAction}
            >
              {deliveryPage.hero.secondaryButtonText}
            </ActionLink>
          </div>
        </div>

        <div className={styles.heroNote}>
          <p className={styles.noteTitle}>{deliveryPage.hero.noteTitle}</p>
          <p>{deliveryPage.hero.noteText}</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span>{deliveryPage.zonesSectionKicker}</span>
          <h2>{deliveryPage.zonesSectionTitle}</h2>
        </div>

        <div className={styles.zoneGrid}>
          {deliveryPage.deliveryZones.map((zone) => (
            <article key={zone.title} className={styles.zoneCard}>
              <h3>{zone.title}</h3>
              <p>{zone.description}</p>
              {zone.details.length ? (
                <ul>
                  {zone.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className={styles.infoLayout}>
        <article className={styles.infoCard}>
          <span>{deliveryPage.orderSection.kicker}</span>
          <h2>{deliveryPage.orderSection.title}</h2>
          {deliveryPage.orderSection.listType === "ordered" ? (
            <ol className={styles.stepsList}>
              {deliveryPage.orderSection.items.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          ) : (
            <ul className={styles.simpleList}>
              {deliveryPage.orderSection.items.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          )}
        </article>

        <article className={styles.infoCard}>
          <span>{deliveryPage.paymentSection.kicker}</span>
          <h2>{deliveryPage.paymentSection.title}</h2>
          {deliveryPage.paymentSection.listType === "ordered" ? (
            <ol className={styles.stepsList}>
              {deliveryPage.paymentSection.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          ) : (
            <ul className={styles.simpleList}>
              {deliveryPage.paymentSection.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span>{deliveryPage.importantSectionKicker}</span>
          <h2>{deliveryPage.importantSectionTitle}</h2>
        </div>

        <div className={styles.importantGrid}>
          {deliveryPage.importantItems.map((item) => (
            <article key={item} className={styles.importantCard}>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.contactCard}>
        <div>
          <span>{contactSection.kicker}</span>
          <h2>{contactSection.title}</h2>
          <p>{contactSection.text}</p>
        </div>

        <div className={styles.contactActions}>
          {primaryPhone ? (
            <a href={toPhoneHref(primaryPhone)} className={styles.contactLink}>
              {primaryPhone}
            </a>
          ) : null}
          {secondaryPhone ? (
            <a
              href={toPhoneHref(secondaryPhone)}
              className={styles.contactLink}
            >
              {secondaryPhone}
            </a>
          ) : null}
          {email ? (
            <a href={`mailto:${email}`} className={styles.contactLink}>
              {email}
            </a>
          ) : null}
        </div>
      </section>
    </div>
  );
}
