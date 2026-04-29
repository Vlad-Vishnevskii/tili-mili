import type { Metadata } from "next";
import HomePageClient from "./home-page-client";
import { getCategories } from "./lib/catalog-data";
import {
  buildMetadata,
  getHomePage,
  getSiteSettings,
} from "./lib/site-data";

export async function generateMetadata(): Promise<Metadata> {
  const [homePage, siteSettings] = await Promise.all([
    getHomePage(),
    getSiteSettings(),
  ]);

  return buildMetadata({
    seo: homePage.seo,
    fallbackSeo: siteSettings.defaultSeo,
    titleFallback: homePage.title ?? siteSettings.siteName,
    descriptionFallback:
      homePage.promoText ?? siteSettings.siteDescription,
    siteName: siteSettings.siteName,
    faviconUrl: siteSettings.faviconUrl,
  });
}

export default async function Home() {
  const [categories, homePage] = await Promise.all([
    getCategories(),
    getHomePage(),
  ]);

  return <HomePageClient categories={categories} homePage={homePage} />;
}
