import { Suspense } from "react";
import MarketView from "../../MarketView";
import ProductSkeleton from "../../../components/ProductSkeleton";

export const dynamic = "force-dynamic";

interface MarketCategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function MarketCategoryPage({ params }: MarketCategoryPageProps) {
  await params;
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
