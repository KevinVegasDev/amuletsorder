"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ProductImage } from "../../types/product";

interface ProductImagePreviewProps {
  images: ProductImage[];
  selectedImage?: ProductImage;
  className?: string;
}

const ProductImagePreview: React.FC<ProductImagePreviewProps> = ({
  images,
  selectedImage,
  className = "",
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const displayImage = selectedImage || images[0];

  if (!displayImage) {
    return (
      <div
        className={`relative w-full h-full bg-gray-100 flex items-center justify-center ${className}`}
      >
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
    );
  }

  return (
    <div className={`relative w-full h-full bg-gray-50 overflow-hidden ${className}`}>
      {!imageError ? (
        <Image
          src={displayImage.src}
          alt={displayImage.alt || "Product preview"}
          fill
          className={`object-cover transition-opacity duration-300 ${
            imageLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setImageLoading(false)}
          onError={() => setImageError(true)}
          sizes="(min-width: 1280px) 50vw, 100vw"
          priority
        />
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
            <p className="text-sm">Error loading image</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImagePreview;



