import { NextRequest, NextResponse } from "next/server";
import {
  WordPressCategory,
  ProductCategory,
  WordPressAPIConfig,
} from "../../types/product";

// Configuración de la API de WordPress (lado servidor)
const API_CONFIG: WordPressAPIConfig = {
  baseUrl:
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
    "https://headlessamulets.in//wp-json/wc/v3",
  consumerKey: process.env.WORDPRESS_CONSUMER_KEY || "",
  consumerSecret: process.env.WORDPRESS_CONSUMER_SECRET || "",
  version: "v3",
};

// Función para crear headers de autenticación
function createAuthHeaders(): HeadersInit {
  const auth = Buffer.from(
    `${API_CONFIG.consumerKey}:${API_CONFIG.consumerSecret}`
  ).toString("base64");
  return {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json",
  };
}

// Función para transformar categoría de WordPress a nuestro tipo ProductCategory
function transformWordPressCategory(
  wpCategory: WordPressCategory
): ProductCategory {
  return {
    id: wpCategory.id,
    name: wpCategory.name,
    slug: wpCategory.slug,
    description: wpCategory.description,
    count: wpCategory.count,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Verificar si las credenciales están configuradas
    if (!API_CONFIG.consumerKey || !API_CONFIG.consumerSecret) {
      console.log(
        "WordPress API credentials not configured, returning empty categories"
      );
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const perPage = parseInt(searchParams.get("per_page") || "100");

    const params = new URLSearchParams({
      per_page: perPage.toString(),
    });

    console.log(
      "Server API: Fetching categories URL:",
      `${API_CONFIG.baseUrl}/products/categories?${params}`
    );

    const response = await fetch(
      `${API_CONFIG.baseUrl}/products/categories?${params}`,
      {
        headers: createAuthHeaders(),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Server API Error:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("Server API Error Body:", errorText);
      return NextResponse.json(
        {
          error: `Error fetching categories: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const wpCategories: WordPressCategory[] = await response.json();
    console.log(
      "Server API: WordPress response - categories count:",
      wpCategories.length
    );

    const categories = wpCategories.map(transformWordPressCategory);

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Server API Error:", error);
    return NextResponse.json(
      { error: "Error processing categories request" },
      { status: 500 }
    );
  }
}
