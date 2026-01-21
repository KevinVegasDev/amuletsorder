import { getTrendingProducts } from "./wordpress-api";
import { Product } from "../types/product";

/**
 * Obtener productos trending desde WordPress
 * Función helper que puede usarse en Server Components
 * Solo retorna los primeros 3 productos (índices 0, 1, 2)
 */
export async function getTrendingProductsData(): Promise<Product[]> {
  const products = await getTrendingProducts(3);
  // Asegurar que solo retornamos máximo 3 productos
  return products.slice(0, 3);
}
