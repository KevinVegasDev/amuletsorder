"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { ProductImage } from "../../types/product";

interface ProductImageGalleryProps {
  images: ProductImage[];
  onImageSelect?: (image: ProductImage) => void;
  selectedImage?: ProductImage | null;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  onImageSelect,
  selectedImage,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedImageRef = useRef<HTMLButtonElement>(null);

  const handleImageClick = (image: ProductImage) => {
    if (onImageSelect) {
      onImageSelect(image);
    }
  };

  // Scroll automático para mantener la imagen seleccionada visible
  useEffect(() => {
    if (selectedImageRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const selectedButton = selectedImageRef.current;

      const containerRect = container.getBoundingClientRect();
      const buttonRect = selectedButton.getBoundingClientRect();

      // Verificar si la imagen seleccionada está fuera de la vista
      if (buttonRect.top < containerRect.top) {
        // Scroll hacia arriba
        container.scrollTo({
          top: selectedButton.offsetTop - container.offsetTop - 8, // 8px de padding
          behavior: "smooth",
        });
      } else if (buttonRect.bottom > containerRect.bottom) {
        // Scroll hacia abajo
        container.scrollTo({
          top:
            selectedButton.offsetTop -
            container.offsetTop -
            containerRect.height +
            buttonRect.height +
            8,
          behavior: "smooth",
        });
      }
    }
  }, [selectedImage]);

  return (
    <div className="flex flex-col h-full">
      {/* Contenedor con scroll vertical */}
      <div
        ref={scrollContainerRef}
        className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden px-4 scrollbar-hide h-full"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {images.map((image, index) => {
          // Verificar si esta imagen está seleccionada (por ID o src)
          const isSelected =
            selectedImage &&
            (selectedImage.id === image.id || selectedImage.src === image.src);

          return (
            <button
              key={image.id || image.src || index}
              ref={isSelected ? selectedImageRef : null}
              onClick={() => handleImageClick(image)}
              className={`relative w-36 h-36 flex-shrink-0 overflow-hidden border-2 rounded scrollbar-none transition-all duration-200 ${isSelected
                ? "border-negro scale-105"
                : "border-transparent hover:border-gray-300"
                }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.src}
                alt={image.alt || `Product image ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductImageGallery;
