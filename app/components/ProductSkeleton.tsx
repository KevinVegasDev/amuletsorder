'use client';

interface ProductSkeletonProps {
  count?: number;
  className?: string;
}

const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 6, className = "" }) => {
  return (
    <div className={`grid grid-cols-[repeat(auto-fit,minmax(329px,1fr))] gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white border border-gray-100 rounded-lg overflow-hidden animate-pulse">
          <div className="aspect-[3/4] bg-gray-200"></div>
          <div className="p-4 space-y-3">
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="flex items-center gap-2">
              <div className="h-5 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;