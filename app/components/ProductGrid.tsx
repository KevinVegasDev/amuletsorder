"use client";

import React from 'react';
import { Product } from '../types/product';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  className?: string;
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
    large: number;
  };
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  className = '',
  columns = {
    mobile: 2,
    tablet: 3,
    desktop: 4,
    large: 4
  },
  onAddToCart,
  onAddToWishlist
}) => {
  // Generar clases de grid responsivo basado en las columnas
  const getGridClasses = () => {
    return `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 justify-items-center`;
  };

  // Componente de skeleton para loading
  const ProductSkeleton = () => (
    <div className="bg-white border border-gray-100 rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200"></div>
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
  );

  // Componente cuando no hay productos
  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" />
          <path d="M9 8V17H11V8H9ZM13 8V17H15V8H13Z" />
        </svg>
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">
        No se encontraron productos
      </h3>
      <p className="text-gray-500 max-w-md">
        No hay productos disponibles en este momento. Intenta ajustar los filtros o vuelve más tarde.
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className={`${getGridClasses()} ${className}`}>
        {Array.from({ length: columns.desktop * 2 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className={`grid grid-cols-1 ${className}`}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          className="w-full max-w-[329px] max-h-[432px]"
        />
      ))}
    </div>
  );
};

export default ProductGrid;