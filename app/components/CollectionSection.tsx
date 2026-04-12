"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Collection } from "../types/product";

interface CollectionSectionProps {
  className?: string;
  collections: Collection[];
}

const CollectionSection: React.FC<CollectionSectionProps> = ({
  className = "",
  collections,
}) => {
  // Solo mostrar las primeras 2 colecciones
  const displayCollections = collections.slice(0, 2);

  if (displayCollections.length === 0) {
    return null;
  }

  return (
    <section className={`flex flex-col md:flex-row gap-[8px] ${className}`}>
      {displayCollections.map((collection) => (
        <div
          key={collection.id}
          className="min-h-[456px] max-h-[456px] md:min-h-[920px] relative overflow-hidden group w-full"
        >
          {/* Imagen de fondo */}
          {collection.imageUrl && (
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={collection.imageUrl}
                alt={collection.imageAlt || collection.title}
                fill
                sizes="1500px"
                className="object-cover"
              />
            </div>
          )}

          {/* Overlay con gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Contenedor de texto y CTA */}
          <div className="absolute inset-0 z-10 flex flex-col md:py-[64px] py-[24px] px-[32px] gap-[16px] justify-end">
            {/* Título */}
            <span className="md:text-[40px] text-[24px] font-extrabold text-white uppercase">
              {collection.title}
            </span>

            {/* Descripción */}
            <p className="md:text-[32px] text-[20px] text-white">
              {collection.description}
            </p>

            {/* CTA Button */}
            <Link
              href={collection.link || "/market"}
              prefetch={true}
              className="inline-block bg-white text-black rounded-[12px] py-[16px] px-[32px] text-[20px]/[23px] font-semibold w-fit hover:bg-gray-100 transition-colors"
            >
              Shop now
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
};

export default CollectionSection;
