"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '../types/product';
import { HeartIcon } from './icons';

interface ProductCardProps {
  product: Product;
  className?: string;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = '',
  onAddToCart,
  onAddToWishlist
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isHeartHovered, setIsHeartHovered] = useState(false);

  const primaryImage = product.images[0];
  const secondaryImage = product.images[1];



  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    if (onAddToWishlist) {
      onAddToWishlist(product);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div 
      className={`group relative bg-white border border-gray-200 overflow-hidden h-full flex flex-col ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/market/product/${product.slug}`} className="block">
        {/* Imagen del producto */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 p-1">
          {/* Badge de SOLD OUT */}
          {!product.inStock && (
            <div className="absolute top-2 left-2 z-10 bg-white text-black text-xs font-semibold px-3 py-1.5 shadow-lg">
              SOLD OUT
            </div>
          )}

          {/* Imagen principal */}
          {primaryImage && !imageError ? (
            <>
              <Image
                src={primaryImage.src}
                alt={primaryImage.alt}
                fill
                className={`object-cover transition-all duration-500 ${
                  isHovered && secondaryImage ? 'opacity-0' : 'opacity-100'
                } ${
                  imageLoading ? 'scale-110 blur-sm' : 'scale-100 blur-0'
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
              />
              
              {/* Imagen secundaria para hover */}
              {secondaryImage && (
                <Image
                  src={secondaryImage.src}
                  alt={secondaryImage.alt}
                  fill
                  className={`object-cover transition-all duration-500 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-gray-400 text-center">
                <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <p className="text-sm">Sin imagen</p>
              </div>
            </div>
          )}

          {/* Botón de corazón */}
          {onAddToWishlist && (
            <button
              onClick={handleAddToWishlist}
              onMouseEnter={() => setIsHeartHovered(true)}
              onMouseLeave={() => setIsHeartHovered(false)}
              className="absolute bottom-2 right-2 z-10 p-1 cursor-pointer"
              aria-label="Agregar a favoritos"
            >
              <HeartIcon 
                color="var(--color-negro)" 
                filled={isLiked || isHeartHovered}
              />
            </button>
          )}
        </div>

        {/* Información del producto */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Título y precio con justify-between */}
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 group-hover:text-negro transition-colors duration-200 text-sm leading-tight flex-1 mr-2">
              {product.name}
            </h3>
            <div className="flex flex-col items-end">
              {product.onSale && product.salePrice ? (
                <>
                  <span className="text-lg font-bold text-negro">
                    {formatPrice(product.salePrice)}
                  </span>
                  <span className="text-xs text-gray-500 line-through">
                    {formatPrice(product.regularPrice)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-negro">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;