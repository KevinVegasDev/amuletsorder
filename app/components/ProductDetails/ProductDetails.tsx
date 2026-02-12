

"use client";

import React, { useMemo } from "react";
import { Product } from "../../types/product";
import { useProductVariations } from "../../market/hooks/useProductVariations";
import { useProductActions } from "../../market/hooks/useProductActions";
import { cleanHtml, formatPrice, isColorAttribute } from "../../market/utils/productUtils";
import { ProductAttributes } from "./ProductAttributes";
import { StaticAttributes } from "./StaticAttributes";
import { ProductActions } from "./ProductActions";

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const {
    selectedAttributes,
    selectedVariation,
    currentPrice,
    currentRegularPrice,
    isOnSale,
    isInStock,
    getAvailableOptions,
    isOptionAvailable,
    handleAttributeChange,
  } = useProductVariations({ product });

  const {
    isAddingToCart,
    isBuyingNow,
    isLiked,
    handleAddToCart,
    handleBuyNow,
    handleToggleWishlist,
  } = useProductActions({
    product,
    selectedVariation,
    selectedAttributes,
    isInStock,
  });

  const categoryNames = product.categories?.map((c) => c.name).filter(Boolean) ?? [];
  const breadcrumbText = categoryNames.length ? categoryNames.join(" | ") : "";
  const categoryLabel = product.categories?.[0]?.name ?? "";

  const sizeAttributes = product.attributes?.filter((a) => !isColorAttribute(a.name)) ?? [];
  const colorAttributes = product.attributes?.filter((a) => isColorAttribute(a.name)) ?? [];
  const hasColor = colorAttributes.length > 0 || !product.attributes?.length;

  // Imagen de swatch por valor de color: se obtiene de la variación en WooCommerce.
  // Así no hay que mapear colores a mano; si la variación tiene imagen, la usamos.
  const colorSwatchImages = useMemo(() => {
    const map: Record<string, string> = {};
    const variations = product.variations ?? [];
    colorAttributes.forEach((attr) => {
      attr.options.forEach((optionValue) => {
        if (map[optionValue]) return;
        const variation = variations.find(
          (v) => v.attributes[attr.name] === optionValue && v.image?.src
        );
        if (variation?.image?.src) map[optionValue] = variation.image.src;
      });
    });
    return map;
  }, [product.variations, colorAttributes]);

  return (
    <div className="flex flex-col gap-8">
      {/* Bloque 1: migas de pan, nombre/categoría, precio, talla, color */}
      <div className="flex flex-col">
        <div className="flex flex-row gap-4 py-4">
          {breadcrumbText && (
            <span className="text-sm text-gray-500">{breadcrumbText}</span>
          )}
        </div>

        <div className="flex py-4 flex-col gap-2">
          <h1 className="text-2xl font-medium text-negro">{product.name}</h1>
          {categoryLabel && (
            <p className="text-sm font-light text-gray-600">{categoryLabel}</p>
          )}
        </div>

        <div className="py-8 px-4 flex border-t border-b border-[#212121]/25 flex-row items-center gap-4 flex-wrap">
          <span className="text-[28px] font-semibold text-negro">
            {formatPrice(currentPrice)}
          </span>
          {isOnSale && currentRegularPrice > currentPrice && (
            <span className="text-2xl text-rosa">
              {Math.round(
                ((currentRegularPrice - currentPrice) / currentRegularPrice) * 100
              )}
              % OFF
            </span>
          )}
        </div>

        <div className="py-8 px-4 flex flex-col gap-2 border-b border-[#212121]/25">
          <span className="text-negro font-medium text-[20px] ">Sizes</span>
          {sizeAttributes.length > 0 ? (
            <ProductAttributes
              attributes={sizeAttributes}
              selectedAttributes={selectedAttributes}
              getAvailableOptions={getAvailableOptions}
              isOptionAvailable={isOptionAvailable}
              onAttributeChange={handleAttributeChange}
              sizeButtonClassName="px-[34px] py-[18px] border border-negro rounded-[12px]"
              hideLabel
            />
          ) : (
            <StaticAttributes
              selectedAttributes={selectedAttributes}
              onAttributeChange={handleAttributeChange}
              showColor={false}
              sizeButtonClassName="px-[34px] py-[18px] border border-negro rounded-[12px]"
            />
          )}
        </div>

        {hasColor && (
          <div className="py-8 px-4 flex flex-col gap-2 border-b border-[#212121]/25 ">
            <span className="font-medium text-xl text-negro ">Color</span>
            <div className="flex flex-row gap-4">
              {colorAttributes.length > 0 ? (
                <ProductAttributes
                  attributes={colorAttributes}
                  selectedAttributes={selectedAttributes}
                  getAvailableOptions={getAvailableOptions}
                  isOptionAvailable={isOptionAvailable}
                  onAttributeChange={handleAttributeChange}
                  hideLabel
                  colorSwatchImages={colorSwatchImages}
                />
              ) : (
                <StaticAttributes
                  selectedAttributes={selectedAttributes}
                  onAttributeChange={handleAttributeChange}
                  showSize={false}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bloque 2: CTAs */}
      <div className="flex flex-col ">
        <ProductActions
          isInStock={isInStock}
          isAddingToCart={isAddingToCart}
          isBuyingNow={isBuyingNow}
          isLiked={isLiked}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onToggleWishlist={handleToggleWishlist}
        />
      </div>

      {/* Bloque 3: descripción */}
      <div className="py-6 border-b border-t border-[#212121]/25">
        <p className="text-sm text-gray-600 leading-relaxed">
          {cleanHtml(
            product.description ||
            product.shortDescription ||
            "No description available."
          )}
        </p>
      </div>
    </div>
  );
};

export default ProductDetails;
