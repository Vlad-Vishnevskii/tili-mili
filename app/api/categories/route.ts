import { NextResponse } from "next/server";
import { STRAPI_URL } from "@/app/constants";
import {
  normalizeCategories,
  type StrapiCategory,
  type StrapiCollectionResponse,
} from "@/app/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(`${STRAPI_URL}/api/categories?populate=*`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Failed to fetch categories from Strapi" },
        { status: response.status },
      );
    }

    const payload =
      (await response.json()) as StrapiCollectionResponse<StrapiCategory>;

    return NextResponse.json(normalizeCategories(payload.data));
  } catch {
    return NextResponse.json(
      { message: "Strapi is unavailable" },
      { status: 500 },
    );
  }
}
