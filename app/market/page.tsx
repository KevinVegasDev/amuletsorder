import { Suspense } from "react";
import MarketView from "./MarketView";
import ProductSkeleton from "../components/ProductSkeleton";

// Evitar prerender en build: fetches a /api usan localhost (no existe en build)
// y CatalogLayout usa useSearchParams (requieren Suspense)
export const dynamic = "force-dynamic";

export default async function Market() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="w-full max-w-[1920px] mx-auto px-12">
        <Suspense
          fallback={
            <div className="py-8">
              <ProductSkeleton count={12} className="mb-8" />
            </div>
          }
        >
          <MarketView />
        </Suspense>
      </div>
    </main>
  );
}
