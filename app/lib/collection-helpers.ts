import { getCollections } from "./wordpress-api";
import { Collection } from "../types/product";

/**
 * Obtener todas las colecciones desde WordPress
 * Función helper que puede usarse en Server Components
 */
export async function getCollectionsData(): Promise<Collection[]> {
  const collections = await getCollections();
  return collections;
}
