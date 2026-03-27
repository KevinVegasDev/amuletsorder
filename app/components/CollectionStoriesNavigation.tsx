"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import { ProductCategory } from "../types/product";

interface CollectionStoriesNavigationProps {
  categories: ProductCategory[];
  categoryImages: Record<string, string>; // slug -> imageUrl
  className?: string;
}

const CollectionStoriesNavigation: React.FC<CollectionStoriesNavigationProps> = ({
  categories,
  categoryImages,
  className = "",
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (categories.length === 0) {
    return null;
  }

  // Categoría actual: desde path (/market/category/xxx) o desde query (retrocompat)
  const categoryFromPath =
    pathname.startsWith("/market/category/") && pathname !== "/market/category"
      ? pathname.replace("/market/category/", "").split("/")[0]?.trim() || null
      : null;
  const currentCategory = categoryFromPath ?? searchParams.get("category");

  const handleCategoryClick = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category"); // ya no usamos category en query

    const basePath =
      currentCategory === categorySlug ? "/market" : `/market/category/${categorySlug}`;
    const query = params.toString();
    const newURL = query ? `${basePath}?${query}` : basePath;
    router.push(newURL, { scroll: false });
  };

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 overflow-x-auto scrollbar-hide bg-white border-b border-gray-200 ${className}`}
    >
      {/* Categorías */}
      {categories.map((category) => {
        const imageUrl = categoryImages[category.slug];
        const isActive = currentCategory === category.slug;
        
        return (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.slug)}
            className="flex flex-col items-center gap-2 min-w-[80px] flex-shrink-0 group cursor-pointer"
          >
            <div className={`relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-200 group-hover:scale-105 ${
              isActive 
                ? "border-negro scale-105" 
                : "border-gray-300 group-hover:border-negro"
            }`}>
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 64px, 80px"
                  className="object-cover"
                  quality={95}
                  priority={false}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-600">
                    {category.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <span className={`text-xs font-medium text-center max-w-[80px] truncate transition-colors ${
              isActive 
                ? "text-negro font-semibold" 
                : "text-gray-700 group-hover:text-negro"
            }`}>
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CollectionStoriesNavigation;
