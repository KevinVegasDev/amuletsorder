"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";
import { XMarkIcon, TrashIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "./icons";

interface WishlistDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const WishlistDropdown: React.FC<WishlistDropdownProps> = ({ isOpen, onClose }) => {
  const { wishlist, removeFromWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();


  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleAddToCart = (productId: number) => {
    const item = wishlist.items.find((item) => item.product.id === productId);
    if (item && item.product.inStock) {
      addToCart(item.product, 1);
      showToast(`${item.product.name} added to cart`, "success", 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Dropdown/Modal - Sin overlay, solo flota */}
      <div
        className="fixed top-20 right-4 sm:right-[50px] w-[calc(100vw-2rem)] sm:w-[400px] max-h-[calc(100vh-6rem)] sm:max-h-[600px] bg-white z-50 shadow-2xl rounded-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <HeartIcon color="var(--color-negro)" filled={true} />
            <h2 className="text-lg sm:text-xl font-bold text-negro">
              Saved Products
            </h2>
            {wishlist.itemCount > 0 && (
              <span className="text-sm text-gray-500">
                ({wishlist.itemCount})
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200"
            aria-label="Close wishlist"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto">
          {wishlist.items.length === 0 ? (
            // Estado vacío
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <HeartIcon color="var(--color-negro)" filled={false} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No saved products
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Save products you like by clicking the heart icon
              </p>
              <Link
                href="/market"
                onClick={onClose}
                className="px-4 py-2 bg-negro text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors duration-200"
              >
                Explore products
              </Link>
            </div>
          ) : (
            // Lista de productos guardados
            <div className="p-4 space-y-3">
              {wishlist.items.map((item) => {
                const productImage = item.product.images[0];
                return (
                  <div
                    key={item.product.id}
                    className="flex gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 group"
                  >
                    {/* Imagen del producto */}
                    <Link
                      href={`/market/product/${item.product.slug}`}
                      onClick={onClose}
                      className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden"
                    >
                      {productImage ? (
                        <Image
                          src={productImage.src}
                          alt={productImage.alt || item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg
                            className="w-6 h-6"
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
                        <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2 hover:text-rosa transition-colors duration-200">
                          {item.product.name}
                        </h3>
                        <p className="text-sm font-semibold text-negro">
                          {formatPrice(item.product.price)}
                        </p>
                      </Link>

                      {/* Botones de acción */}
                      <div className="flex items-center gap-2 mt-2">
                        {item.product.inStock ? (
                          <button
                            onClick={() => handleAddToCart(item.product.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-negro text-white rounded hover:bg-gray-800 transition-colors duration-200"
                            aria-label="Add to cart"
                          >
                            <ShoppingCartIcon className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        ) : (
                          <span className="text-xs text-red-500 font-medium">
                            Out of stock
                          </span>
                        )}
                        <button
                          onClick={() => {
                            toggleWishlist(item.product);
                            showToast(`${item.product.name} removed from saved items`, "info", 2000);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                          aria-label="Remove from wishlist"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WishlistDropdown;

