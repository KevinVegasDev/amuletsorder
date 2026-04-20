// Utilidades para conectar con WordPress API y obtener productos de Printful

import {
  WordPressProduct,
  WordPressVariation,
  WordPressCategory,
  Product,
  ProductVariation,
  ProductAttribute,
  ProductsResponse,
  ProductFilters,
  WordPressAPIConfig,
  ProductImage,
  ProductCategory,
  ProductTag,
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

/** Base URL leída en runtime (evita env inlined en build en Vercel). Usar en servidor para home/categorías. */
function getWordPressBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
    process.env.WORDPRESS_API_URL ||
    "";
  if (url) return url.replace(/([^:])\/\/+/g, "$1/").replace(/\/+$/, "");
  return "http://localhost:3000/wp-json/wc/v3";
}

// Función para crear headers de autenticación
function createAuthHeaders(): HeadersInit {
  const auth = Buffer.from(
    `${API_CONFIG.consumerKey}:${API_CONFIG.consumerSecret}`,
  ).toString("base64");
  return {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json",
  };
}

// Función para transformar variación de WordPress a nuestro tipo ProductVariation
function transformWordPressVariation(
  wpVariation: WordPressVariation,
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
  variations?: ProductVariation[],
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
      ...(typeof (img as { caption?: string }).caption === "string" && {
        caption: (img as { caption?: string }).caption,
      }),
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
        (meta) => meta.key === "_printful_sync_product_id",
      );
      return syncProductMeta?.value ? Number(syncProductMeta.value) : undefined;
    })(),
  };
}

