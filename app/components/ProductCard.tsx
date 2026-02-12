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
  showCartButtons?: boolean;
  /** Filtro visible: imagen 306px; filtro oculto: imagen 439.8px (crece con el ancho) */
  filtersVisible?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = "",
  onAddToWishlist,
  showCartButtons = false,
  filtersVisible = true,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isHeartHovered, setIsHeartHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const isProcessingRef = useRef(false);

  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const isLiked = isInWishlist(product.id);
  const primaryImage = product.images[0];
  const secondaryImage = product.images[1];
  const categoryName = product.categories?.[0]?.name ?? "";

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLButtonElement;
    if (target.disabled) return;
    target.disabled = true;
    setTimeout(() => { target.disabled = false; }, 300);
    const wasLiked = isLiked;
    toggleWishlist(product);
    showToast(wasLiked ? `${product.name} removed from saved items` : `${product.name} added to saved items`, wasLiked ? "info" : "success", 2000);
    onAddToWishlist?.(product);
  };

  const handleAddToCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isProcessingRef.current || isAddingToCart) return;
    if (!product.inStock) {
      showToast(`${product.name} is out of stock`, "error", 3000);
      return;
    }
    isProcessingRef.current = true;
    setIsAddingToCart(true);
    await new Promise((r) => setTimeout(r, 300));
    addToCart(product, 1);
    showToast(`${product.name} added to cart`, "success", 2000);
    setIsAddingToCart(false);
    isProcessingRef.current = false;
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock || isBuyingNow) {
      if (!product.inStock) showToast(`${product.name} is out of stock`, "error", 3000);
      return;
    }
    setIsBuyingNow(true);
    await new Promise((r) => setTimeout(r, 300));
    addToCart(product, 1);
    showToast(`${product.name} added to cart`, "success", 2000);
    setTimeout(() => { window.location.href = "/checkout"; }, 500);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

  const discountPercent =
    product.onSale && product.regularPrice > 0
      ? Math.round((1 - product.price / product.regularPrice) * 100)
      : 0;

  return (
    <div
      className={`flex flex-col gap-[14px] w-full min-h-[446px] overflow-hidden transition-all duration-300 ease-in-out hover:z-10 ${className}`}
    >
      {/* Imagen: móvil 246px; desktop 306px con filtro abierto, 439.8px con filtro cerrado */}
      <div
        className={`relative w-full h-[246px] rounded-[16px] overflow-hidden bg-gray-50 flex-shrink-0 transition-[height] duration-300 ease-in-out ${filtersVisible ? "lg:h-[306px]" : "lg:h-[439.8px]"
          }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!product.inStock && (
          <div className="absolute top-2 left-2 z-10  text-black text-xs font-semibold px-3 py-1.5 shadow-lg rounded">
            SOLD OUT
          </div>
        )}

        <Link href={`/market/product/${product.slug}`} prefetch className="block w-full h-full">
          {primaryImage && !imageError ? (
            <>
              <Image
                src={primaryImage.src}
                alt={primaryImage.alt || product.name}
                fill
                className={`object-cover object-center transition-all duration-500 ${isHovered && secondaryImage ? "opacity-0" : "opacity-100"
                  } ${imageLoading ? "scale-110 blur-sm" : "scale-100 blur-0"}`}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageError(true)}
                sizes="430px"
                quality={85}
                loading="lazy"
              />
              {secondaryImage && (
                <Image
                  src={secondaryImage.src}
                  alt={secondaryImage.alt || product.name}
                  fill
                  className={`object-cover object-center transition-all duration-500 ${isHovered ? "opacity-100" : "opacity-0"
                    }`}
                  sizes="338px"
                  quality={85}
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
        </Link>
      </div>

      {/* Título, categoría, precio, descuento */}
      <div className="flex flex-col gap-1 flex-1 min-h-0">
        <Link href={`/market/product/${product.slug}`} prefetch className="flex flex-col gap-1">
          <p className="md:text-[20px] text-[16px] font-medium text-negro leading-tight">{product.name}</p>
          {categoryName && (
            <p className="md:text-[16px] text-[14px] font-light text-negro">{categoryName}</p>
          )}
          <div className="flex flex-wrap items-center gap-1 text-[16px] font-medium text-negro">
            <span>{formatPrice(product.price)}</span>
            {product.onSale && product.regularPrice > 0 && (
              <>
                <span className="text-negro">—</span>
                <span className="text-rosa line-through">{formatPrice(product.regularPrice)}</span>
                <span className="text-rosa">{discountPercent}% OFF</span>
              </>
            )}
          </div>
        </Link>
      </div>

      {/* CTAs: flex-col gap-4px; Buy now primero y ancho completo; luego Add to cart y Liked */}
      {showCartButtons && (
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!product.inStock || isBuyingNow}
            className="w-full bg-negro text-mostaza py-[12px] rounded-[12px] font-medium text-[16px] transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isBuyingNow ? (
              <span className="inline-block h-4 w-4 border-2 border-mostaza border-t-transparent rounded-full animate-spin" />
            ) : (
              "Buy now"
            )}
          </button>
          <div className="flex flex-row md:gap-2 gap-1 w-full">
            <button
              type="button"
              onClick={handleAddToCartClick}
              disabled={!product.inStock || isAddingToCart}
              className="flex-1 bg-negro text-white py-[12px] rounded-[12px] font-medium text-[16px] transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isAddingToCart ? (
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Add to Cart"
              )}
            </button>
            <button
              type="button"
              onClick={handleAddToWishlist}
              onMouseEnter={() => setIsHeartHovered(true)}
              onMouseLeave={() => setIsHeartHovered(false)}
              className="flex items-center justify-center bg-negro rounded-[12px] p-[12px] transition-opacity hover:opacity-90 shrink-0"
              aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
            >
              <HeartIcon
                color={isLiked ? "var(--color-rosa)" : "var(--color-blanco)"}
                filled={true}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
