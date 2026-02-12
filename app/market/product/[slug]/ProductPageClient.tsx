"use client";

import React, { useMemo } from "react";
import { Product, ProductImage } from "../../../types/product";
import { ProductImageGrid } from "../../../components/ProductDetails/ProductImageGrid";
import ProductDetails from "../../../components/ProductDetails/ProductDetails";
import RecommendedSection from "../../../components/RecommendedSection";

interface ProductPageClientProps {
  product: Product;
  recommendedProducts?: Product[];
}

const FEATURED_TAG = "featured-detail";

function isFeaturedDetail(img: ProductImage): boolean {
  const tag = FEATURED_TAG.toLowerCase();
  const alt = (img.alt || "").toLowerCase().trim();
  const caption = (img.caption || "").toLowerCase().trim();
  const name = (img.name || "").toLowerCase().trim();
  return alt === tag || caption === tag || name === tag;
}

export default function ProductPageClient({
  product,
  recommendedProducts = [],
}: ProductPageClientProps) {
  const allImages = useMemo(() => {
    const images: ProductImage[] = [...(product.images || [])];
    if (product.variations?.length) {
      product.variations.forEach((variation) => {
        if (variation.image) {
          const isDuplicate = images.some(
            (img) =>
              img.id === variation.image!.id || img.src === variation.image!.src
          );
          if (!isDuplicate) images.push(variation.image);
        }
      });
    }
    return images;
  }, [product.images, product.variations]);

  const featuredImages = useMemo(() => {
    const filtered = allImages.filter(isFeaturedDetail);
    const slice = filtered.slice(0, 2);
    return slice.length > 0 ? slice : allImages.slice(0, 2);
  }, [allImages]);

  const galleryImages = useMemo(() => {
    const withoutFeatured = allImages.filter((img) => !isFeaturedDetail(img));
    return withoutFeatured.length > 0 ? withoutFeatured : allImages;
  }, [allImages]);

  return (
    <main className="w-full min-h-screen bg-blanco">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-12">
        {/* Bloque principal: galería (sin featured-detail para no repetir) + detalles */}
        <div className="w-full flex flex-row gap-8 lg:gap-12">
          <div className="flex-shrink-0">
            <ProductImageGrid images={galleryImages} variant="gallery" />
          </div>
          <div className="flex-1 min-w-0">
            <ProductDetails product={product} />
          </div>
        </div>

        {/* Debajo del bloque: solo las 1–2 imágenes featured-detail */}
        <section className="w-full">
          <ProductImageGrid images={featuredImages} variant="featured" />
        </section>

        <RecommendedSection products={recommendedProducts} />
      </div>
    </main>
  );
}
