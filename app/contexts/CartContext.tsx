"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product } from "../types/product";
import { CartItem, Cart, CartContextType } from "../types/cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "amulets_cart";

/**
 * Función para calcular el total del carrito
 */
const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);
};

/**
 * Función para calcular el número total de items
 */
const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

/**
 * Función para cargar el carrito desde localStorage
 */
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Convertir addedAt de string a Date si existe
    return parsed.map((item: CartItem) => ({
      ...item,
      addedAt: item.addedAt ? new Date(item.addedAt) : new Date(),
    }));
  } catch (error) {
    console.error("Error loading cart from storage:", error);
    return [];
  }
};

/**
 * Función para guardar el carrito en localStorage
 */
const saveCartToStorage = (items: CartItem[]): void => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Error saving cart to storage:", error);
  }
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    const loadedItems = loadCartFromStorage();
    setItems(loadedItems);
    setIsInitialized(true);
  }, []);

  // Guardar en localStorage cuando cambian los items
  useEffect(() => {
    if (isInitialized) {
      saveCartToStorage(items);
    }
  }, [items, isInitialized]);

  /**
   * Agregar producto al carrito
   */
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    // Validar que el producto tenga stock
    if (!product.inStock) {
      console.warn("Producto sin stock:", product.name);
      return;
    }

    setItems((prevItems) => {
      // Verificar si el producto ya está en el carrito
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingItemIndex >= 0) {
        // Si ya existe, aumentar la cantidad
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return updatedItems;
      } else {
        // Si no existe, agregar nuevo item
        return [
          ...prevItems,
          {
            product,
            quantity,
            addedAt: new Date(),
          },
        ];
      }
    });
  }, []);

  /**
   * Eliminar producto del carrito
   */
  const removeFromCart = useCallback((productId: number) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId)
    );
  }, []);

  /**
   * Actualizar cantidad de un producto
   */
  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  /**
   * Limpiar todo el carrito
   */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  /**
   * Obtener el total del carrito
   */
  const getCartTotal = useCallback((): number => {
    return calculateCartTotal(items);
  }, [items]);

  /**
   * Obtener el número total de items
   */
  const getCartItemCount = useCallback((): number => {
    return calculateItemCount(items);
  }, [items]);

  /**
   * Verificar si un producto está en el carrito
   */
  const isInCart = useCallback((productId: number): boolean => {
    return items.some((item) => item.product.id === productId);
  }, [items]);

  // Calcular valores derivados
  const total = calculateCartTotal(items);
  const itemCount = calculateItemCount(items);

  const cart: Cart = {
    items,
    total,
    itemCount,
  };

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/**
 * Hook para usar el CartContext
 */
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

