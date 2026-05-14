import type { MetadataRoute } from "next";
import { getAppIconPath } from "@/app/constants";
import { getSiteSettings } from "@/app/lib/site-data";

export const dynamic = "force-dynamic";

const THEME_COLOR = "#607d83";
const BACKGROUND_COLOR = "#ffffff";

const getShortName = (siteName: string) => {
  if (siteName.length <= 12) {
    return siteName;
  }

  return siteName.split(/\s+/)[0] || siteName.slice(0, 12);
};

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const siteSettings = await getSiteSettings();

  return {
    id: "/",
    name: siteSettings.siteName,
    short_name: getShortName(siteSettings.siteName),
    description: siteSettings.siteDescription,
    lang: "ru",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: BACKGROUND_COLOR,
    theme_color: THEME_COLOR,
    icons: [
      {
        src: getAppIconPath(192),
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: getAppIconPath(512),
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: getAppIconPath(512),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
