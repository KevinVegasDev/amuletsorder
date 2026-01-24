"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CartIcon, HeartHeaderIcon, PersonIcon } from "./icons";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import CartSidebar from "./CartSidebar";
import WishlistDropdown from "./WishlistDropdown";

const Header = () => {
  const { getCartItemCount } = useCart();
  const { getWishlistItemCount } = useWishlist();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  
  const cartItemCount = getCartItemCount();
  const wishlistItemCount = getWishlistItemCount();

  // Mensaje de la barra de anuncios (puedes cambiarlo fácilmente)
  const announcementMessage = "Free shipping on orders over $50";

  return (
    <>
      {/* Announcement Bar / Top Bar */}
      <div className="w-full bg-negro text-white text-center py-2.5 px-4 text-sm">
        <p className="m-0">{announcementMessage}</p>
      </div>

      <header className="w-full bg-white px-4 sm:px-[50px] py-2 ">
        <div className="flex items-center justify-around">
          {/* Logo y Navegación */}
          <div className="flex items-center gap-8 ">
            {/* Logo */}
            <div>
              <Link href="/" prefetch={true}>
                <Image
                  src="/logotipo.svg"
                  alt="AMULETS"
                  width={94}
                  height={15}
                  className="h-[15px] w-auto"
                />
              </Link>
            </div>

            {/* Navegación */}
            <nav className="hidden sm:flex items-center text-[20px]  ">
              <Link href="/" prefetch={true} className="px-4 py-2  text-black ">
                home
              </Link>
              <Link href="/market" prefetch={true} className="px-4 py-2  text-black">
                Market
              </Link>
              <Link href="/about-us" prefetch={true} className="px-4 py-2  text-black">
                about us
              </Link>
            </nav>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-4">
            {/* Cart icon with counter */}
            <div className=" transition-colors duration-200 hover:text-[var(--color-hovered)] relative flex items-center justify-center">
              <button
                onClick={() => {
                  setIsCartOpen(true);
                  setIsWishlistOpen(false); // Cerrar wishlist si está abierto
                }}
                className="relative flex items-center justify-center cursor-pointer"
                aria-label="Open shopping cart"
              >
                <CartIcon color="currentColor" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rosa text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* Wishlist icon with counter */}
            <div className=" transition-colors duration-200 hover:text-[var(--color-hovered)] relative flex items-center justify-center">
              <button
                onClick={() => {
                  setIsWishlistOpen(true);
                  setIsCartOpen(false); // Cerrar carrito si está abierto
                }}
                className="relative flex items-center cursor-pointer justify-center"
                aria-label="View saved products"
              >
                <HeartHeaderIcon fill="currentColor" />
                {wishlistItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rosa text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistItemCount > 99 ? "99+" : wishlistItemCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* User icon */}
            <div className="cursor-pointer transition-colors duration-200 hover:text-[var(--color-hovered)] flex items-center justify-center">
              <PersonIcon color="currentColor" />
            </div>
          </div>
        </div>
      </header>

      {/* CartSidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      {/* WishlistDropdown */}
      <WishlistDropdown
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />
    </>
  );
};

export default Header;
