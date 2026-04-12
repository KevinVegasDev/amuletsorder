"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { CartIcon, HeartHeaderIcon } from "./icons";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import CartSidebar from "./CartSidebar";
import WishlistDropdown from "./WishlistDropdown";
import MoreDropdownPanel from "./MoreDropdownPanel";

interface HeaderProps {
  announcementMessage?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  announcementMessage 
}) => {
  const { getCartItemCount } = useCart();
  const { getWishlistItemCount } = useWishlist();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [alignLeft, setAlignLeft] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);

  const cartItemCount = getCartItemCount();
  const wishlistItemCount = getWishlistItemCount();

  const updateAlignLeft = useCallback(() => {
    if (navRef.current) {
      setAlignLeft(navRef.current.getBoundingClientRect().left);
    }
  }, []);

  useEffect(() => {
    updateAlignLeft();
    window.addEventListener("resize", updateAlignLeft);
    return () => window.removeEventListener("resize", updateAlignLeft);
  }, [updateAlignLeft]);

  // Mensaje de la barra de anuncios (se recibe por prop o usa default inline arriba)

  return (
    <>
      {/* Sticky wrapper */}
      <div className="sticky top-0 z-50">
        {/* Announcement Bar / Top Bar */}
        <div className="w-full bg-negro text-white text-center py-2.5 px-4 text-sm">
          <p className="m-0">{announcementMessage}</p>
        </div>

        <header className="w-full bg-white px-4 sm:px-[50px] py-2">
          {/* ===== DESKTOP HEADER ===== */}
          <div className="hidden sm:flex items-center justify-around">
            {/* Logo y Navegación */}
            <div ref={navRef} className="flex items-center gap-8">
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
              <nav className="flex items-center text-[20px] uppercase">
                <Link
                  href="/"
                  prefetch={true}
                  className="px-4 py-2 uppercase text-black"
                >
                  home
                </Link>
                <Link
                  href="/market"
                  prefetch={true}
                  className="px-4 py-2 text-black"
                >
                  Market
                </Link>
                <div
                  className="relative"
                  onMouseEnter={() => setIsMoreOpen(true)}
                  onMouseLeave={() => setIsMoreOpen(false)}
                >
                  <span className="px-4 py-2 text-black uppercase cursor-pointer">
                    More
                  </span>
                </div>
              </nav>
            </div>

            {/* Action icons */}
            <div className="flex items-center gap-4">
              {/* Cart icon with counter */}
              <div className="transition-colors duration-200 hover:text-[var(--color-hovered)] relative flex items-center justify-center">
                <button
                  onClick={() => {
                    setIsCartOpen(true);
                    setIsWishlistOpen(false);
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
              <div className="transition-colors duration-200 hover:text-[var(--color-hovered)] relative flex items-center justify-center">
                <button
                  onClick={() => {
                    setIsWishlistOpen(true);
                    setIsCartOpen(false);
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
            </div>
          </div>

          {/* ===== MOBILE HEADER ===== */}
          <div className="flex sm:hidden items-center justify-between py-1">
            {/* Logo */}
            <Link href="/" prefetch={true}>
              <Image
                src="/logotipo.svg"
                alt="AMULETS"
                width={94}
                height={15}
                className="h-[15px] w-auto"
              />
            </Link>

            {/* Right side: Cart + Burger */}
            <div className="flex items-center gap-4">
              {/* Cart icon */}
              <div className="relative flex items-center justify-center">
                <button
                  onClick={() => {
                    setIsCartOpen(true);
                    setIsMobileMenuOpen(false);
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

              {/* Wishlist icon */}
              <div className="relative flex items-center justify-center">
                <button
                  onClick={() => {
                    setIsWishlistOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="relative flex items-center justify-center cursor-pointer"
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

              {/* Burger menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex flex-col justify-center items-center gap-[5px] w-8 h-8 cursor-pointer"
                aria-label="Toggle menu"
              >
                <span
                  className={`w-5 h-[2px] bg-black transition-all duration-300 ${
                    isMobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""
                  }`}
                />
                <span
                  className={`w-5 h-[2px] bg-black transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`w-5 h-[2px] bg-black transition-all duration-300 ${
                    isMobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </header>

        <MoreDropdownPanel
          isOpen={isMoreOpen}
          alignLeft={alignLeft}
          onMouseEnter={() => setIsMoreOpen(true)}
          onMouseLeave={() => setIsMoreOpen(false)}
        />
      </div>

      {/* ===== MOBILE MENU BACKDROP ===== */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 sm:hidden ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* ===== MOBILE MENU PANEL (50% width, right side) ===== */}
      <div
        className={`fixed top-0 right-0 z-50 h-full py-[50px] w-[50%]  transition-transform duration-300 sm:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px 0 0 16px",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(3.4px)",
          WebkitBackdropFilter: "blur(3.4px)",
        }}
      >
        {/* Close button */}
        <div className="flex justify-end px-4 pt-4">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 cursor-pointer"
            aria-label="Close menu"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content aligned to the right */}
        <div className="flex flex-col items-end px-6 pt-8 gap-8">
          {/* Navigation links */}
          <nav className="flex flex-col items-end gap-6">
            <Link
              href="/"
              prefetch={true}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[24px] uppercase text-black font-medium"
            >
              Home
            </Link>
            <Link
              href="/market"
              prefetch={true}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[24px] uppercase text-black font-medium"
            >
              Market
            </Link>
          </nav>

          {/* More section */}
          <div className="flex flex-col items-end gap-6 border-t border-[#212121]/15 pt-6 w-full">
            <span className="text-[20px] uppercase text-black font-medium">More</span>

            {/* Customer Support */}
            <div className="flex flex-col items-end gap-3">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Customer Support</span>
              <div className="flex flex-col items-end gap-2">
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm uppercase text-black font-medium"
                >
                  Contact Us
                </Link>
                <Link
                  href="/shipping"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm uppercase text-black font-medium"
                >
                  Shipping
                </Link>
                <Link
                  href="/returns"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm uppercase text-black font-medium"
                >
                  Returns
                </Link>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-col items-end gap-3">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Links</span>
              <div className="flex flex-col items-end gap-2">
                <Link
                  href="/about-us"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm uppercase text-black font-medium"
                >
                  About
                </Link>
                <a
                  href="https://instagram.com/amuletsorder"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm uppercase text-black font-medium"
                >
                  Instagram
                </a>
                <a
                  href="https://youtube.com/@amuletsorder"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm uppercase text-black font-medium"
                >
                  YouTube
                </a>
                <a
                  href="https://tiktok.com/@amuletsorder"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm uppercase text-black font-medium"
                >
                  TikTok
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

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
