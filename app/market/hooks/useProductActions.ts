"use client";

import { useState, useRef } from "react";
import { Product, ProductVariation } from "../../types/product";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { useToast } from "../../contexts/ToastContext";

interface UseProductActionsProps {
  product: Product;
  selectedVariation: ProductVariation | null;
  selectedAttributes: Record<string, string>;
  isInStock: boolean;
}

interface UseProductActionsReturn {
  isAddingToCart: boolean;
  isBuyingNow: boolean;
  isLiked: boolean;
  handleAddToCart: () => Promise<void>;
  handleBuyNow: () => Promise<void>;
  handleToggleWishlist: () => void;
}

/**
 * Hook to manage product actions (add to cart, buy now, wishlist)
 */
export const useProductActions = ({
  product,
  selectedVariation,
  selectedAttributes,
  isInStock,
}: UseProductActionsProps): UseProductActionsReturn => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const isProcessingRef = useRef(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  const isLiked = isInWishlist(product.id);

  /**
   * Create product with variation data if applicable
   */
  const createProductToAdd = (): Product => {
    if (selectedVariation) {
      return {
        ...product,
        id: selectedVariation.id,
        price: selectedVariation.price,
        regularPrice: selectedVariation.regularPrice,
        salePrice: selectedVariation.salePrice,
        onSale: selectedVariation.onSale,
        inStock: selectedVariation.inStock,
        sku: selectedVariation.sku,
        images: selectedVariation.image
          ? [selectedVariation.image, ...product.images]
          : product.images,
      };
    }
    return product;
  };

  /**
   * Validate that all required attributes are selected
   */
  const validateAttributes = (): boolean => {
    if (product.attributes && product.attributes.length > 0) {
      const missingAttributes = product.attributes.filter(
        (attr) => !selectedAttributes[attr.name]
      );
      if (missingAttributes.length > 0) {
        showToast("Please select all required options", "error", 3000);
        return false;
      }
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (isProcessingRef.current || isAddingToCart || !isInStock) {
      if (!isInStock) {
        showToast(`${product.name} is out of stock`, "error", 3000);
      }
      return;
    }

    if (!validateAttributes()) {
      return;
    }

    isProcessingRef.current = true;
    setIsAddingToCart(true);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const productToAdd = createProductToAdd();
    addToCart(productToAdd, 1);
    showToast(`${product.name} added to cart`, "success", 2000);

    setIsAddingToCart(false);
    isProcessingRef.current = false;
  };

  const handleBuyNow = async () => {
    if (isProcessingRef.current || isBuyingNow || !isInStock) {
      if (!isInStock) {
        showToast(`${product.name} is out of stock`, "error", 3000);
      }
      return;
    }

    if (!validateAttributes()) {
      return;
    }

    isProcessingRef.current = true;
    setIsBuyingNow(true);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const productToAdd = createProductToAdd();
    addToCart(productToAdd, 1);
    showToast(`${product.name} added to cart`, "success", 2000);

    setTimeout(() => {
      window.location.href = "/checkout";
    }, 500);
  };

  const handleToggleWishlist = () => {
    const wasLiked = isLiked;
    toggleWishlist(product);

    if (wasLiked) {
      showToast(`${product.name} removed from saved items`, "info", 2000);
    } else {
      showToast(`${product.name} added to saved items`, "success", 2000);
    }
  };

  return {
    isAddingToCart,
    isBuyingNow,
    isLiked,
    handleAddToCart,
    handleBuyNow,
    handleToggleWishlist,
  };
};

