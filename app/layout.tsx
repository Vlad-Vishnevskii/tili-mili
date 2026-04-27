import "./globals.css";
import "antd/dist/reset.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header, Footer } from "./components";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { CartProvider } from "./providers/cart-provider";
import { getCategories, getProducts } from "./lib/catalog-data";
import styles from "./page.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Деревенская еда TiLi_MiLi",
  description:
    "Деревенская еда с доставкой на дом в Москве и Санкт-Петербурге",
  icons: {
    icon: "/logo_32x32.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${styles.page}`}
      >
        <AntdRegistry>
          <CartProvider>
            <Header categories={categories} products={products} />
            <main className={styles.main}>{children}</main>
            <Footer categories={categories} />
          </CartProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
