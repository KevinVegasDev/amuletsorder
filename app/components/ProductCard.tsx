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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isProcessingRef = useRef(false);

  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const isLiked = isInWishlist(product.id);
  const allImages = product.images || [];
  const currentImage = allImages[currentImageIndex] || allImages[0];
  const categoryName = product.categories?.[0]?.name ?? "";

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLButtonElement;
    if (target.disabled) return;
    target.disabled = true;
    setTimeout(() => {
      target.disabled = false;
    }, 300);
    const wasLiked = isLiked;
    toggleWishlist(product);
    showToast(
      wasLiked
        ? `${product.name} removed from saved items`
        : `${product.name} added to saved items`,
      wasLiked ? "info" : "success",
      2000,
    );
    onAddToWishlist?.(product);
  };

  const handleAddToCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Si el producto tiene variaciones/atributos, obligar a ir a la página de detalle
    const isVariable = product.type === "variable" || (product.attributes && product.attributes.length > 0);
    if (isVariable) {
      showToast("Please choose your options first", "info", 3000);
      window.location.href = `/market/product/${product.slug}`;
      return;
    }

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
    
    // Si el producto tiene variaciones/atributos, obligar a ir a la página de detalle
    const isVariable = product.type === "variable" || (product.attributes && product.attributes.length > 0);
    if (isVariable) {
      showToast("Please choose your options first", "info", 3000);
      window.location.href = `/market/product/${product.slug}`;
      return;
    }

    if (!product.inStock || isBuyingNow) {
      if (!product.inStock)
        showToast(`${product.name} is out of stock`, "error", 3000);
      return;
    }
    setIsBuyingNow(true);
    await new Promise((r) => setTimeout(r, 300));
    addToCart(product, 1);
    showToast(`${product.name} added to cart`, "success", 2000);
    setTimeout(() => {
      window.location.href = "/checkout";
    }, 500);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

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
        className={`relative w-full h-[246px] rounded-[16px] overflow-hidden flex-shrink-0 transition-[height] duration-300 ease-in-out ${
          filtersVisible ? "lg:h-[306px]" : "lg:h-[439.8px]"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!product.inStock && (
          <div className="absolute top-2 left-2 z-10 text-black text-xs font-semibold px-3 py-1.5 shadow-lg rounded">
            SOLD OUT
          </div>
        )}

        <Link
          href={`/market/product/${product.slug}`}
          prefetch
          className="block w-full h-full"
        >
          {allImages.length > 0 && !imageError ? (
            <div
              className="flex h-full transition-transform duration-300 ease-in-out"
              style={{
                width: `${allImages.length * 100}%`,
                transform: `translateX(-${(currentImageIndex * 100) / allImages.length}%)`,
              }}
            >
              {allImages.map((img, index) => (
                <div
                  key={img.id ?? img.src ?? index}
                  className="relative h-full"
                  style={{ width: `${100 / allImages.length}%` }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt || product.name}
                    fill
                    className="object-cover object-center"
                    onLoad={index === 0 ? () => setImageLoading(false) : undefined}
                    onError={index === 0 ? () => setImageError(true) : undefined}
                    sizes="430px"
                    quality={85}
                    loading={index === 0 ? "lazy" : "lazy"}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
        </Link>

        {/* Navigation arrows — only when more than 1 image */}
        {allImages.length > 1 && (
          <>
            {/* Left arrow */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentImageIndex((prev) =>
                  prev === 0 ? allImages.length - 1 : prev - 1
                );
              }}
              className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center cursor-pointer transition-opacity duration-200 hover:bg-white ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
              aria-label="Previous image"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Right arrow */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentImageIndex((prev) =>
                  prev === allImages.length - 1 ? 0 : prev + 1
                );
              }}
              className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center cursor-pointer transition-opacity duration-200 hover:bg-white ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
              aria-label="Next image"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Título, categoría, precio, descuento */}
      <div className="flex flex-col gap-1 flex-1 min-h-0">
        <Link
          href={`/market/product/${product.slug}`}
          prefetch
          className="flex flex-col gap-1"
        >
          <p className="md:text-[20px] text-[16px] font-medium text-negro leading-tight">
            {product.name}
          </p>
          {categoryName && (
            <p className="md:text-[16px] text-[14px] font-light text-negro">
              {categoryName}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1 text-[16px] font-medium text-negro">
            <span>{formatPrice(product.price)}</span>
            {product.onSale && product.regularPrice > 0 && (
              <>
                <span className="text-negro">—</span>
                <span className="text-rosa line-through">
                  {formatPrice(product.regularPrice)}
                </span>
                <span className="text-rosa">{discountPercent}% OFF</span>
              </>
            )}
          </div>
        </Link>
      </div>

      {/* CTAs: fila única gap-14px; Buy now y Add to Cart flex-1; Heart 43×43 */}
      {showCartButtons && (
        <div className="flex flex-col md:flex-row md:gap-[14px] gap-[4px] w-full">
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!product.inStock || isBuyingNow}
            className="w-full md:flex-1 md:w-auto min-w-0 text-negro border border-[#212121]/30 py-[12px] rounded-[12px] font-semibold text-[16px]/[19px] transition-colors duration-300 ease-in-out disabled:cursor-not-allowed flex hover:border-negro items-center justify-center cursor-pointer"
          >
            {isBuyingNow ? (
              <span className="inline-block h-4 w-4 border-2 border-negro border-t-transparent rounded-full animate-spin" />
            ) : (
              "Buy now"
            )}
          </button>
          <div className="flex flex-row gap-[4px] md:gap-[14px] w-full md:w-auto md:flex-1">
            <button
              type="button"
              onClick={handleAddToCartClick}
              disabled={!product.inStock || isAddingToCart}
              className="flex-1 min-w-0 border border-[#212121]/30 py-[12px] rounded-[12px] font-semibold text-[16px]/[19px] transition-colors duration-300 ease-in-out disabled:cursor-not-allowed flex hover:border-negro items-center justify-center cursor-pointer"
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
              className="flex items-center justify-center border border-[#212121]/30 rounded-[12px] w-[43px] h-[43px] shrink-0 transition-colors duration-300 ease-in-out cursor-pointer disabled:cursor-not-allowed hover:border-negro"
              aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
            >
              <HeartIcon
                color={isLiked ? "var(--color-rosa)" : "var(--color-negro)"}
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
