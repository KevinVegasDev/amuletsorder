"use client";

import React, { useRef } from "react";
import Image from "next/image";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const homeCategories = (categories ?? []).slice(0, 7);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -340,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 340,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className={`py-4 px-4 md:px-[50px] rounded-2xl ${className}`}>
      <div className="flex flex-row justify-between items-center p-4 max-w-[1920px] mx-auto py-16">
        <h2 className="text-[24px] sm:text-4xl font-bold text-black">
          Shop by category
        </h2>

        {/* Controles de scroll - solo visible en lg (≤1024px) */}
        <div className="flex flex-row gap-2">
          <button
            onClick={scrollLeft}
            className="w-[44.8px] h-[44.8px] md:w-16 md:h-16 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
            aria-label="Scroll left"
          >
            <Image
              src="/left-arrow.svg"
              alt="Left arrow"
              width={64}
              height={64}
              className="w-full h-full"
            />
          </button>
          <button
            onClick={scrollRight}
            className="w-[44.8px] h-[44.8px] md:w-16 md:h-16 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
            aria-label="Scroll right"
          >
            <Image
              src="/right-arrow.svg"
              alt="Right arrow"
              width={64}
              height={64}
              className="w-full h-full"
            />
          </button>
        </div>
      </div>

      {homeCategories.length > 0 ? (
        <div
          ref={scrollContainerRef}
          className="flex flex-row gap-4 mx-auto max-w-[1920px] overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
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
