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
    <div className="flex flex-col gap-3">
      {/* Buy Now */}
      <button
        onClick={onBuyNow}
        disabled={!isInStock || isBuyingNow}
        className="w-full px-6 py-3 bg-negro text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
      >
        {isBuyingNow ? (
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          "Buy Now"
        )}
      </button>

      {/* Add to Cart y Favorito */}
      <div className="flex gap-3">
        <button
          onClick={onAddToCart}
          disabled={!isInStock || isAddingToCart}
          className="flex-1 px-6 py-3 bg-white text-negro border-2 border-gray-300 font-medium rounded hover:bg-gray-50 hover:border-negro transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {isAddingToCart ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-negro"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Adding...</span>
            </>
          ) : (
            "Add to Cart"
          )}
        </button>

        <button
          onClick={onToggleWishlist}
          className="px-6 py-3 bg-white border-2 border-gray-300 rounded hover:bg-gray-50 hover:border-negro transition-colors duration-200 flex items-center justify-center"
          aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <HeartIcon color="var(--color-negro)" filled={isLiked} />
        </button>
      </div>
    </div>
  );
};