// Función para obtener todos los productos (usando API route del servidor)
export async function getProducts(
  page: number = 1,
  perPage: number = 12,
  filters?: ProductFilters,
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
      const host =
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
        `http://localhost:${process.env.PORT || 3000}`;
      baseUrl = `${host}/api/products`;
    }

    const url = `${baseUrl}?${params}`;

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
        throw new Error(
          "La solicitud tardó demasiado. Por favor, intenta nuevamente.",
        );
      }
      throw new Error(
        `Error de conexión: ${fetchError instanceof Error ? fetchError.message : "Error desconocido"}`,
      );
    }

    if (!response.ok) {
      // Primero verificar el código de estado para mensajes específicos
      let errorMessage = `Error fetching products: ${response.status}`;

      // Mensajes más específicos para errores comunes basados en el código de estado
      if (response.status === 503) {
        errorMessage =
          "El servicio no está disponible temporalmente. Por favor, intenta nuevamente en unos momentos.";
      } else if (response.status === 500) {
        errorMessage =
          "Error interno del servidor. Por favor, intenta nuevamente más tarde.";
      } else if (response.status === 404) {
        errorMessage =
          "No se encontró la ruta de la API. Por favor, verifica la configuración.";
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
          if (
            errorText &&
            errorText.length < 200 &&
            !errorText.includes("<!DOCTYPE")
          ) {
            errorMessage = errorText;
          }
        }
      } catch (parseError) {
        // Si falla el parseo, usar el mensaje basado en el código de estado
        }

      console.error(`[getProducts] Error response: ${response.status} ${errorMessage}`);

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
  productId: number,
): Promise<ProductVariation[]> {
  try {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/products/${productId}/variations`,
      {
        headers: createAuthHeaders(),
        next: { revalidate: 300 },
      },
    );

    if (!response.ok) {
      // Si el producto no tiene variaciones, retornar array vacío
      if (response.status === 404) {
        return [];
      }
      throw new Error(
        `Error fetching variations: ${response.status} ${response.statusText}`,
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
      },
    );

    if (!response.ok) {
      throw new Error(
        `Error fetching product: ${response.status} ${response.statusText}`,
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
  limit: number = 8,
): Promise<Product[]> {
  try {
    const response = await getProducts(1, limit, { featured: true });
    return response.products;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

/**
 * Obtener ID de tag WooCommerce por slug (fetch directo a WooCommerce, como CollectionSection).
 * Evita /api y localhost, funciona desde cualquier host.
 */
async function fetchTagIdBySlug(slug: string): Promise<number | null> {
  try {
    const baseUrl =
      typeof window === "undefined" ? getWordPressBaseUrl() : API_CONFIG.baseUrl;
    const res = await fetch(
      `${baseUrl}/products/tags?slug=${encodeURIComponent(slug)}&per_page=1`,
      { headers: createAuthHeaders(), next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    const data: Array<{ id: number; slug: string }> = await res.json();
    return data[0]?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Obtener productos directamente de WooCommerce (sin /api).
 * Misma estrategia que getCollections: fetch a WordPress/WooCommerce externo.
 */
async function fetchProductsFromWooCommerce(
  page: number,
  perPage: number,
  filters?: { tagId?: number; featured?: boolean },
): Promise<ProductsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    status: "publish",
  });
  if (filters?.tagId) params.set("tag", filters.tagId.toString());
  if (filters?.featured) params.set("featured", "true");

  const baseUrl =
    typeof window === "undefined" ? getWordPressBaseUrl() : API_CONFIG.baseUrl;
  const res = await fetch(`${baseUrl}/products?${params}`, {
    headers: createAuthHeaders(),
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`WooCommerce products: ${res.status} ${res.statusText}`);
  }
  const wpProducts: WordPressProduct[] = await res.json();
  const total =
    parseInt(res.headers.get("X-WP-Total") ?? "0") || wpProducts.length;
  const totalPages = parseInt(res.headers.get("X-WP-TotalPages") ?? "1") || 1;
  const products = wpProducts.map((p) => transformWordPressProduct(p));
  return {
    products,
    total,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Productos recomendados: fetch directo a WooCommerce (como CollectionSection).
 * No usa /api ni localhost → funciona desde IP/dominio que no sea localhost.
 */
export async function getRecommendedProducts(
  limit: number = 10,
): Promise<Product[]> {
  try {
    const tagId = await fetchTagIdBySlug("recomendado");
    if (tagId) {
      const res = await fetchProductsFromWooCommerce(1, limit, { tagId });
      if (res.products.length > 0) return res.products;
    }
    const fallback = await fetchProductsFromWooCommerce(1, limit, {
      featured: true,
    });
    return fallback.products;
  } catch {
    try {
      const fallback = await fetchProductsFromWooCommerce(1, limit, {
        featured: true,
      });
      return fallback.products;
    } catch {
      return [];
    }
  }
}

/**
 * Productos trending: fetch directo a WooCommerce (como CollectionSection).
 * No usa /api ni localhost → funciona desde IP/dominio que no sea localhost.
 */
export async function getTrendingProducts(
  limit: number = 3,
): Promise<Product[]> {
  try {
    const tagId = await fetchTagIdBySlug("trending");
    if (tagId) {
      const res = await fetchProductsFromWooCommerce(1, limit, { tagId });
      if (res.products.length > 0) return res.products;
    }
    const fallback = await fetchProductsFromWooCommerce(1, limit, {
      featured: true,
    });
    return fallback.products;
  } catch {
    try {
      const fallback = await fetchProductsFromWooCommerce(1, limit, {
        featured: true,
      });
      return fallback.products;
    } catch {
      return [];
    }
  }
}

/**
 * Productos con tag "home" para Shop by category.
 * En servidor (Vercel/producción): llama a WordPress directamente, sin autollamada a /api.
 * En cliente: usa /api/products como antes.
 */
export async function getHomeProducts(limit: number = 8): Promise<Product[]> {
  const isClient = typeof window !== "undefined";

  if (!isClient) {
    // Servidor (producción/local): fetch directo a WooCommerce, igual que getRecommendedProducts.
    try {
      const tagId = await fetchTagIdBySlug("home");
      if (tagId) {
        const res = await fetchProductsFromWooCommerce(1, limit, { tagId });
        if (res.products.length > 0) return res.products;
      }
      const fallback = await fetchProductsFromWooCommerce(1, limit, {
        featured: true,
      });
      return fallback.products;
    } catch {
      try {
        const fallback = await fetchProductsFromWooCommerce(1, limit, {
          featured: true,
        });
        return fallback.products;
      } catch {
        return [];
      }
    }
  }

  // Cliente: usar /api/products (window.location.origin)
  try {
    const filters: ProductFilters = { tags: ["home"] };
    const response = await getProducts(1, limit, filters);
    if (response.products.length > 0) return response.products;
    const fallbackResponse = await getProducts(1, limit, { featured: true });
    return fallbackResponse.products;
  } catch {
    try {
      const fallbackResponse = await getProducts(1, limit, { featured: true });
      return fallbackResponse.products;
    } catch {
      return [];
    }
  }
}

function transformWordPressCategory(wp: WordPressCategory): ProductCategory {
  return {
    id: wp.id,
    name: wp.name,
    slug: wp.slug,
    description: wp.description,
    count: wp.count,
  };
}

/** Llamada directa a WordPress (solo servidor). Evita autollamada a /api/categories en Vercel. */
async function fetchCategoriesFromWordPress(
  perPage: number = 100,
): Promise<ProductCategory[]> {
  const base = getWordPressBaseUrl();
  const params = new URLSearchParams({ per_page: perPage.toString() });
  const url = `${base}/products/categories?${params}`;
  const response = await fetch(url, {
    headers: createAuthHeaders(),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`WordPress categories: ${response.status}`);
  }
  const wpCategories: WordPressCategory[] = await response.json();
  return wpCategories.map(transformWordPressCategory);
}

// Función para obtener categorías de productos
export async function getProductCategories(): Promise<ProductCategory[]> {
  try {
    const isClient = typeof window !== "undefined";

    if (!isClient) {
      // En servidor (Vercel, Node): llamar a WordPress directamente.
      // Así no dependemos de NEXT_PUBLIC_APP_URL ni de autollamada a /api/categories.
      return await fetchCategoriesFromWordPress(100);
    }

    // En cliente: llamar a la API route de nuestra app
    const baseUrl = `${window.location.origin}/api/categories`;
    const response = await fetch(baseUrl, { cache: "no-store" });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        errorData.error || `Error fetching categories: ${response.status}`,
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
  limit: number = 4,
): Promise<Product[]> {
  try {
    // Primero obtenemos el producto para ver sus categorías
    const response = await fetch(
      `${API_CONFIG.baseUrl}/products/${productId}`,
      {
        headers: createAuthHeaders(),
        next: { revalidate: 300 },
      },
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
  perPage: number = 12,
): Promise<ProductsResponse> {
  return getProducts(page, perPage, { search: query });
}

// Función para obtener los banners desde WordPress
export async function getBanners(): Promise<Banner[]> {
  try {
    const wpApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace(
      "/wc/v3",
      "/wp/v2",
    );

    const categoriesResponse = await fetch(
      `${wpApiUrl}/categories?slug=Banner`,
      { next: { revalidate: 300 } },
    );

    if (!categoriesResponse.ok) {
      throw new Error(
        `Error obteniendo categoría banner: ${categoriesResponse.status} ${categoriesResponse.statusText}`,
      );
    }

    const categories = await categoriesResponse.json();
    if (!categories.length) return [];

    const categoryId = categories[0].id;
    const postsResponse = await fetch(
      `${wpApiUrl}/posts?categories=${categoryId}&_embed`,
      { next: { revalidate: 300 } },
    );

    if (!postsResponse.ok) {
      throw new Error(
        `Error obteniendo posts de banner: ${postsResponse.status} ${postsResponse.statusText}`,
      );
    }

    const posts: WordPressBanner[] = await postsResponse.json();
    return posts.map(
      (post: WordPressBanner): Banner => ({
        id: post.id,
        title: post.title.rendered,
        content: post.content.rendered,
        imageUrl: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "",
        imageAlt:
          post._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ||
          post.title.rendered,
      }),
    );
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}

// Función para obtener colecciones (entradas con categoría "coleccion")
export async function getCollections(): Promise<Collection[]> {
  try {
    const wpApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace(
      "/wc/v3",
      "/wp/v2",
    );

    const categoriesResponse = await fetch(
      `${wpApiUrl}/categories?slug=coleccion`,
      { next: { revalidate: 300 } },
    );

    if (!categoriesResponse.ok) {
      throw new Error(
        `Error obteniendo categoría coleccion: ${categoriesResponse.status} ${categoriesResponse.statusText}`,
      );
    }

    const categories = await categoriesResponse.json();
    if (!categories.length) return [];

    const categoryId = categories[0].id;
    const postsResponse = await fetch(
      `${wpApiUrl}/posts?categories=${categoryId}&_embed&per_page=2`,
      { next: { revalidate: 300 } },
    );

    if (!postsResponse.ok) {
      throw new Error(
        `Error obteniendo posts de coleccion: ${postsResponse.status} ${postsResponse.statusText}`,
      );
    }

    const posts: WordPressCollection[] = await postsResponse.json();
    return posts.map(
      (post: WordPressCollection): Collection => ({
        id: post.id,
        title: post.title.rendered,
        description: post.excerpt.rendered.replace(/<[^>]*>/g, ""),
        imageUrl: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "",
        imageAlt:
          post._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ||
          post.title.rendered,
      }),
    );
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

// Función para obtener el mensaje de la barra de anuncios
export async function getAnnouncementMessage(): Promise<string> {
  try {
    const wpApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace(
      "/wc/v3",
      "/wp/v2",
    );
    
    // Buscar la entrada por slug "announcementmessage"
    const response = await fetch(`${wpApiUrl}/posts?slug=announcementmessage`, {
      next: { revalidate: 300 }, // Cache por 5 minutos
    });

    if (!response.ok) {
      return "Free shipping on orders over $50";
    }

    const posts = await response.json();
    
    if (!posts || posts.length === 0) {
      return "Free shipping on orders over $50";
    }

    // Extraer texto plano del contenido HTML
    const contentHtml = posts[0].content?.rendered || "";
    const text = contentHtml.replace(/<[^>]*>/g, "").trim();
    
    // Reemplaza entidades HTML como &nbsp; por espacios (opcional)
    const cleanText = text.replace(/&nbsp;/g, " ");

    return cleanText || "Free shipping on orders over $50";
  } catch (error) {
    console.error("Error fetching announcement message:", error);
    return "Free shipping on orders over $50";
  }
}

// Función para obtener una página de WordPress por slug
export async function getWordPressPage(slug: string): Promise<{ title: string; contentHtml: string } | null> {
  try {
    const wpApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace(
      "/wc/v3",
      "/wp/v2",
    );
    
    // Buscar la página por slug
    const response = await fetch(`${wpApiUrl}/pages?slug=${slug}`, {
      next: { revalidate: 300 }, // Cache por 5 minutos
    });

    if (!response.ok) {
      return null;
    }

    const pages = await response.json();
    
    if (!pages || pages.length === 0) {
      // Intentar buscar como post si no se encuentra como page (frecuente confusión)
      const postResponse = await fetch(`${wpApiUrl}/posts?slug=${slug}`, {
        next: { revalidate: 300 },
      });
      
      if (!postResponse.ok) return null;
      const posts = await postResponse.json();
      
      if (!posts || posts.length === 0) return null;
      
      return {
        title: posts[0].title.rendered,
        contentHtml: posts[0].content.rendered,
      };
    }

    return {
      title: pages[0].title.rendered,
      contentHtml: pages[0].content.rendered,
    };
  } catch (error) {
    console.error(`Error fetching WordPress page (${slug}):`, error);
    return null;
  }
}
