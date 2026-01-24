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
    process.env.WORDPRESS_API_URL ||
    "https://headlessamulets.in/wp-json/wc/v3",
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
  const images: ProductImage[] = wpProduct.images.map((img) => {
    // Obtener la URL de imagen de mayor calidad disponible
    let highQualitySrc = img.src;

    // Intentar obtener imagen de mayor calidad desde la URL original
    // WordPress a menudo incluye diferentes tamaños en la URL base

    // Como fallback, intentar reemplazar dimensiones pequeñas en la URL
    if (
      highQualitySrc.includes("-150x150") ||
      highQualitySrc.includes("-300x300")
    ) {
      console.log("Applying URL replacement fallback");
      highQualitySrc = highQualitySrc.replace(/-\d+x\d+/, "");
    }

    return {
      id: img.id,
      src: highQualitySrc,
      alt: img.alt || wpProduct.name,
      name: img.name || wpProduct.name,
    };
  });

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
    type: wpProduct.type || "simple",
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
    // Verificar si las credenciales están configuradas
    if (!API_CONFIG.consumerKey || !API_CONFIG.consumerSecret) {
      console.log(
        "WordPress API credentials not configured, returning mock data"
      );
      // Retornar datos mock cuando no hay configuración
      const result: ProductsResponse = {
        products: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };
      return NextResponse.json(result);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "12");

    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      status: "publish",
    });

    // Aplicar filtros desde query params
    const categoriesParam = searchParams.get("categories");
    const tags = searchParams.get("tags");
    const featured = searchParams.get("featured");
    const onSale = searchParams.get("on_sale");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sort_by");
    const sortOrder = searchParams.get("sort_order");
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");

    // Convertir slugs de categorías a IDs
    if (categoriesParam) {
      try {
        // Obtener todas las categorías para crear un mapa slug -> ID
        const categoriesResponse = await fetch(
          `${API_CONFIG.baseUrl}/products/categories?per_page=100`,
          {
            headers: createAuthHeaders(),
            cache: "no-store",
          }
        );

        if (categoriesResponse.ok) {
          const wpCategories: Array<{ id: number; slug: string }> = await categoriesResponse.json();
          const slugToIdMap = new Map(wpCategories.map(cat => [cat.slug, cat.id]));
          
          // Convertir slugs a IDs
          const categorySlugs = categoriesParam.split(",");
          const categoryIds = categorySlugs
            .map(slug => slugToIdMap.get(slug.trim()))
            .filter((id): id is number => id !== undefined);
          
          if (categoryIds.length > 0) {
            params.append("category", categoryIds.join(","));
            console.log("🔄 Converted category slugs to IDs:", { slugs: categorySlugs, ids: categoryIds });
          } else {
            console.warn("⚠️ No matching category IDs found for slugs:", categorySlugs);
          }
        }
      } catch (error) {
        console.error("❌ Error converting category slugs to IDs:", error);
        // Si falla la conversión, intentar usar el parámetro tal cual (por si acaso son IDs)
        params.append("category", categoriesParam);
      }
    }
    if (tags) {
      console.log("Server API: Tags parameter received:", tags);
      // Intentar primero con 'tags' (plural) y luego con 'tag' (singular) si no funciona
      params.append("tags", tags);
    }
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
    console.log("Server API: Filters applied:", {
      categories: categoriesParam,
      tags,
      featured,
      onSale,
      search,
      priceRange: minPrice && maxPrice ? `${minPrice}-${maxPrice}` : null,
    });

    let response: Response;
    try {
      // Agregar timeout para evitar que se quede colgado
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

      response = await fetch(`${API_CONFIG.baseUrl}/products?${params}`, {
        headers: createAuthHeaders(),
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (fetchError) {
      console.error("Server API Fetch Error:", fetchError);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json(
          {
            error: "La solicitud a WordPress tardó demasiado. Por favor, intenta nuevamente.",
          },
          { status: 504 } // Gateway Timeout
        );
      }
      return NextResponse.json(
        {
          error: `Error de conexión con WordPress: ${fetchError instanceof Error ? fetchError.message : "Error desconocido"}`,
        },
        { status: 502 } // Bad Gateway
      );
    }

    if (!response.ok) {
      console.error("Server API Error:", response.status, response.statusText);
      let errorText = "";
      try {
        errorText = await response.text();
        console.error("Server API Error Body:", errorText);
      } catch {
        console.error("Could not read error response body");
      }

      // Mensajes más específicos para errores comunes
      let errorMessage = `Error fetching products: ${response.status} ${response.statusText}`;
      if (response.status === 503) {
        errorMessage = "WordPress está temporalmente no disponible. Por favor, intenta nuevamente en unos momentos.";
      } else if (response.status === 500) {
        errorMessage = "Error interno en WordPress. Por favor, intenta nuevamente más tarde.";
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = "Error de autenticación con WordPress. Por favor, verifica las credenciales.";
      } else if (response.status === 404) {
        errorMessage = "No se encontró el endpoint en WordPress.";
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorText || undefined,
        },
        { status: response.status }
      );
    }

    let wpProducts: WordPressProduct[] = await response.json();
    console.log(
      "Server API: WordPress response - products count:",
      wpProducts.length
    );
    if (tags) {
      console.log(
        "Server API: Products with tags:",
        wpProducts.map((p) => ({ id: p.id, name: p.name, tags: p.tags }))
      );

      // Filtrar productos que realmente tengan la etiqueta solicitada
      const requestedTags = tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase());
      wpProducts = wpProducts.filter((product) => {
        if (!product.tags || product.tags.length === 0) {
          return false;
        }
        return product.tags.some(
          (tag) =>
            requestedTags.includes(tag.slug.toLowerCase()) ||
            requestedTags.includes(tag.name.toLowerCase())
        );
      });

      console.log("Server API: Filtered products count:", wpProducts.length);
      console.log(
        "Server API: Filtered products:",
        wpProducts.map((p) => ({
          id: p.id,
          name: p.name,
          tags: p.tags.map((t) => t.slug),
        }))
      );
    }

    const totalHeader = response.headers.get("X-WP-Total");
    const totalPagesHeader = response.headers.get("X-WP-TotalPages");

    // Actualizar totales basados en productos filtrados
    const total = tags
      ? wpProducts.length
      : totalHeader
      ? parseInt(totalHeader)
      : wpProducts.length;
    const totalPages = tags
      ? Math.ceil(total / perPage)
      : totalPagesHeader
      ? parseInt(totalPagesHeader)
      : 1;

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
