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
  const homeCategories = (categories ?? []).slice(0, 7);

  return (
    <section className={`py-4 px-[50px] rounded-2xl ${className}`}>
      <div className="p-4 max-w-[1920px] mx-auto justify-center py-16 items-center">
        <h2 className="text-4xl font-bold text-black">
          Shop by category
        </h2>
      </div>

      {homeCategories.length > 0 ? (
        <div className="flex flex-row gap-4 mx-auto max-w-[1920px]">
          {homeCategories.map((category) => (
            <HomeCategoryCard
              key={category.id}
              category={category}
              imageUrl={categoryImages?.[category.slug]}
            />
          ))}
        </div>
      ) : (
        <div className="max-w-[1920px] mx-auto py-8 text-center text-gray-500 text-sm">
          No categories available at the moment.
        </div>
      )}
    </section>
  );
};

export default HomeProductsSection;
