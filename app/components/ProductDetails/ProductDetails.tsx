

"use client";

import React, { useMemo } from "react";
import { Product } from "../../types/product";
import { useProductVariations } from "../../market/hooks/useProductVariations";
import { useProductActions } from "../../market/hooks/useProductActions";
import { formatPrice, isColorAttribute } from "../../market/utils/productUtils";
import ProductInfoTabs from "./ProductInfoTabs";
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
    missingAttributes,
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

  // Filtrar las opciones para que solo se muestren las que realmente tienen una variación existente
  const filteredAttributes = useMemo(() => {
    const baseAttributes = product.attributes ?? [];
    if (!product.variations || product.variations.length === 0) {
      return baseAttributes;
    }

    return baseAttributes.map(attr => {
      const validOptions = new Set<string>();
      const targetAttrKey = attr.name.toLowerCase();
      
      product.variations!.forEach(v => {
        const matchingKey = Object.keys(v.attributes).find(k => k.toLowerCase() === targetAttrKey);
        if (matchingKey && v.attributes[matchingKey]) {
          validOptions.add(v.attributes[matchingKey].toLowerCase().trim());
        }
      });

      return {
        ...attr,
        options: attr.options.filter(opt => validOptions.has(opt.toLowerCase().trim()))
      };
    }).filter(attr => attr.options.length > 0);
  }, [product.attributes, product.variations]);

  const sizeAttributes = filteredAttributes.filter((a) => !isColorAttribute(a.name));
  const colorAttributes = filteredAttributes.filter((a) => isColorAttribute(a.name));
  const hasColor = colorAttributes.length > 0 || !filteredAttributes.length;

  // Imagen de swatch por valor de color: se obtiene de la variación en WooCommerce.
  // Así no hay que mapear colores a mano; si la variación tiene imagen, la usamos.
  const colorSwatchImages = useMemo(() => {
    const map: Record<string, string> = {};
    const variations = product.variations ?? [];
    colorAttributes.forEach((attr) => {
      attr.options.forEach((optionValue) => {
        if (map[optionValue]) return;
        const targetAttrKey = attr.name.toLowerCase();
        const targetOptionValue = optionValue.toLowerCase().trim();

        const variation = variations.find((v) => {
          if (!v.image?.src) return false;
          const matchingKey = Object.keys(v.attributes).find(
            (k) => k.toLowerCase() === targetAttrKey
          );
          if (!matchingKey) return false;
          return v.attributes[matchingKey].toLowerCase().trim() === targetOptionValue;
        });

        if (variation?.image?.src) map[optionValue] = variation.image.src;
      });
    });
    return map;
  }, [product.variations, colorAttributes]);

  return (
    <div className="flex flex-col gap-8">
      {/* Bloque 1: nombre/categoría, precio, talla, color */}
      <div className="flex flex-col">
        <div className="flex py-4 flex-col gap-2">
          <span className="text-2xl font-medium text-negro">{product.name}</span>
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
              missingAttributes={missingAttributes}
            />
          ) : (
            <StaticAttributes
              selectedAttributes={selectedAttributes}
              onAttributeChange={handleAttributeChange}
              showColor={false}
              sizeButtonClassName="px-[34px] py-[18px] border border-negro rounded-[12px]"
              missingAttributes={missingAttributes}
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
                  missingAttributes={missingAttributes}
                />
              ) : (
                <StaticAttributes
                  selectedAttributes={selectedAttributes}
                  onAttributeChange={handleAttributeChange}
                  showSize={false}
                  missingAttributes={missingAttributes}
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

      {/* Bloque 3: Description / Shipping / Returns tabs */}
      <div className="border-t border-[#212121]/25">
        <ProductInfoTabs
          description={product.description}
          shortDescription={product.shortDescription}
        />
      </div>
    </div>
  );
};

export default ProductDetails;
