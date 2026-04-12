"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "../types/product";

interface TrendingProps {
  className?: string;
  products: Product[];
}

const Trending: React.FC<TrendingProps> = ({ className = "", products }) => {
  // Mostrar todos los productos con etiqueta trending
  const displayProducts = products;

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section className={`max-w-[1920px] mx-auto flex flex-col ${className}`}>
      {/* Div 1: Título */}
      <div className="md:px-[50px] px-4 py-[64px]">
        <span className="text-[32px] font-semibold text-black block">Trending Wear</span>
      </div>

      {/* Div 2: Grid de imágenes */}
      <div className="flex flex-col md:flex-row md:px-[50px] px-4 gap-[16px]">
        {displayProducts.map((product) => {
          const lastImage = product.images[product.images.length - 1];

          return (
            <div
              key={product.id}
              className="w-full"
              style={{ maxWidth: "596px" }}
            >
              <Link
                href={`/market/product/${product.slug}`}
                className="group/image block w-full h-full"
              >
                {lastImage ? (
                  <div className="relative w-full overflow-hidden rounded-2xl h-[303px] md:h-[941px]">
                    <Image
                      src={lastImage.src}
                      alt={lastImage.alt || product.name}
                      fill
                      className="object-cover rounded-2xl transition-transform duration-300 "
                      sizes="(max-width: 768px) 500px, 1500px"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div
                    className="w-full bg-gray-100 flex items-center justify-center rounded-2xl"
                    style={{ height: "941px" }}
                  >
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Trending;
