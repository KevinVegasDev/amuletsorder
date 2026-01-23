// Utilidades para conectar con WordPress API y obtener productos de Printful

import {
  WordPressProduct,
  WordPressVariation,
  Product,
  ProductVariation,
  ProductAttribute,
  ProductsResponse,
  ProductFilters,
  WordPressAPIConfig,
  ProductImage,
  ProductCategory,
  ProductTag,
  WordPressCategory,
  Banner,
  WordPressBanner,
  Collection,
  WordPressCollection,
} from "../types/product";

// Configuración de la API de WordPress (solo para funciones que aún usan llamadas directas)
const API_CONFIG: WordPressAPIConfig = {
  baseUrl:
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
    process.env.WORDPRESS_API_URL ||
    "http://localhost:3000/wp-json/wc/v3",
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

// Función para transformar variación de WordPress a nuestro tipo ProductVariation
function transformWordPressVariation(
  wpVariation: WordPressVariation
): ProductVariation {
  const attributes: Record<string, string> = {};
  wpVariation.attributes.forEach((attr) => {
    attributes[attr.name] = attr.option;
  });

  return {
    id: wpVariation.id,
    sku: wpVariation.sku,
    price: parseFloat(wpVariation.price) || 0,
    regularPrice: parseFloat(wpVariation.regular_price) || 0,
    salePrice: wpVariation.sale_price
      ? parseFloat(wpVariation.sale_price)
      : undefined,
    onSale: wpVariation.on_sale,
    inStock: wpVariation.stock_status === "instock",
    stockQuantity: wpVariation.stock_quantity ?? undefined,
    attributes,
    image: wpVariation.image
      ? {
          id: wpVariation.image.id,
          src: wpVariation.image.src,
          alt: wpVariation.image.alt,
          name: wpVariation.image.alt,
        }
      : undefined,
  };
}

// Función para transformar producto de WordPress a nuestro tipo Product
export function transformWordPressProduct(
  wpProduct: WordPressProduct,
  variations?: ProductVariation[]
): Product {
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

  // Transformar atributos
  const attributes: ProductAttribute[] | undefined = wpProduct.attributes
    ?.filter((attr) => attr.variation)
    .map((attr) => ({
      id: attr.id,
      name: attr.name,
      slug: attr.name.toLowerCase().replace(/\s+/g, "-"),
      options: attr.options,
      variation: attr.variation,
      position: attr.position,
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
    type: wpProduct.type,
    attributes,
    variations,
    // Buscar datos de Printful en meta_data
    printfulSyncProductId: (() => {
      const syncProductMeta = wpProduct.meta_data.find(
        (meta) => meta.key === "_printful_sync_product_id"
      );
      return syncProductMeta?.value ? Number(syncProductMeta.value) : undefined;
    })(),
  };
}

// Función para obtener todos los productos (usando API route del servidor)
export async function getProducts(
  page: number = 1,
  perPage: number = 12,
  filters?: ProductFilters
): Promise<ProductsResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    // Aplicar filtros
    if (filters) {
      if (filters.categories && filters.categories.length > 0) {
        params.append("categories", filters.categories.join(","));
      }
      if (filters.tags && filters.tags.length > 0) {
        params.append("tags", filters.tags.join(","));
      }
      if (filters.featured) {
        params.append("featured", "true");
      }
      if (filters.onSale) {
        params.append("on_sale", "true");
      }
      if (filters.search) {
        params.append("search", filters.search);
      }
      if (filters.sortBy) {
        params.append("sort_by", filters.sortBy);
      }
      if (filters.sortOrder) {
        params.append("sort_order", filters.sortOrder);
      }
      if (filters.priceRange) {
        params.append("min_price", filters.priceRange.min.toString());
        params.append("max_price", filters.priceRange.max.toString());
      }
    }

    // Construir URL absoluta
    const isClient = typeof window !== "undefined";
    // En servidor, construir URL completa
    let baseUrl: string;
    if (isClient) {
      // En cliente, usar window.location.origin
      baseUrl = `${window.location.origin}/api/products`;
    } else {
      // En servidor, usar la URL base del entorno o localhost:3000
      const host = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
                   `http://localhost:${process.env.PORT || 3000}`;
      baseUrl = `${host}/api/products`;
    }

    const url = `${baseUrl}?${params}`;
    console.log(`[getProducts] Fetching from: ${url}`);

    let response: Response;
    try {
      // Crear un AbortController para timeout manual
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

      response = await fetch(url, {
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (fetchError) {
      console.error("[getProducts] Fetch error:", fetchError);
      // Si es un error de red o timeout
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        throw new Error("La solicitud tardó demasiado. Por favor, intenta nuevamente.");
      }
      throw new Error(
        `Error de conexión: ${fetchError instanceof Error ? fetchError.message : "Error desconocido"}`
      );
    }

    if (!response.ok) {
      // Primero verificar el código de estado para mensajes específicos
      let errorMessage = `Error fetching products: ${response.status}`;
      
      // Mensajes más específicos para errores comunes basados en el código de estado
      if (response.status === 503) {
        errorMessage = "El servicio no está disponible temporalmente. Por favor, intenta nuevamente en unos momentos.";
      } else if (response.status === 500) {
        errorMessage = "Error interno del servidor. Por favor, intenta nuevamente más tarde.";
      } else if (response.status === 404) {
        errorMessage = "No se encontró la ruta de la API. Por favor, verifica la configuración.";
      }
      
      // Intentar obtener más detalles del error (puede ser JSON o HTML)
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } else {
          // Si es HTML u otro formato, intentar leer el texto pero no usarlo si es muy largo
          const errorText = await response.text();
          // Solo usar el texto si es corto (probablemente un mensaje de error)
          if (errorText && errorText.length < 200 && !errorText.includes("<!DOCTYPE")) {
            errorMessage = errorText;
          }
        }
      } catch (parseError) {
        // Si falla el parseo, usar el mensaje basado en el código de estado
        console.warn("[getProducts] Could not parse error response:", parseError);
      }
      
      console.error(`[getProducts] Error response:`, {
        status: response.status,
        statusText: response.statusText,
        message: errorMessage,
      });
      
      // Crear error con información del código de estado
      const error = new Error(errorMessage) as Error & { statusCode?: number };
      error.statusCode = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

// Función para obtener variaciones de un producto
async function getProductVariations(
  productId: number
): Promise<ProductVariation[]> {
  try {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/products/${productId}/variations`,
      {
        headers: createAuthHeaders(),
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      // Si el producto no tiene variaciones, retornar array vacío
      if (response.status === 404) {
        return [];
      }
      throw new Error(
        `Error fetching variations: ${response.status} ${response.statusText}`
      );
    }

    const wpVariations: WordPressVariation[] = await response.json();
    return wpVariations.map(transformWordPressVariation);
  } catch (error) {
    console.error("Error fetching product variations:", error);
    return [];
  }
}

// Función para obtener un producto por slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/products?slug=${slug}`,
      {
        headers: createAuthHeaders(),
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Error fetching product: ${response.status} ${response.statusText}`
      );
    }

    const wpProducts: WordPressProduct[] = await response.json();

    if (wpProducts.length === 0) {
      return null;
    }

    const wpProduct = wpProducts[0];

    // Si el producto es variable, obtener sus variaciones
    let variations: ProductVariation[] | undefined;
    if (wpProduct.type === "variable" && wpProduct.variations.length > 0) {
      variations = await getProductVariations(wpProduct.id);
    }

    return transformWordPressProduct(wpProduct, variations);
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

// Función para obtener productos destacados
export async function getFeaturedProducts(
  limit: number = 8
): Promise<Product[]> {
  try {
    const response = await getProducts(1, limit, { featured: true });
    return response.products;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

// Función para obtener productos recomendados (con etiqueta "recomendado")
export async function getRecommendedProducts(limit: number = 10): Promise<Product[]> {
  try {
    console.log("⭐ Fetching recommended products...");

    // Intentar obtener productos con etiqueta "recomendado" usando slug
    console.log('🔍 Trying to get products with "recomendado" tag slug...');
    const filters: ProductFilters = {
      tags: ["recomendado"], // Usar slug
    };
    const response = await getProducts(1, limit, filters);
    console.log(
      `📦 Recommended products found with slug: ${response.products.length}`
    );

    if (response.products.length > 0) {
      console.log("✅ Successfully found recommended products with slug!");
      return response.products;
    }

    // Si no hay productos con etiqueta "recomendado", usar productos destacados como fallback
    console.log(
      "⭐ No recommended products found with slug, using featured products as fallback"
    );
    const fallbackResponse = await getProducts(1, limit, { featured: true });
    console.log(
      `📦 Featured products found: ${fallbackResponse.products.length}`
    );
    return fallbackResponse.products;
  } catch (error) {
    console.error("❌ Error fetching recommended products:", error);
    // Fallback final: obtener productos destacados
    try {
      console.log("🔄 Attempting fallback to featured products...");
      const fallbackResponse = await getProducts(1, limit, { featured: true });
      console.log(
        `📦 Fallback featured products found: ${fallbackResponse.products.length}`
      );
      return fallbackResponse.products;
    } catch (fallbackError) {
      console.error(
        "❌ Error fetching fallback featured products:",
        fallbackError
      );
      return [];
    }
  }
}

// Función para obtener productos trending (con etiqueta "trending")
export async function getTrendingProducts(limit: number = 3): Promise<Product[]> {
  try {
    console.log("🔥 Fetching trending products...");

    // Intentar obtener productos con etiqueta "trending" usando slug
    console.log('🔍 Trying to get products with "trending" tag slug...');
    const filters: ProductFilters = {
      tags: ["trending"], // Usar slug
    };
    const response = await getProducts(1, limit, filters);
    console.log(
      `📦 Trending products found with slug: ${response.products.length}`
    );

    if (response.products.length > 0) {
      console.log("✅ Successfully found trending products with slug!");
      return response.products;
    }

    // Si no hay productos con etiqueta "trending", usar productos destacados como fallback
    console.log(
      "⭐ No trending products found with slug, using featured products as fallback"
    );
    const fallbackResponse = await getProducts(1, limit, { featured: true });
    console.log(
      `📦 Featured products found: ${fallbackResponse.products.length}`
    );
    return fallbackResponse.products;
  } catch (error) {
    console.error("❌ Error fetching trending products:", error);
    // Fallback final: obtener productos destacados
    try {
      console.log("🔄 Attempting fallback to featured products...");
      const fallbackResponse = await getProducts(1, limit, { featured: true });
      console.log(
        `📦 Fallback featured products found: ${fallbackResponse.products.length}`
      );
      return fallbackResponse.products;
    } catch (fallbackError) {
      console.error(
        "❌ Error fetching fallback featured products:",
        fallbackError
      );
      return [];
    }
  }
}

// Función para obtener productos destacados para el home (con etiqueta "home")
export async function getHomeProducts(limit: number = 8): Promise<Product[]> {
  try {
    console.log("🏠 Fetching home products...");

    // Intentar obtener productos con etiqueta "home" usando slug
    console.log('🔍 Trying to get products with "home" tag slug...');
    const filters: ProductFilters = {
      tags: ["home"], // Usar slug
    };
    const response = await getProducts(1, limit, filters);
    console.log(
      `📦 Home products found with slug: ${response.products.length}`
    );

    if (response.products.length > 0) {
      console.log("✅ Successfully found home products with slug!");
      return response.products;
    }

    // Si no hay productos con etiqueta "home", usar productos destacados como fallback
    console.log(
      "⭐ No home products found with slug, using featured products as fallback"
    );
    const fallbackResponse = await getProducts(1, limit, { featured: true });
    console.log(
      `📦 Featured products found: ${fallbackResponse.products.length}`
    );
    return fallbackResponse.products;
  } catch (error) {
    console.error("❌ Error fetching home products:", error);
    // Fallback final: obtener productos destacados
    try {
      console.log("🔄 Attempting fallback to featured products...");
      const fallbackResponse = await getProducts(1, limit, { featured: true });
      console.log(
        `📦 Fallback featured products found: ${fallbackResponse.products.length}`
      );
      return fallbackResponse.products;
    } catch (fallbackError) {
      console.error(
        "❌ Error fetching fallback featured products:",
        fallbackError
      );
      return [];
    }
  }
}

// Función para obtener categorías de productos
export async function getProductCategories(): Promise<ProductCategory[]> {
  try {
    // Construir URL absoluta
    const isClient = typeof window !== "undefined";
    // En servidor, construir URL completa
    let baseUrl: string;
    if (isClient) {
      baseUrl = `${window.location.origin}/api/categories`;
    } else {
      // En servidor, usar la URL base del entorno o localhost:3000
      const host = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
                   `http://localhost:${process.env.PORT || 3000}`;
      baseUrl = `${host}/api/categories`;
    }

    const response = await fetch(baseUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        errorData.error || `Error fetching categories: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Función para obtener productos relacionados
export async function getRelatedProducts(
  productId: number,
  limit: number = 4
): Promise<Product[]> {
  try {
    // Primero obtenemos el producto para ver sus categorías
    const response = await fetch(
      `${API_CONFIG.baseUrl}/products/${productId}`,
      {
        headers: createAuthHeaders(),
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      return [];
    }

    const product: WordPressProduct = await response.json();
    const categoryIds = product.categories.map((cat) => cat.id);

    if (categoryIds.length === 0) {
      return [];
    }

    // Obtenemos productos de las mismas categorías
    const relatedResponse = await getProducts(1, limit * 2, {
      categories: categoryIds.map((id) => id.toString()),
    });

    // Filtramos el producto actual y limitamos los resultados
    return relatedResponse.products
      .filter((p) => p.id !== productId)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}

// Función para buscar productos
export async function searchProducts(
  query: string,
  page: number = 1,
  perPage: number = 12
): Promise<ProductsResponse> {
  return getProducts(page, perPage, { search: query });
}

// Función para obtener los banners desde WordPress
export async function getBanners(): Promise<Banner[]> {
  try {
    // Construir la URL base para la API REST de WordPress
    const wpApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace(
      "/wc/v3",
      "/wp/v2"
    );
    console.log("🔗 URL base de WordPress API:", wpApiUrl);

    console.log("🎯 Intentando obtener el ID de la categoría Banner...");
    const categoriesResponse = await fetch(
      `${wpApiUrl}/categories?slug=Banner`,
      {
        next: { revalidate: 300 }, // Cache por 5 minutos
      }
    );

    console.log(
      "📊 Estado de la respuesta de categorías:",
      categoriesResponse.status
    );

    if (!categoriesResponse.ok) {
      throw new Error(
        `Error obteniendo categoría banner: ${categoriesResponse.status} ${categoriesResponse.statusText}`
      );
    }

    const categories = await categoriesResponse.json();
    console.log("📦 Categorías encontradas:", categories);

    if (!categories.length) {
      console.error("❌ No se encontró la categoría banner");
      return [];
    }

    const categoryId = categories[0].id;
    console.log("🎯 ID de la categoría banner:", categoryId);

    console.log("🎯 Intentando obtener posts de la categoría...");
    const postsResponse = await fetch(
      `${wpApiUrl}/posts?categories=${categoryId}&_embed`,
      {
        next: { revalidate: 300 }, // Cache por 5 minutos
      }
    );

    console.log("📊 Estado de la respuesta de posts:", postsResponse.status);

    if (!postsResponse.ok) {
      throw new Error(
        `Error obteniendo posts de banner: ${postsResponse.status} ${postsResponse.statusText}`
      );
    }

    const posts: WordPressBanner[] = await postsResponse.json();
    console.log("📦 Posts de banner obtenidos:", posts);

    // Transformar los posts a un formato más simple para los banners
    const banners = posts.map(
      (post: WordPressBanner): Banner => ({
        id: post.id,
        title: post.title.rendered,
        content: post.content.rendered,
        imageUrl: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "",
        imageAlt:
          post._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ||
          post.title.rendered,
      })
    );

    console.log("✅ Banners transformados:", banners);
    return banners;
  } catch (error) {
    console.error("❌ Error al obtener banners:", error);
    return [];
  }
}

// Función para obtener colecciones (entradas con categoría "coleccion")
export async function getCollections(): Promise<Collection[]> {
  try {
    // Construir la URL base para la API REST de WordPress
    const wpApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace(
      "/wc/v3",
      "/wp/v2"
    );
    console.log("🔗 URL base de WordPress API para colecciones:", wpApiUrl);

    console.log("🎯 Intentando obtener el ID de la categoría coleccion...");
    const categoriesResponse = await fetch(
      `${wpApiUrl}/categories?slug=coleccion`,
      {
        next: { revalidate: 300 }, // Cache por 5 minutos
      }
    );

    console.log(
      "📊 Estado de la respuesta de categorías:",
      categoriesResponse.status
    );

    if (!categoriesResponse.ok) {
      throw new Error(
        `Error obteniendo categoría coleccion: ${categoriesResponse.status} ${categoriesResponse.statusText}`
      );
    }

    const categories = await categoriesResponse.json();
    console.log("📦 Categorías encontradas:", categories);

    if (!categories.length) {
      console.error("❌ No se encontró la categoría coleccion");
      return [];
    }

    const categoryId = categories[0].id;
    console.log("🎯 ID de la categoría coleccion:", categoryId);

    console.log("🎯 Intentando obtener posts de la categoría coleccion...");
    const postsResponse = await fetch(
      `${wpApiUrl}/posts?categories=${categoryId}&_embed&per_page=2`,
      {
        next: { revalidate: 300 }, // Cache por 5 minutos
      }
    );

    console.log("📊 Estado de la respuesta de posts:", postsResponse.status);

    if (!postsResponse.ok) {
      throw new Error(
        `Error obteniendo posts de coleccion: ${postsResponse.status} ${postsResponse.statusText}`
      );
    }

    const posts: WordPressCollection[] = await postsResponse.json();
    console.log("📦 Posts de coleccion obtenidos:", posts);

    // Transformar los posts a un formato más simple para las colecciones
    const collections = posts.map(
      (post: WordPressCollection): Collection => ({
        id: post.id,
        title: post.title.rendered,
        description: post.excerpt.rendered.replace(/<[^>]*>/g, ""), // Remover HTML del excerpt
        imageUrl: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "",
        imageAlt:
          post._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ||
          post.title.rendered,
      })
    );

    console.log("✅ Colecciones transformadas:", collections);
    return collections;
  } catch (error) {
    console.error("❌ Error al obtener colecciones:", error);
    return [];
  }
}
