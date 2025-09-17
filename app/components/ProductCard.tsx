"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "../types/product";
import { HeartIcon } from "./icons";

interface ProductCardProps {
  product: Product;
  className?: string;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = "",
  onAddToCart,
  onAddToWishlist,
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div
      className={`group relative bg-white p-1 overflow-hidden flex flex-col w-full max-w-[378px] mx-auto transform transition-all duration-300 ease-in-out hover:scale-[1.02] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/market/product/${product.slug}`}
        className="h-full flex flex-col gap-2"
      >
        {/* Imagen del producto */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
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
                alt={primaryImage.alt || product.name}
                fill
                className={`object-cover object-center transition-all duration-500 ${
                  isHovered && secondaryImage ? "opacity-0" : "opacity-100"
                } ${imageLoading ? "scale-110 blur-sm" : "scale-100 blur-0"}`}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageError(true)}
                sizes="(min-width: 1280px) 45vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                quality={85}
                loading="lazy"
              />

              {/* Imagen secundaria para hover */}
              {secondaryImage && (
                <Image
                  src={secondaryImage.src}
                  alt={secondaryImage.alt || product.name}
                  fill
                  className={`object-cover object-center transition-all duration-500 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                  sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  quality={85}
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-gray-400 text-center">
                <svg
                  className="w-12 h-12 mx-auto mb-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
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
        <div className="flex flex-col font-teko text-[24px] font-light">
          <div className="flex justify-between w-full">
            <div className="h-[60px] flex-1 max-w-[192px] flex items-center">
              <p className="text-negro leading-none">{product.name}</p>
            </div>
            <span className="text-negro leading-none ml-3 self-center">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
