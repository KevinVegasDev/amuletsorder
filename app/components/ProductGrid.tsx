"use client";

import React from "react";
import { Product } from "../types/product";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  className?: string;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  className = "",
  onAddToCart,
  onAddToWishlist,
}) => {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 justify-start items-stretch transition-all duration-300 ease-in-out ${className}`}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          showCartButtons={true}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
