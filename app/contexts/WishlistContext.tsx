"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Product } from "../types/product";
import { WishlistItem, Wishlist, WishlistContextType } from "../types/cart";

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

const WISHLIST_STORAGE_KEY = "amulets_wishlist";

/**
 * Load wishlist from localStorage
 */
const loadWishlistFromStorage = (): WishlistItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed.map((item: WishlistItem) => ({
      ...item,
      addedAt: item.addedAt ? new Date(item.addedAt) : new Date(),
    }));
  } catch (error) {
    console.error("Error loading wishlist from storage:", error);
    return [];
  }
};

/**
 * Save wishlist to localStorage
 */
const saveWishlistToStorage = (items: WishlistItem[]): void => {
  if (typeof window === "undefined") return;

  try {
    const serialized = items.map((item) => ({
      product: item.product,
      addedAt: item.addedAt.toISOString(),
    }));
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.error("Error saving wishlist to storage:", error);
  }
};

interface WishlistProviderProps {
  children: React.ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({
  children,
}) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const isTogglingRef = useRef<Set<number>>(new Set());

  // Optimized Set of product IDs for O(1) lookups
  const wishlistProductIds = useMemo(() => {
    return new Set(items.map((item) => item.product.id));
  }, [items]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const loadedItems = loadWishlistFromStorage();
    setItems(loadedItems);
    setIsInitialized(true);
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (isInitialized) {
      saveWishlistToStorage(items);
    }
  }, [items, isInitialized]);

  /**
   * Add product to wishlist
   */
  const addToWishlist = useCallback((product: Product) => {
    setItems((prevItems) => {
      // Check if product already exists
      const exists = prevItems.some((item) => item.product.id === product.id);
      if (exists) {
        return prevItems; // Already in wishlist, do nothing
      }

      // Add new item
      return [
        ...prevItems,
        {
          product,
          addedAt: new Date(),
        },
      ];
    });
  }, []);

  /**
   * Remove product from wishlist
   */
  const removeFromWishlist = useCallback((productId: number) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId)
    );
  }, []);

  /**
   * Toggle: add if not in wishlist, remove if in wishlist
   */
  const toggleWishlist = useCallback((product: Product) => {
    // Prevent multiple simultaneous toggles for the same product
    if (isTogglingRef.current.has(product.id)) {
      return;
    }

    // Mark as in progress
    isTogglingRef.current.add(product.id);

    setItems((prevItems) => {
      const exists = prevItems.some((item) => item.product.id === product.id);

      let newItems: WishlistItem[];

      if (exists) {
        // Remove from wishlist
        newItems = prevItems.filter((item) => item.product.id !== product.id);
      } else {
        // Add to wishlist - check again to avoid duplicates
        if (prevItems.some((item) => item.product.id === product.id)) {
          isTogglingRef.current.delete(product.id);
          return prevItems;
        }

        newItems = [
          ...prevItems,
          {
            product,
            addedAt: new Date(),
          },
        ];
      }

      // Clear the toggle lock after state update
      setTimeout(() => {
        isTogglingRef.current.delete(product.id);
      }, 100);

      return newItems;
    });
  }, []);

  /**
   * Clear entire wishlist
   */
  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  /**
   * Check if product is in wishlist - O(1) lookup using Set
   */
  const isInWishlist = useCallback(
    (productId: number): boolean => {
      return wishlistProductIds.has(productId);
    },
    [wishlistProductIds]
  );

  /**
   * Get total number of items in wishlist
   */
  const getWishlistItemCount = useCallback((): number => {
    return items.length;
  }, [items]);

  // Calculate derived values
  const itemCount = items.length;

  const wishlist: Wishlist = {
    items,
    itemCount,
  };

  const value: WishlistContextType = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistItemCount,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

/**
 * Hook to use WishlistContext
 */
export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
