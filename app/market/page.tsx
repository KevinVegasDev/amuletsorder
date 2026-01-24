import { Suspense } from "react";
import CatalogLayout from "../components/CatalogLayout";
import CollectionStoriesNavigation from "../components/CollectionStoriesNavigation";
import ProductSkeleton from "../components/ProductSkeleton";
import { getProductCategories } from "../lib/wordpress-api";
import { loadProductsData } from "../lib/product-helpers";

// Evitar prerender en build: fetches a /api usan localhost (no existe en build)
// y CatalogLayout/CollectionStories usan useSearchParams (requieren Suspense)
export const dynamic = "force-dynamic";

export default async function Market() {
  // Obtener categorías de productos
  const categories = await getProductCategories();

  // Obtener productos para las imágenes de categorías
  const productsData = await loadProductsData({
    productLimit: 100, // Obtener más productos para tener imágenes de todas las categorías
    filterOptions: {
      excludeSlugs: ["uncategorized", "all"],
      excludeEmpty: true,
    },
  });

  // Filtrar categorías que tienen productos
  const categoriesWithProducts = categories.filter(
    (cat) => cat.count && cat.count > 0
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="">
        <Suspense
          fallback={
            <div className="px-12 py-8">
              <ProductSkeleton count={12} className="mb-8" />
            </div>
          }
        >
          {/* Navegación de categorías estilo Stories (usa useSearchParams) */}
          {categoriesWithProducts.length > 0 && (
            <CollectionStoriesNavigation
              categories={categoriesWithProducts}
              categoryImages={productsData.categoryImages}
            />
          )}

          {/* Catálogo de productos (usa useSearchParams) */}
          <div className="px-12 py-8">
            <CatalogLayout showFilters={true} />
          </div>
        </Suspense>
      </div>
    </main>
  );
}
