"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "../types/product";
import { HeartIcon } from "./icons";
import { useWishlist } from "../contexts/WishlistContext";

interface RecommendedSectionProps {
  className?: string;
  products: Product[];
}

const RecommendedSection: React.FC<RecommendedSectionProps> = ({
  className = "",
  products,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { toggleWishlist, isInWishlist } = useWishlist();

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -350,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 350,
        behavior: "smooth",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className={`flex flex-col max-w-[1920px] mx-auto ${className}`}>
      {/* Div 1: Título y Controles */}
      <div className="flex flex-row justify-between px-[50px] py-[64px]">
        <h2 className="text-[32px] font-semibold text-black">
          Recommended for you
        </h2>
        <div className="flex flex-row gap-2">
          <button
            onClick={scrollLeft}
            className="w-16 h-16 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
            aria-label="Scroll left"
          >
            <Image
              src="/left-arrow.svg"
              alt="Left arrow"
              width={64}
              height={64}
            />
          </button>
          <button
            onClick={scrollRight}
            className="w-16 h-16 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
            aria-label="Scroll right"
          >
            <Image
              src="/right-arrow.svg"
              alt="Right arrow"
              width={64}
              height={64}
            />
          </button>
        </div>
      </div>

      {/* Div 2: Carrusel */}
      <section
        ref={scrollContainerRef}
        className="flex flex-row px-[50px] gap-[11px] overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => {
          const isLiked = isInWishlist(product.id);
          const primaryImage = product.images[0];
          const category = product.categories[0]?.name || "Product";

          const handleWishlistClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          };

          return (
            <div
              key={product.id}
              className="w-[324px] flex flex-col gap-[14px] flex-shrink-0"
            >
              {/* Div 1: Imagen */}
              <div className="relative w-full h-[306px] overflow-hidden">
                {primaryImage ? (
                  <Link href={`/market/product/${product.slug}`}>
                    <Image
                      src={primaryImage.src}
                      alt={primaryImage.alt || product.name}
                      fill
                      className="object-cover"
                      sizes="800px"
                    />
                  </Link>
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>

              {/* Div 2: Información */}
              <div className="flex flex-row justify-between min-h-[80px] pb-[30px]">
                {/* Div 1: Title, Tag, Precio */}
                <div className="flex flex-col ">
                  <Link href={`/market/product/${product.slug}`}>
                    <h3 className="text-[20px] font-medium text-black">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-[16px] font-light">{category}</p>
                  <p className="text-base font-semibold text-black">
                    {formatPrice(product.price)}
                    {product.onSale && product.salePrice && (
                      <span className="text[16px] font-medium">
                        {formatPrice(product.regularPrice)}
                      </span>
                    )}
                  </p>
                </div>

                {/* Div 2: Icono wishlist */}
                <div className="flex justify-end ">
                  <button
                    onClick={handleWishlistClick}
                    className="cursor-pointer hover:opacity-70 transition-opacity"
                    aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <HeartIcon color="black" filled={isLiked} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </section>
  );
};

export default RecommendedSection;
