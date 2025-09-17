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
      className={`grid grid-cols-[repeat(auto-fit,minmax(329px,1fr))] gap-6 justify-start transition-all duration-300 ease-in-out ${className}`}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
