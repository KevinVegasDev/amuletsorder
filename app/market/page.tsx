import { Suspense } from "react";
import CatalogLayout from "../components/CatalogLayout";
import SearchBar from "../components/SearchBar";
import ProductSkeleton from "../components/ProductSkeleton";

// Evitar prerender en build: fetches a /api usan localhost (no existe en build)
// y CatalogLayout usa useSearchParams (requieren Suspense)
export const dynamic = "force-dynamic";

export default async function Market() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-12">
        <Suspense
          fallback={
            <div className="py-8">
              <ProductSkeleton count={12} className="mb-8" />
            </div>
          }
        >
          {/* Barra de búsqueda con botón Hide filters */}
          <SearchBar />

          {/* Catálogo de productos (usa useSearchParams) */}
          <div className="py-8">
            <CatalogLayout showFilters={true} />
          </div>
        </Suspense>
      </div>
    </main>
  );
}
