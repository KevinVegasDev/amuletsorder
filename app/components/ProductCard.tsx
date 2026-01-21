"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "../types/product";
import { HeartIcon } from "./icons";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";

interface ProductCardProps {
  product: Product;
  className?: string;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  showCartButtons?: boolean; // Show "Add to Cart" and "Buy Now" buttons (only in market)
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = "",
  onAddToCart,
  onAddToWishlist,
  showCartButtons = false,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isHeartHovered, setIsHeartHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const isProcessingRef = useRef(false);

  // Get wishlist from context - using optimized isInWishlist for O(1) lookup
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  
  // Check if product is in wishlist - O(1) lookup instead of O(n) array search
  const isLiked = isInWishlist(product.id);

  const primaryImage = product.images[0];
  const secondaryImage = product.images[1];

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent double clicks
    const target = e.currentTarget as HTMLButtonElement;
    if (target.disabled) {
      return;
    }
    
    // Temporarily disable button to prevent double clicks
    target.disabled = true;
    setTimeout(() => {
      target.disabled = false;
    }, 300);
    
    // Check current state before toggle
    const wasLiked = isLiked;
    
    // Toggle wishlist - add if not liked, remove if liked
    toggleWishlist(product);
    
    // Show toast notification
    if (wasLiked) {
      showToast(`${product.name} removed from saved items`, "info", 2000);
    } else {
      showToast(`${product.name} added to saved items`, "success", 2000);
    }
    
    // Call prop if exists (for backward compatibility)
    if (onAddToWishlist) {
      onAddToWishlist(product);
    }
  };

  const handleAddToCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevenir múltiples ejecuciones simultáneas
    if (isProcessingRef.current || isAddingToCart) {
      return;
    }
    
    // Validar stock antes de agregar
    if (!product.inStock) {
      showToast(`${product.name} is out of stock`, "error", 3000);
      return;
    }
    
    isProcessingRef.current = true;
    setIsAddingToCart(true);
    
    // Simular un pequeño delay para mostrar el estado de carga
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Usar el contexto para agregar al carrito (solo una vez)
    addToCart(product, 1);
    
    // Show toast notification
    showToast(`${product.name} added to cart`, "success", 2000);
    
    // NO llamar a onAddToCart prop porque ya usamos el contexto directamente
    // La prop es solo para retrocompatibilidad pero no debería duplicar la acción
    
    setIsAddingToCart(false);
    isProcessingRef.current = false;
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validar stock antes de agregar
    if (!product.inStock || isBuyingNow) {
      if (!product.inStock) {
        showToast(`${product.name} is out of stock`, "error", 3000);
      }
      return;
    }
    
    setIsBuyingNow(true);
    
    // Simular un pequeño delay para mostrar el estado de carga
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Agregar al carrito y redirigir a checkout
    addToCart(product, 1);
    showToast(`${product.name} added to cart`, "success", 2000);
    
    // Redirigir a checkout después de un breve delay
    setTimeout(() => {
      window.location.href = "/checkout";
    }, 500);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div
      className={`group relative bg-white p-1 overflow-hidden flex flex-col w-full transition-all duration-300 ease-in-out hover:scale-[1.01] hover:z-10 ${className}`}
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
                <p className="text-sm">No image</p>
              </div>
            </div>
          )}

          {/* Heart button - always visible, shows filled when liked */}
            <button
            type="button"
              onClick={handleAddToWishlist}
              onMouseEnter={() => setIsHeartHovered(true)}
              onMouseLeave={() => setIsHeartHovered(false)}
            className="absolute bottom-2 right-2 z-20 p-1 cursor-pointer transition-transform duration-200 hover:scale-110"
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
            >
              <HeartIcon
                color="var(--color-negro)"
                filled={isLiked || isHeartHovered}
              />
            </button>

        </div>

        {/* Información del producto */}
        <div className="flex flex-col text-[24px] font-light">
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

      {/* Botones de acción - Solo en market, siempre visibles */}
      {showCartButtons && (
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={handleAddToCartClick}
            disabled={!product.inStock || isAddingToCart}
            className="flex-1 px-4 py-2.5 bg-white text-negro font-medium text-sm rounded hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {isAddingToCart ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-negro"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Adding...</span>
              </>
            ) : (
              "Add to Cart"
            )}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!product.inStock || isBuyingNow}
            className="flex-1 px-4 py-2.5 bg-negro text-white font-medium text-sm rounded hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {isBuyingNow ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              "Buy Now"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
