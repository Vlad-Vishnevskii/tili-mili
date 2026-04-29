import "./globals.css";
import "antd/dist/reset.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header, Footer } from "./components";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { CartProvider } from "./providers/cart-provider";
import { getCategories, getProducts } from "./lib/catalog-data";
import { buildMetadata, getSiteSettings } from "./lib/site-data";
import styles from "./page.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings();

  return buildMetadata({
    seo: siteSettings.defaultSeo,
    titleFallback: siteSettings.siteName,
    descriptionFallback: siteSettings.siteDescription,
    siteName: siteSettings.siteName,
    faviconUrl: siteSettings.faviconUrl,
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, products, siteSettings] = await Promise.all([
    getCategories(),
    getProducts(),
    getSiteSettings(),
  ]);

  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${styles.page}`}
      >
        <AntdRegistry>
          <CartProvider>
            <Header
              categories={categories}
              products={products}
              siteSettings={siteSettings}
            />
            <main className={styles.main}>{children}</main>
            <Footer categories={categories} siteSettings={siteSettings} />
          </CartProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
