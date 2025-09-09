import { NextRequest, NextResponse } from "next/server";
import {
  WordPressProduct,
  Product,
  ProductsResponse,
  WordPressAPIConfig,
  ProductImage,
  ProductCategory,
  ProductTag,
} from "../../types/product";

// Configuración de la API de WordPress (lado servidor)
const API_CONFIG: WordPressAPIConfig = {
  baseUrl:
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
    "https://www.amuletsorder.com/wp-json/wc/v3",
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

// Función para transformar producto de WordPress a nuestro tipo Product
function transformWordPressProduct(wpProduct: WordPressProduct): Product {
  const images: ProductImage[] = wpProduct.images.map((img) => ({
    id: img.id,
    src: img.src,
    alt: img.alt || wpProduct.name,
    name: img.name || wpProduct.name,
  }));

  const categories: ProductCategory[] = wpProduct.categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
  }));

  const tags: ProductTag[] = wpProduct.tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
  }));

  return {
    id: wpProduct.id,
    name: wpProduct.name,
    slug: wpProduct.slug,
    description: wpProduct.description,
    shortDescription: wpProduct.short_description,
    price: parseFloat(wpProduct.price) || 0,
    regularPrice: parseFloat(wpProduct.regular_price) || 0,
    salePrice: wpProduct.sale_price
      ? parseFloat(wpProduct.sale_price)
      : undefined,
    onSale: wpProduct.on_sale,
    sku: wpProduct.sku,
    images,
    categories,
    tags,
    inStock: wpProduct.stock_status === "instock",
    stockQuantity: wpProduct.stock_quantity ?? undefined,
    averageRating: parseFloat(wpProduct.average_rating) || 0,
    ratingCount: wpProduct.rating_count,
    permalink: wpProduct.permalink,
    featured: wpProduct.featured,
    printfulSyncProductId: (() => {
      const meta = wpProduct.meta_data.find(
        (meta) => meta.key === "_printful_sync_product_id"
      );
      return meta?.value ? Number(meta.value) || undefined : undefined;
    })(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "12");

    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      status: "publish",
    });

    // Aplicar filtros desde query params
    const categories = searchParams.get("categories");
    const tags = searchParams.get("tags");
    const featured = searchParams.get("featured");
    const onSale = searchParams.get("on_sale");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sort_by");
    const sortOrder = searchParams.get("sort_order");
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");

    if (categories) params.append("category", categories);
    if (tags) params.append("tag", tags);
    if (featured === "true") params.append("featured", "true");
    if (onSale === "true") params.append("on_sale", "true");
    if (search) params.append("search", search);
    if (sortBy) {
      const orderBy =
        sortBy === "name"
          ? "title"
          : sortBy === "date"
          ? "date"
          : sortBy === "popularity"
          ? "popularity"
          : sortBy === "rating"
          ? "rating"
          : "menu_order";
      params.append("orderby", orderBy);
    }
    if (sortOrder) params.append("order", sortOrder);
    if (minPrice) params.append("min_price", minPrice);
    if (maxPrice) params.append("max_price", maxPrice);

    console.log(
      "Server API: Fetching URL:",
      `${API_CONFIG.baseUrl}/products?${params}`
    );
    console.log("Server API: Auth configured:", {
      hasConsumerKey: !!API_CONFIG.consumerKey,
      hasConsumerSecret: !!API_CONFIG.consumerSecret,
    });

    const response = await fetch(`${API_CONFIG.baseUrl}/products?${params}`, {
      headers: createAuthHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Server API Error:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("Server API Error Body:", errorText);
      return NextResponse.json(
        {
          error: `Error fetching products: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const wpProducts: WordPressProduct[] = await response.json();
    const totalHeader = response.headers.get("X-WP-Total");
    const totalPagesHeader = response.headers.get("X-WP-TotalPages");

    const total = totalHeader ? parseInt(totalHeader) : wpProducts.length;
    const totalPages = totalPagesHeader ? parseInt(totalPagesHeader) : 1;

    const products = wpProducts.map(transformWordPressProduct);

    const result: ProductsResponse = {
      products,
      total,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Server API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
