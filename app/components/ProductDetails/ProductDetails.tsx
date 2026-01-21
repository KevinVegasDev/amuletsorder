"use client";

import React from "react";
import { Product, ProductImage } from "../../types/product";
import { useProductVariations } from "../../market/hooks/useProductVariations";
import { useProductActions } from "../../market/hooks/useProductActions";
import { cleanHtml } from "../../market/utils/productUtils";
import { ProductAttributes } from "./ProductAttributes";
import { StaticAttributes } from "./StaticAttributes";
import { ProductPrice } from "./ProductPrice";
import { ProductActions } from "./ProductActions";

interface ProductDetailsProps {
  product: Product;
  onVariationImageChange?: (image: ProductImage | null) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  onVariationImageChange,
}) => {
  // Hook para manejar variaciones y atributos
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
  } = useProductVariations({
    product,
    onVariationImageChange,
  });

  // Hook para manejar acciones del producto
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

  return (
    <div className="flex flex-col h-full">
      {/* Título */}
      <h1 className="text-3xl font-bold text-negro mb-4">
        {product.name}
      </h1>

      {/* Descripción */}
      <div className="mb-6">
        <p className="text-gray-600 leading-relaxed">
          {cleanHtml(
            product.description ||
              product.shortDescription ||
              "No description available."
          )}
        </p>
      </div>

      {/* Atributos dinámicos (Size, Color, etc.) */}
      {product.attributes && product.attributes.length > 0 ? (
        <ProductAttributes
          attributes={product.attributes}
          selectedAttributes={selectedAttributes}
          getAvailableOptions={getAvailableOptions}
          isOptionAvailable={isOptionAvailable}
          onAttributeChange={handleAttributeChange}
        />
      ) : (
        <StaticAttributes
          selectedAttributes={selectedAttributes}
          onAttributeChange={handleAttributeChange}
        />
      )}

      {/* Precio */}
      <ProductPrice
        currentPrice={currentPrice}
        currentRegularPrice={currentRegularPrice}
        isOnSale={isOnSale}
      />

      {/* Botones de acción */}
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
  );
};

export default ProductDetails;
