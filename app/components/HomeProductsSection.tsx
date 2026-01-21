"use client";

import React from "react";
import { ProductCategory } from "../types/product";
import HomeCategoryCard from "./HomeCategoryCard";

interface HomeProductsSectionProps {
  className?: string;
  categories: ProductCategory[];
  categoryImages: Record<string, string>;
}

const HomeProductsSection: React.FC<HomeProductsSectionProps> = ({
  className = "",
  categories,
  categoryImages,
}) => {
  // Máximo 7 categorías
  const homeCategories = categories.slice(0, 7);

  if (homeCategories.length === 0) {
    return null;
  }

  return (
    <section className={`py-4 px-[50px] rounded-2xl ${className}`}>
      {/* Título arriba a la izquierda */}
      <div className="p-4 max-w-[1920px] mx-auto justify-center items-center">
        <h2 className="text-4xl font-bold text-black ">
        Shop by category
        </h2>
      </div>

      {/* Flex row con las cards - máximo 7 */}
      <div className="flex flex-row gap-4 mx-auto max-w-[1920px] justify-center items-center">
        {homeCategories.map((category) => (
          <HomeCategoryCard
            key={category.id}
            category={category}
            imageUrl={categoryImages[category.slug]}
          />
        ))}
      </div>
    </section>
  );
};

export default HomeProductsSection;
