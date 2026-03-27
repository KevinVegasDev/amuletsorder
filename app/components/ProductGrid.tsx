"use client";

import React, { useState, useEffect } from "react";
import { Product } from "../types/product";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  className?: string;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  /** Si los filtros están visibles: cards 338px; si están ocultos: cards 443px. En móvil siempre 2 columnas de 200px. */
  filtersVisible?: boolean;
}

const CARD_WIDTH_WITH_FILTERS = 338;
const CARD_WIDTH_WITHOUT_FILTERS = 443;
const MOBILE_CARD_WIDTH = 200;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(max-width: 1023px)");
    setIsMobile(m.matches);
    const fn = () => setIsMobile(m.matches);
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, []);
  return isMobile;
};

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  className = "",
  onAddToCart,
  onAddToWishlist,
  filtersVisible = true,
}) => {
  const isMobile = useIsMobile();
  const cardWidthPx = filtersVisible ? CARD_WIDTH_WITH_FILTERS : CARD_WIDTH_WITHOUT_FILTERS;
  const gridCols = isMobile ? "repeat(2, 1fr)" : `repeat(4, ${cardWidthPx}px)`;

  return (
    <div
      className={`grid gap-[14px] transition-[grid-template-columns] duration-300 ease-in-out ${className}`}
      style={{ gridTemplateColumns: gridCols }}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          showCartButtons={true}
          filtersVisible={filtersVisible}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
