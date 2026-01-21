import { getRecommendedProducts } from "./wordpress-api";
import { Product } from "../types/product";

/**
 * Obtener productos recomendados desde WordPress
 * Función helper que puede usarse en Server Components
 */
export async function getRecommendedProductsData(): Promise<Product[]> {
  const products = await getRecommendedProducts(20);
  return products;
}
