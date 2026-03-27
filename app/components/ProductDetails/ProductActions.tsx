"use client";

import React, { useState } from "react";
import { HeartIcon } from "../icons";

interface ProductActionsProps {
  isInStock: boolean;
  isAddingToCart: boolean;
  isBuyingNow: boolean;
  isLiked: boolean;
  onAddToCart: () => Promise<void> | void;
  onBuyNow: () => Promise<void> | void;
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
  const [isHeartHovered, setIsHeartHovered] = useState(false);

  return (
    <div className="flex flex-col md:flex-row md:gap-[14px] gap-[4px] w-full">
      <button
        type="button"
        onClick={onBuyNow}
        disabled={!isInStock || isBuyingNow}
        className="w-full md:flex-1 md:w-auto min-w-0 text-negro border border-[#212121]/30 py-[12px] rounded-[12px] font-semibold text-[16px]/[19px] transition-colors duration-300 ease-in-out disabled:cursor-not-allowed flex hover:border-negro items-center justify-center cursor-pointer"
      >
        {isBuyingNow ? (
          <span className="inline-block h-4 w-4 border-2 border-negro border-t-transparent rounded-full animate-spin" />
        ) : (
          "Buy now"
        )}
      </button>
      <div className="flex flex-row gap-[4px] md:gap-[14px] w-full md:w-auto md:flex-1">
        <button
          type="button"
          onClick={onAddToCart}
          disabled={!isInStock || isAddingToCart}
          className="flex-1 min-w-0 text-negro border border-[#212121]/30 py-[12px] rounded-[12px] font-semibold text-[16px]/[19px] transition-colors duration-300 ease-in-out disabled:cursor-not-allowed flex hover:border-negro items-center justify-center cursor-pointer"
        >
          {isAddingToCart ? (
            <span className="inline-block h-4 w-4 border-2 border-negro border-t-transparent rounded-full animate-spin" />
          ) : (
            "Add to Cart"
          )}
        </button>
        <button
          type="button"
          onClick={onToggleWishlist}
          onMouseEnter={() => setIsHeartHovered(true)}
          onMouseLeave={() => setIsHeartHovered(false)}
          className="flex items-center justify-center border border-[#212121]/30 rounded-[12px] w-[43px] h-[43px] shrink-0 transition-colors duration-300 ease-in-out cursor-pointer disabled:cursor-not-allowed hover:border-negro"
          aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <HeartIcon
            color={isLiked ? "var(--color-rosa)" : "var(--color-negro)"}
            filled={true}
          />
        </button>
      </div>
    </div>
  );
};


