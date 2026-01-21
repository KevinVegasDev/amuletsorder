import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductCategory } from "../types/product";

interface HomeCategoryCardProps {
  category: ProductCategory;
  imageUrl?: string;
}

const HomeCategoryCard: React.FC<HomeCategoryCardProps> = ({
  category,
  imageUrl,
}) => {
  return (
    <Link
      href={`/market?category=${category.slug}`}
      className="w-[290px] h-[420px] relative rounded-lg overflow-hidden group cursor-pointer"
    >
      {/* Imagen de fondo */}
      {imageUrl && (
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={imageUrl}
            alt={category.name}
            fill
            sizes="800px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Overlay con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Título de la categoría - arriba a la izquierda */}
      <div className="absolute top-0 left-0 p-4 z-10">
        <h3 className="text-white text-[24px] font-semibold">
          {category.name}
        </h3>
      </div>
    </Link>
  );
};

export default HomeCategoryCard;
