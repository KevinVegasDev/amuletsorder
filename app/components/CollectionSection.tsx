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
    <section className={`flex flex-row gap-[8px] ${className}`}>
      {displayCollections.map((collection) => (
        <div
          key={collection.id}
          className=" min-h-[600px] relative  overflow-hidden group w-full"
        >
          {/* Imagen de fondo */}
          {collection.imageUrl && (
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={collection.imageUrl}
                alt={collection.imageAlt || collection.title}
                fill
                sizes="1200px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}

          {/* Overlay con gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Contenedor de texto y CTA */}
          <div className="relative z-10 flex flex-col py-[64px] px-[32px] gap-[16px] h-full justify-end">
            {/* Título */}
            <h2 className="text-[40px] font-extrabold text-white uppercase">
              {collection.title}
            </h2>

            {/* Descripción */}
            <p className="text-[32px] text-white">
              {collection.description}
            </p>

            {/* CTA Button */}
            <Link
              href={collection.link || "/market"}
              className="inline-block bg-white text-black rounded-[12px] py-[16px] px-[32px] text-[20px] font-semibold w-fit hover:bg-gray-100 transition-colors"
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
