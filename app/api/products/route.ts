import { NextResponse } from "next/server";
import { STRAPI_URL } from "@/app/constants";
import {
  normalizeProducts,
  type StrapiCollectionResponse,
  type StrapiProduct,
} from "@/app/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(`${STRAPI_URL}/api/products?populate=*`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Failed to fetch products from Strapi" },
        { status: response.status },
      );
    }

    const payload =
      (await response.json()) as StrapiCollectionResponse<StrapiProduct>;

    return NextResponse.json(normalizeProducts(payload.data));
  } catch {
    return NextResponse.json(
      { message: "Strapi is unavailable" },
      { status: 500 },
    );
  }
}
