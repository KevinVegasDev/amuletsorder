"use client";

import React from "react";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ToastContainer } from "./components/Toast";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <CartProvider>
      <WishlistProvider>
        <ToastProvider>
          {children}
          <ToastContainer />
        </ToastProvider>
      </WishlistProvider>
    </CartProvider>
  );
};

