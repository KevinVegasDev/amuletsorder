"use client";

import React from "react";
import { formatPrice } from "../../market/utils/productUtils";

interface ProductPriceProps {
  currentPrice: number;
  currentRegularPrice: number;
  isOnSale: boolean;
}

/**
 * Component to display product price with sale information
 */
export const ProductPrice: React.FC<ProductPriceProps> = ({
  currentPrice,
  currentRegularPrice,
  isOnSale,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-negro">
          {formatPrice(currentPrice)}
        </span>
        {isOnSale && currentRegularPrice > currentPrice && (
          <span className="text-lg text-gray-400 line-through">
            {formatPrice(currentRegularPrice)}
          </span>
        )}
        {isOnSale && (
          <span className="text-sm text-rosa font-medium">
            {Math.round(
              ((currentRegularPrice - currentPrice) / currentRegularPrice) * 100
            )}
            % OFF
          </span>
        )}
      </div>
    </div>
  );
};

