"use client";

import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

interface StripePaymentFormProps {
  orderId: number;
  orderKey: string;
  onSuccess: (orderId: number, orderKey: string) => void;
  onError: (message: string) => void;
}

/**
 * Formulario de pago con Stripe Elements (Payment Element).
 * Estilo Amulets: fondo claro, bordes suaves, botón negro.
 */
export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  orderId,
  orderKey,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsConfirming(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${typeof window !== "undefined" ? window.location.origin : ""}/checkout/success?order_id=${orderId}&key=${encodeURIComponent(orderKey)}`,
          payment_method_data: {
            billing_details: {
              address: {
                country: "US",
              },
            },
          },
        },
      });

      if (error) {
        onError(error.message ?? "Payment failed");
        return;
      }
      onSuccess(orderId, orderKey);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      <button
        type="submit"
        disabled={!stripe || !elements || isConfirming}
        className="w-full px-6 py-3 bg-negro text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isConfirming ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          "Pay now"
        )}
      </button>
    </form>
  );
};
