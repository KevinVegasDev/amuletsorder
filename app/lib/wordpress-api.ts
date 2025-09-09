// Utilidades para conectar con WordPress API y obtener productos de Printful

import { 
  WordPressProduct, 
  Product, 
  ProductsResponse, 
  ProductFilters,
  WordPressAPIConfig,
  ProductImage,
  ProductCategory,
  ProductTag,
  WordPressCategory
} from '../types/product';

// Configuración de la API de WordPress (solo para funciones que aún usan llamadas directas)
const API_CONFIG: WordPressAPIConfig = {
  baseUrl: process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://tu-sitio-wordpress.com/wp-json/wc/v3',
  consumerKey: process.env.WORDPRESS_CONSUMER_KEY || '',
  consumerSecret: process.env.WORDPRESS_CONSUMER_SECRET || '',
  version: 'v3'
};

// Función para crear headers de autenticación
function createAuthHeaders(): HeadersInit {
  const auth = Buffer.from(`${API_CONFIG.consumerKey}:${API_CONFIG.consumerSecret}`).toString('base64');
  return {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
  };
}

// Función para transformar producto de WordPress a nuestro tipo Product
export function transformWordPressProduct(wpProduct: WordPressProduct): Product {
  const images: ProductImage[] = wpProduct.images.map(img => ({
    id: img.id,
    src: img.src,
    alt: img.alt || wpProduct.name,
    name: img.name || wpProduct.name
  }));

  const categories: ProductCategory[] = wpProduct.categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug
  }));

  const tags: ProductTag[] = wpProduct.tags.map(tag => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug
  }));

  return {
    id: wpProduct.id,
    name: wpProduct.name,
    slug: wpProduct.slug,
    description: wpProduct.description,
    shortDescription: wpProduct.short_description,
    price: parseFloat(wpProduct.price) || 0,
    regularPrice: parseFloat(wpProduct.regular_price) || 0,
    salePrice: wpProduct.sale_price ? parseFloat(wpProduct.sale_price) : undefined,
    onSale: wpProduct.on_sale,
    sku: wpProduct.sku,
    images,
    categories,
    tags,
    inStock: wpProduct.stock_status === 'instock',
    stockQuantity: wpProduct.stock_quantity ?? undefined,
    averageRating: parseFloat(wpProduct.average_rating) || 0,
    ratingCount: wpProduct.rating_count,
    permalink: wpProduct.permalink,
    featured: wpProduct.featured,
    // Buscar datos de Printful en meta_data
    printfulSyncProductId: (() => {
      const syncProductMeta = wpProduct.meta_data.find(meta => meta.key === '_printful_sync_product_id');
      return syncProductMeta?.value ? Number(syncProductMeta.value) : undefined;
    })()
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
      per_page: perPage.toString()
    });

    // Aplicar filtros
    if (filters) {
      if (filters.categories && filters.categories.length > 0) {
        params.append('categories', filters.categories.join(','));
      }
      if (filters.tags && filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }
      if (filters.featured) {
        params.append('featured', 'true');
      }
      if (filters.onSale) {
        params.append('on_sale', 'true');
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.sortBy) {
        params.append('sort_by', filters.sortBy);
      }
      if (filters.sortOrder) {
        params.append('sort_order', filters.sortOrder);
      }
      if (filters.priceRange) {
        params.append('min_price', filters.priceRange.min.toString());
        params.append('max_price', filters.priceRange.max.toString());
      }
    }

    const response = await fetch(`/api/products?${params}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Error fetching products: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// Función para obtener un producto por slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/products?slug=${slug}`, {
      headers: createAuthHeaders(),
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      throw new Error(`Error fetching product: ${response.status} ${response.statusText}`);
    }

    const wpProducts: WordPressProduct[] = await response.json();
    
    if (wpProducts.length === 0) {
      return null;
    }

    return transformWordPressProduct(wpProducts[0]);
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
}

// Función para obtener productos destacados
export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  try {
    const response = await getProducts(1, limit, { featured: true });
    return response.products;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

// Función para obtener categorías de productos
export async function getProductCategories(): Promise<ProductCategory[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/products/categories?per_page=100`, {
      headers: createAuthHeaders(),
      next: { revalidate: 3600 } // Cache por 1 hora
    });

    if (!response.ok) {
      throw new Error(`Error fetching categories: ${response.status} ${response.statusText}`);
    }

    const categories: WordPressCategory[] = await response.json();
    return categories.map((cat: WordPressCategory): ProductCategory => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Función para obtener productos relacionados
export async function getRelatedProducts(productId: number, limit: number = 4): Promise<Product[]> {
  try {
    // Primero obtenemos el producto para ver sus categorías
    const response = await fetch(`${API_CONFIG.baseUrl}/products/${productId}`, {
      headers: createAuthHeaders(),
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      return [];
    }

    const product: WordPressProduct = await response.json();
    const categoryIds = product.categories.map(cat => cat.id);

    if (categoryIds.length === 0) {
      return [];
    }

    // Obtenemos productos de las mismas categorías
    const relatedResponse = await getProducts(1, limit * 2, {
      categories: categoryIds.map(id => id.toString())
    });

    // Filtramos el producto actual y limitamos los resultados
    return relatedResponse.products
      .filter(p => p.id !== productId)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching related products:', error);
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