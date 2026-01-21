"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../contexts/CartContext";
import { useCheckout } from "../market/hooks/useCheckout";
import { CheckoutHeader } from "../components/Checkout/CheckoutHeader";
import { CheckoutSummary } from "../components/Checkout/CheckoutSummary";
import { ShippingForm } from "../components/Checkout/ShippingForm";
import { PaymentForm } from "../components/Checkout/PaymentForm";

/**
 * Cliente del checkout - maneja toda la lógica y renderiza los componentes
 */
export const CheckoutClient: React.FC = () => {
  const router = useRouter();
  const { cart } = useCart();

  const {
    currentStep,
    formData,
    errors,
    isProcessing,
    shippingMethods,
    selectedShippingMethod,
    updateShippingAddress,
    updatePaymentMethod,
    setShippingMethod,
    handleNextStep,
    handlePreviousStep,
    getSteps,
    calculateSubtotal,
    calculateShipping,
    calculateTax,
    calculateTotal,
  } = useCheckout({
    onSuccess: () => {
      router.push("/checkout/success");
    },
  });

  // Si el carrito está vacío, redirigir al mercado
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-negro mb-4">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-6">
            Add some items to your cart before checkout
          </p>
          <button
            onClick={() => router.push("/market")}
            className="px-6 py-3 bg-negro text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const steps = getSteps();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con pasos */}
      <CheckoutHeader steps={steps} />

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario (izquierda - 2/3) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
              {/* Paso 0: Shipping */}
              {currentStep === 0 && (
                <ShippingForm
                  shippingAddress={formData.shippingAddress}
                  shippingMethods={shippingMethods}
                  selectedShippingMethod={selectedShippingMethod}
                  errors={errors}
                  onShippingAddressChange={updateShippingAddress}
                  onShippingMethodChange={setShippingMethod}
                />
              )}

              {/* Paso 1: Payment */}
              {currentStep === 1 && (
                <PaymentForm
                  paymentMethod={formData.paymentMethod}
                  errors={errors}
                  onPaymentMethodChange={updatePaymentMethod}
                />
              )}

              {/* Paso 2: Review */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-negro">Order Review</h2>

                  {/* Resumen de envío */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-negro mb-4">
                      Shipping Address
                    </h3>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p className="font-medium">
                        {formData.shippingAddress.firstName}{" "}
                        {formData.shippingAddress.lastName}
                      </p>
                      <p>{formData.shippingAddress.address}</p>
                      {formData.shippingAddress.apartment && (
                        <p>{formData.shippingAddress.apartment}</p>
                      )}
                      <p>
                        {formData.shippingAddress.city},{" "}
                        {formData.shippingAddress.state}{" "}
                        {formData.shippingAddress.zipCode}
                      </p>
                      <p>{formData.shippingAddress.country}</p>
                      <p className="mt-2">{formData.shippingAddress.email}</p>
                      <p>{formData.shippingAddress.phone}</p>
                    </div>
                  </div>

                  {/* Resumen de pago */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-negro mb-4">
                      Payment Method
                    </h3>
                    <div className="text-sm text-gray-700">
                      {formData.paymentMethod.type === "card" ? (
                        <>
                          <p className="font-medium">
                            {formData.paymentMethod.cardHolderName}
                          </p>
                          <p>
                            **** **** ****{" "}
                            {formData.paymentMethod.cardNumber?.slice(-4) ||
                              "0000"}
                          </p>
                          <p>
                            {formData.paymentMethod.expiryMonth}/
                            {formData.paymentMethod.expiryYear}
                          </p>
                        </>
                      ) : (
                        <p className="font-medium">
                          {formData.paymentMethod.type.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Método de envío */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-negro mb-4">
                      Shipping Method
                    </h3>
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">{selectedShippingMethod.name}</p>
                      <p>{selectedShippingMethod.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de navegación */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                {currentStep > 0 ? (
                  <button
                    onClick={handlePreviousStep}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-white text-negro border-2 border-gray-300 font-medium rounded hover:bg-gray-50 hover:border-negro transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                ) : (
                  <div />
                )}

                <button
                  onClick={handleNextStep}
                  disabled={isProcessing}
                  className="px-8 py-3 bg-negro text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? (
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : currentStep === 2 ? (
                    "Place Order"
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Resumen del pedido (derecha - 1/3) */}
          <div className="lg:col-span-1">
            <CheckoutSummary
              selectedShippingMethod={selectedShippingMethod}
              subtotal={calculateSubtotal()}
              shipping={calculateShipping()}
              tax={calculateTax()}
              total={calculateTotal()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

