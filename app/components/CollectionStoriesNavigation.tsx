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

  const handleCategoryClick = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Si la categoría ya está seleccionada, limpiar el filtro
    if (params.get("category") === categorySlug) {
      params.delete("category");
    } else {
      // Si no, establecer la categoría
      params.set("category", categorySlug);
    }
    
    // Actualizar la URL
    const newURL = params.toString() 
      ? `${pathname}?${params.toString()}`
      : pathname;
    
    router.push(newURL, { scroll: false });
  };

  const currentCategory = searchParams.get("category");

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
