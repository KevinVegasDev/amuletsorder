"use client";

import React from "react";
import Link from "next/link";
import { Product, ProductCategory } from "../types/product";
import ProductCard from "./ProductCard";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

interface CategorySectionProps {
  category: ProductCategory;
  products: Product[];
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  products,
  onAddToCart,
  onAddToWishlist,
}) => {
  if (products.length === 0) return null;

  return (
    <section className="py-12 px-[50px] max-w-[1440px] mx-auto">
      {/* Header de la categoría */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold text-black uppercase tracking-tight">
          {category.name}
        </h2>
        <Link
          href={`/market?category=${category.slug}`}
          className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors duration-200 group"
        >
          <span className="text-sm font-medium">View all</span>
          <ChevronRightIcon className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Grid de productos horizontal */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onAddToWishlist={onAddToWishlist}
            className="h-full"
          />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
