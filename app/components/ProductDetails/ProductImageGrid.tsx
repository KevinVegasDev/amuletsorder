"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ProductImage } from "../../types/product";

interface ProductImageGridProps {
  images: ProductImage[];
  variant?: "gallery" | "featured";
}

export const ProductImageGrid: React.FC<ProductImageGridProps> = ({
  images,
  variant = "gallery",
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const width = el.clientWidth;
    const index = Math.round(scrollLeft / width);
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  if (variant === "featured") {
    const displayImages = images.slice(0, 2);
    if (!displayImages.length) {
      return (
        <div className="flex flex-col md:flex-row gap-4 shrink-0">
          <div className="w-full md:w-[892px] h-[300px] md:h-[892px] flex items-center justify-center text-gray-400 shrink-0 bg-gray-100 rounded">
            No image
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col md:flex-row gap-4 shrink-0">
        {displayImages.map((image, index) => (
          <div
            key={image.id ?? image.src ?? index}
            className="relative w-full md:w-[892px] h-[300px] md:h-[892px] shrink-0 overflow-hidden"
          >
            <Image
              src={image.src}
              alt={image.alt || `Product image ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          </div>
        ))}
      </div>
    );
  }

  if (!images.length) {
    return (
      <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 gap-0 w-full md:max-w-[1282px]">
        <div className="w-full min-w-full md:w-[641px] md:min-w-0 h-[468px] md:h-[641px] flex items-center justify-center text-gray-400  snap-center">
          No image
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[16px]">
      {/* Scrollable image carousel */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 gap-0 w-full md:max-w-[1282px] scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {images.map((image, index) => (
          <div
            key={image.id ?? image.src ?? index}
            className="relative min-w-full md:min-w-0 w-full md:w-[641px] h-[468px] md:h-[641px]  snap-center"
          >
            <Image
              src={image.src}
              alt={image.alt || `Product image ${index + 1}`}
              width={641}
              height={641}
              className="object-contain w-full h-full"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        ))}
      </div>

      {/* Dots indicator — mobile only */}
      {images.length > 1 && (
        <div className="flex md:hidden flex-row gap-[4px] justify-center">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 cursor-pointer ${
                index === activeIndex ? "bg-negro" : "bg-[#EDEDED]"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
