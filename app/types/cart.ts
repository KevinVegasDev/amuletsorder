import { Product } from "./product";

/**
 * Item individual en el carrito
 */
export interface CartItem {
  product: Product;
  quantity: number;
  // Fecha de agregado (opcional, útil para ordenar)
  addedAt?: Date;
}

/**
 * Estado completo del carrito
 */
export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

/**
 * Item en la lista de favoritos/wishlist
 * Funciona como "Guardar" - productos guardados localmente
 */
export interface WishlistItem {
  product: Product;
  addedAt: Date;
}

/**
 * Estado completo de la wishlist
 */
export interface Wishlist {
  items: WishlistItem[];
  itemCount: number;
}

/**
 * Acciones del CartContext
 */
export interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  isInCart: (productId: number) => boolean;
}

/**
 * Acciones del WishlistContext
 */
export interface WishlistContextType {
  wishlist: Wishlist;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  toggleWishlist: (product: Product) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: number) => boolean;
  getWishlistItemCount: () => number;
}

