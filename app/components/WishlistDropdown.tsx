"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";
import { Product } from "../types/product";
import { XMarkIcon, TrashIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "./icons";

interface WishlistDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const WishlistDropdown: React.FC<WishlistDropdownProps> = ({ isOpen, onClose }) => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  // Cerrar con tecla ESC y prevenir scroll del body
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevenir scroll del body cuando el drawer está abierto
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleAddToCart = (product: Product) => {
    if (product.inStock) {
      addToCart(product, 1);
      showToast(`${product.name} added to cart`, "success", 2000);
    } else {
      showToast(`${product.name} is out of stock`, "error", 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay para cerrar haciendo click fuera */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer - Fondo blanco con efecto glass (igual que el carrito) */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-[400px] z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px 0 0 16px",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(3.4px)",
          WebkitBackdropFilter: "blur(3.4px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <HeartIcon color="var(--color-negro)" filled={true} />
            <h2 className="text-xl sm:text-2xl font-bold text-negro">
              Saved Products
            </h2>
            {wishlist.itemCount > 0 && (
              <span className="text-sm text-gray-500 font-medium">
                ({wishlist.itemCount})
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Close wishlist"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {wishlist.items.length === 0 ? (
            // Estado vacío
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-24 h-24 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <HeartIcon color="var(--color-negro)" filled={false} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No saved products
              </h3>
              <p className="text-gray-500 mb-6">
                Save products you like by clicking the heart icon
              </p>
              <Link
                href="/market"
                onClick={onClose}
                className="px-6 py-3 bg-negro text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200"
              >
                Explore products
              </Link>
            </div>
          ) : (
            // Lista de productos guardados
            <div className="p-4 space-y-4">
              {wishlist.items.map((item) => {
                const productImage = item.product.images[0];
                return (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Imagen del producto - Más grande */}
                    <Link
                      href={`/market/product/${item.product.slug}`}
                      onClick={onClose}
                      className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden"
                    >
                      {productImage ? (
                        <Image
                          src={productImage.src}
                          alt={productImage.alt || item.product.name}
                          fill
                          className="object-cover rounded"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg
                            className="w-8 h-8"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </Link>

                    {/* Información del producto */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/market/product/${item.product.slug}`}
                        onClick={onClose}
                        className="block"
                      >
                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 hover:text-rosa transition-colors duration-200">
                          {item.product.name}
                        </h3>
                        <p className="text-sm font-semibold text-negro mb-2">
                          {formatPrice(item.product.price)}
                        </p>
                      </Link>

                      {/* Botones de acción - Más prominentes */}
                      <div className="flex items-center gap-3 mt-3">
                        {item.product.inStock ? (
                          <button
                            onClick={() => handleAddToCart(item.product)}
                            className="flex items-center gap-2 px-4 py-2 bg-negro text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors duration-200"
                            aria-label="Add to cart"
                          >
                            <ShoppingCartIcon className="w-4 h-4" />
                            <span>Add to Cart</span>
                          </button>
                        ) : (
                          <span className="text-sm text-red-500 font-medium">
                            Out of stock
                          </span>
                        )}
                        <button
                          onClick={() => {
                            toggleWishlist(item.product);
                            showToast(`${item.product.name} removed from saved items`, "info", 2000);
                          }}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                          aria-label="Remove from wishlist"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer con acción principal */}
        {wishlist.items.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4 bg-gray-50">
            <Link
              href="/market"
              onClick={onClose}
              className="block w-full px-6 py-3 bg-negro text-white font-medium text-center rounded hover:bg-gray-800 transition-colors duration-200"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default WishlistDropdown;

