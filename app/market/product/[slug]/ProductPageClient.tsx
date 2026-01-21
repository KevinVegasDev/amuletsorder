"use client";

import React, { useState, useMemo } from "react";
import { Product, ProductImage } from "../../../types/product";
import ProductImageGallery from "../../../components/ProductDetails/ProductImageGallery";
import ProductImagePreview from "../../../components/ProductDetails/ProductImagePreview";
import ProductDetails from "../../../components/ProductDetails/ProductDetails";

interface ProductPageClientProps {
  product: Product;
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  // Combinar todas las imágenes: producto base + variaciones
  const allImages = useMemo(() => {
    const images: ProductImage[] = [...(product.images || [])];

    // Agregar imágenes de variaciones si existen
    if (product.variations && product.variations.length > 0) {
      product.variations.forEach((variation) => {
        if (variation.image) {
          // Evitar duplicados comparando por ID o src
          const isDuplicate = images.some(
            (img) =>
              img.id === variation.image!.id || img.src === variation.image!.src
          );
          if (!isDuplicate) {
            images.push(variation.image);
          }
        }
      });
    }

    return images;
  }, [product.images, product.variations]);

  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(
    allImages.length > 0 ? allImages[0] : null
  );

  return (
    <main className="w-full min-h-screen ">
      <div className="w-full flex justify-center bg-blanco">
        {/* Contenedor principal con max-height */}
        <div className="w-full max-w-7xl min-h-[689px] max-h-[689px] flex flex-row px-4 sm:px-8 py-8">
          {/* Galería de imágenes (izquierda) */}
          <div className="flex-shrink-0 h-full">
            <ProductImageGallery
              images={allImages}
              onImageSelect={setSelectedImage}
              selectedImage={selectedImage}
            />
          </div>

          {/* Preview de imagen (centro) */}
          <div className="flex-1 mx-4">
            <ProductImagePreview
              images={allImages}
              selectedImage={selectedImage || undefined}
            />
          </div>

          {/* Detalles del producto (derecha) */}
          <div className="flex-shrink-0 w-[400px]">
            <ProductDetails
              product={product}
              onVariationImageChange={setSelectedImage}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
