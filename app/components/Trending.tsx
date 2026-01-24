"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "../types/product";

interface TrendingProps {
  className?: string;
  products: Product[];
}

const Trending: React.FC<TrendingProps> = ({
  className = "",
  products,
}) => {
  // Solo mostrar los primeros 3 productos (índices 0, 1, 2)
  const displayProducts = products.slice(0, 3);

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section className={`max-w-[1920px] mx-auto flex flex-col ${className}`}>
      {/* Div 1: Título */}
      <div className="px-[50px] py-[64px]">
        <h4 className="text-[32px] font-semibold text-black">
          Trending Wear
        </h4>
      </div>

      {/* Div 2: Grid de imágenes */}
      <div className="flex flex-row px-[50px] gap-[16px]">
        {displayProducts.map((product) => {
          const primaryImage = product.images[0];

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
                {primaryImage ? (
                  <div className="relative w-full overflow-hidden rounded-2xl" style={{ height: "941px" }}>
                    <Image
                      src={primaryImage.src}
                      alt={primaryImage.alt || product.name}
                      fill
                      className="object-cover rounded-2xl transition-transform duration-300 group-hover/image:scale-105"
                      sizes="1500px"
                      unoptimized={true}
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
