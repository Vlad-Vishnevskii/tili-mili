import { readFile } from "node:fs/promises";
import { join, normalize, sep } from "node:path";
import sharp from "sharp";
import { getSiteSettings } from "@/app/lib/site-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FALLBACK_ICON_PATH = "/logo_32x32.svg";
const DEFAULT_ICON_SIZE = 192;
const ALLOWED_ICON_SIZES = new Set([180, 192, 512]);
const PUBLIC_DIR = join(process.cwd(), "public");
const ICON_ACCEPT_HEADER =
  "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8";
const TRANSPARENT_BACKGROUND = {
  r: 255,
  g: 255,
  b: 255,
  alpha: 0,
};
const SVG_BASE_DENSITY = 72;
const MAX_SVG_DENSITY = 8192;

const getIconSize = (request: Request) => {
  const size = Number(new URL(request.url).searchParams.get("size"));

  return ALLOWED_ICON_SIZES.has(size) ? size : DEFAULT_ICON_SIZE;
};

const readPublicAsset = async (assetPath: string) => {
  const relativePath = decodeURIComponent(assetPath).replace(/^\/+/, "");
  const resolvedPath = normalize(join(PUBLIC_DIR, relativePath));

  if (!resolvedPath.startsWith(`${PUBLIC_DIR}${sep}`)) {
    throw new Error("Invalid app icon path");
  }

  return readFile(resolvedPath);
};

const fetchRemoteAsset = async (assetUrl: string) => {
  const response = await fetch(assetUrl, {
    cache: "no-store",
    headers: {
      Accept: ICON_ACCEPT_HEADER,
    },
  });

  if (!response.ok) {
    throw new Error(`App icon request failed with status ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
};

const loadIconSource = async () => {
  const siteSettings = await getSiteSettings();
  const iconUrl =
    siteSettings.appIconUrl ?? siteSettings.faviconUrl ?? FALLBACK_ICON_PATH;

  try {
    return await (iconUrl.startsWith("/")
      ? readPublicAsset(iconUrl)
      : fetchRemoteAsset(iconUrl));
  } catch {
    return readPublicAsset(FALLBACK_ICON_PATH);
  }
};

const getRenderDensity = async (source: Buffer, size: number) => {
  const metadata = await sharp(source).metadata();

  if (metadata.format !== "svg") {
    return undefined;
  }

  const sourceSize = Math.max(metadata.width ?? size, metadata.height ?? size);

  return Math.min(
    Math.max(
      Math.ceil((size / Math.max(sourceSize, 1)) * SVG_BASE_DENSITY * 2),
      SVG_BASE_DENSITY,
    ),
    MAX_SVG_DENSITY,
  );
};

const renderPngIcon = async (source: Buffer, size: number) => {
  const density = await getRenderDensity(source, size);

  return sharp(source, {
    density,
    limitInputPixels: false,
  })
    .resize(size, size, {
      fit: "contain",
      background: TRANSPARENT_BACKGROUND,
    })
    .png()
    .toBuffer();
};

export async function GET(request: Request) {
  const size = getIconSize(request);
  const source = await loadIconSource();
  const icon = await renderPngIcon(source, size);

  return new Response(new Uint8Array(icon), {
    status: 200,
    headers: {
      "cache-control": "public, max-age=300, stale-while-revalidate=86400",
      "content-length": String(icon.byteLength),
      "content-type": "image/png",
    },
  });
}
