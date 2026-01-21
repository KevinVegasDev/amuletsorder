"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../contexts/CartContext";
import { ShippingMethod } from "../../types/checkout";

interface CheckoutSummaryProps {
  selectedShippingMethod: ShippingMethod;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

/**
 * Resumen del pedido en el checkout (lado derecho)
 */
export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  selectedShippingMethod,
  subtotal,
  shipping,
  tax,
  total,
}) => {
  const { cart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="lg:sticky lg:top-4 h-fit">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-negro mb-6">Order Summary</h2>

        {/* Lista de productos */}
        <div className="space-y-4 mb-6 max-h-64 overflow-y-auto custom-scrollbar">
          {cart.items.map((item) => (
            <div key={item.product.id} className="flex gap-4">
              {/* Imagen del producto */}
              <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                {item.product.images && item.product.images.length > 0 ? (
                  <Image
                    src={item.product.images[0].src}
                    alt={item.product.images[0].alt || item.product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Información del producto */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/market/product/${item.product.slug}`}
                  className="text-sm font-medium text-negro hover:text-gray-600 transition-colors line-clamp-2"
                >
                  {item.product.name}
                </Link>
                <div className="mt-1 text-sm text-gray-500">
                  Quantity: {item.quantity}
                </div>
                <div className="mt-1 text-sm font-medium text-negro">
                  {formatPrice(item.product.price * item.quantity)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Método de envío */}
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm text-gray-600">Shipping</span>
            <div className="text-right">
              <div className="text-sm font-medium text-negro">
                {formatPrice(shipping)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {selectedShippingMethod.name}
              </div>
            </div>
          </div>
        </div>

        {/* Totales */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-900">{formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="text-gray-900">{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
            <span className="text-negro">Total</span>
            <span className="text-negro">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Información de seguridad */}
      <div className="mt-4 text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Secure checkout</span>
        </div>
        <p className="text-xs">
          Your payment information is encrypted and secure
        </p>
      </div>
    </div>
  );
};

