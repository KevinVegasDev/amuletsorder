"use client";

import React from "react";
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
  if (variant === "featured") {
    const displayImages = images.slice(0, 2);
    if (!displayImages.length) {
      return (
        <div className="flex flex-row gap-4 shrink-0">
          <div className="w-[892px] h-[892px] flex items-center justify-center text-gray-400 shrink-0 bg-gray-100 rounded">
            No image
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-row gap-4 shrink-0">
        {displayImages.map((image, index) => (
          <div
            key={image.id ?? image.src ?? index}
            className="relative w-[892px] h-[892px] shrink-0 overflow-hidden bg-gray-50"
          >
            <Image
              src={image.src}
              alt={image.alt || `Product image ${index + 1}`}
              fill
              className="object-cover"
              sizes="1200px"
            />
          </div>
        ))}
      </div>
    );
  }

  if (!images.length) {
    return (
      <div className="grid grid-cols-2 gap-0 w-full max-w-[1282px]">
        <div className="w-[641px] h-[641px] flex items-center justify-center text-gray-400 bg-gray-100">
          No image
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-0 w-full max-w-[1282px]">
      {images.map((image, index) => (
        <div
          key={image.id ?? image.src ?? index}
          className="relative w-[641px] h-[641px] bg-gray-50"
        >
          <Image
            src={image.src}
            alt={image.alt || `Product image ${index + 1}`}
            width={641}
            height={641}
            className="object-contain w-full h-full"
            sizes="800px"
          />
        </div>
      ))}
    </div>
  );
};
