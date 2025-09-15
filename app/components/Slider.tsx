"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface SliderImage {
  src: string;
  alt: string;
}

interface SliderProps {
  images: SliderImage[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  maxHeight?: string;
}

/**
 * Recomendaciones para imágenes del banner:
 * - Resolución mínima: 1920px de ancho
 * - Resolución óptima: 3840px de ancho (para pantallas retina/2x)
 * - Altura proporcional manteniendo aspect ratio 16:9 o 21:9
 * - Formato: JPEG o WebP optimizado
 * - Tamaño de archivo recomendado: < 800KB
 * - No usar imágenes más pequeñas que 1920px de ancho
 */

const Slider: React.FC<SliderProps> = ({
  images,
  autoPlay = true,
  autoPlayInterval = 6000,
  maxHeight = "75vh", // Puedes ajustar este valor según necesites
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <div
        className="w-full  bg-gray-200 flex items-center justify-center"
        style={{ maxHeight }}
      >
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden h-[60vh] md:h-[75vh]"
      style={{ maxHeight }}
    >
      {/* Main slider container with fade transition */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="125vw"
              className="object-cover "
              quality={90}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      {images.length > 1 && (
        <div
          className="absolute bottom-4 right-4 flex space-x-2"
          style={{ marginRight: "12px" }}
        >
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ease-in-out transform hover:scale-110 ${
                index === currentIndex
                  ? "bg-negro opacity-100"
                  : "bg-negro opacity-75 hover:opacity-75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Slider;
