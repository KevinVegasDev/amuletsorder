"use client";

import React from "react";
import { HeartIcon } from "../icons";

interface ProductActionsProps {
  isInStock: boolean;
  isAddingToCart: boolean;
  isBuyingNow: boolean;
  isLiked: boolean;
  onAddToCart: () => Promise<void>;
  onBuyNow: () => Promise<void>;
  onToggleWishlist: () => void;
}

/**
 * Component to display product action buttons (Buy Now, Add to Cart, Wishlist)
 */
export const ProductActions: React.FC<ProductActionsProps> = ({
  isInStock,
  isAddingToCart,
  isBuyingNow,
  isLiked,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {/* Buy now: ancho completo, py-12px px-32px, fondo negro, texto mostaza */}
      <button
        onClick={onBuyNow}
        disabled={!isInStock || isBuyingNow}
        className="w-full py-3 px-8 bg-negro text-mostaza font-medium rounded-[12px] hover:opacity-90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
      >
        {isBuyingNow ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-mostaza"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          "Buy now"
        )}
      </button>

      {/* Add to Cart (todo el ancho disponible) + Liked 43×43 */}
      <div className="flex flex-row gap-2">
        <button
          onClick={onAddToCart}
          disabled={!isInStock || isAddingToCart}
          className="flex-1 py-3 px-6 bg-negro text-white font-medium rounded-[12px] hover:opacity-90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {isAddingToCart ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Adding...</span>
            </>
          ) : (
            "Add to Cart"
          )}
        </button>
        <button
          onClick={onToggleWishlist}
          className="w-[43px] h-[43px] shrink-0 flex items-center justify-center bg-negro rounded-[12px] hover:opacity-90 transition-opacity"
          aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <HeartIcon color="var(--color-blanco)" filled={isLiked} />
        </button>
      </div>
    </div>
  );
};

