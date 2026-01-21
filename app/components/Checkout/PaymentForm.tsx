"use client";

import React, { useState } from "react";
import { PaymentMethod } from "../../types/checkout";
import { CheckoutValidationErrors } from "../../types/checkout";

interface PaymentFormProps {
  paymentMethod: PaymentMethod;
  errors: CheckoutValidationErrors;
  onPaymentMethodChange: (payment: Partial<PaymentMethod>) => void;
}

/**
 * Formulario de pago
 */
export const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentMethod,
  errors,
  onPaymentMethodChange,
}) => {
  const [cardNumber, setCardNumber] = useState("");

  // Formatear número de tarjeta con espacios cada 4 dígitos
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted;
  };

  // Manejar cambio de número de tarjeta
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    onPaymentMethodChange({ cardNumber: formatted.replace(/\s/g, "") });
  };

  // Manejar cambio de mes/año
  const handleExpiryChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "month" | "year"
  ) => {
    if (type === "month") {
      onPaymentMethodChange({ expiryMonth: e.target.value });
    } else {
      onPaymentMethodChange({ expiryYear: e.target.value });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-negro">Payment Information</h2>

      {/* Tipo de pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Payment Method *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors duration-200 ${
              paymentMethod.type === "card"
                ? "border-negro bg-gray-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="paymentType"
              value="card"
              checked={paymentMethod.type === "card"}
              onChange={(e) =>
                onPaymentMethodChange({ 
                  type: e.target.value as "card" | "paypal" | "apple_pay" | "google_pay" 
                })
              }
              className="mr-3 h-4 w-4 text-negro focus:ring-negro"
            />
            <div className="flex items-center gap-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <span className="font-medium text-gray-700">Credit Card</span>
            </div>
          </label>

          <label
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors duration-200 ${
              paymentMethod.type === "paypal"
                ? "border-negro bg-gray-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="paymentType"
              value="paypal"
              checked={paymentMethod.type === "paypal"}
              onChange={(e) =>
                onPaymentMethodChange({ 
                  type: e.target.value as "card" | "paypal" | "apple_pay" | "google_pay" 
                })
              }
              className="mr-3 h-4 w-4 text-negro focus:ring-negro"
            />
            <div className="flex items-center gap-2">
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.05zm14.146-14.42a4.016 4.016 0 0 0-.08-.442c-.922-4.729-4.212-5.831-8.548-5.831H5.406a.947.947 0 0 0-.935 1.088l2.19 13.764a.946.946 0 0 0 .935.806h3.38c.524 0 .968-.382 1.05-.9l.818-5.144a.684.684 0 0 1 .677-.577h4.85c4.685 0 7.676-1.717 8.648-6.797.025-.15.05-.294.077-.437z" />
              </svg>
              <span className="font-medium text-gray-700">PayPal</span>
            </div>
          </label>
        </div>
      </div>

      {paymentMethod.type === "card" && (
        <>
          {/* Número de tarjeta */}
          <div>
            <label
              htmlFor="cardNumber"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Card Number *
            </label>
            <input
              type="text"
              id="cardNumber"
              value={cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-negro focus:border-transparent ${
                errors.paymentMethod?.cardNumber
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="1234 5678 9012 3456"
            />
            {errors.paymentMethod?.cardNumber && (
              <p className="mt-1 text-sm text-red-500">
                {errors.paymentMethod.cardNumber}
              </p>
            )}
          </div>

          {/* Nombre del titular */}
          <div>
            <label
              htmlFor="cardHolderName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cardholder Name *
            </label>
            <input
              type="text"
              id="cardHolderName"
              value={paymentMethod.cardHolderName || ""}
              onChange={(e) =>
                onPaymentMethodChange({ cardHolderName: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-negro focus:border-transparent ${
                errors.paymentMethod?.cardHolderName
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="John Doe"
            />
            {errors.paymentMethod?.cardHolderName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.paymentMethod.cardHolderName}
              </p>
            )}
          </div>

          {/* Fecha de expiración y CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="expiryMonth"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Expiry Date *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  id="expiryMonth"
                  value={paymentMethod.expiryMonth || ""}
                  onChange={(e) => handleExpiryChange(e, "month")}
                  maxLength={2}
                  placeholder="MM"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-negro focus:border-transparent ${
                    errors.paymentMethod?.expiryMonth
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <input
                  type="text"
                  id="expiryYear"
                  value={paymentMethod.expiryYear || ""}
                  onChange={(e) => handleExpiryChange(e, "year")}
                  maxLength={4}
                  placeholder="YYYY"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-negro focus:border-transparent ${
                    errors.paymentMethod?.expiryMonth
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
              </div>
              {errors.paymentMethod?.expiryMonth && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.paymentMethod.expiryMonth}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="cvv"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                CVV *
              </label>
              <input
                type="text"
                id="cvv"
                value={paymentMethod.cvv || ""}
                onChange={(e) =>
                  onPaymentMethodChange({ cvv: e.target.value })
                }
                maxLength={4}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-negro focus:border-transparent ${
                  errors.paymentMethod?.cvv
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="123"
              />
              {errors.paymentMethod?.cvv && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.paymentMethod.cvv}
                </p>
              )}
            </div>
          </div>

          {/* Guardar tarjeta */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="saveCard"
              checked={paymentMethod.saveCard || false}
              onChange={(e) =>
                onPaymentMethodChange({ saveCard: e.target.checked })
              }
              className="h-4 w-4 text-negro focus:ring-negro border-gray-300 rounded"
            />
            <label
              htmlFor="saveCard"
              className="ml-2 block text-sm text-gray-700"
            >
              Save card for future purchases
            </label>
          </div>
        </>
      )}

      {paymentMethod.type === "paypal" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            You will be redirected to PayPal to complete your payment.
          </p>
        </div>
      )}
    </div>
  );
};

