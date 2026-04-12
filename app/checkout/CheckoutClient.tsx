"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";
import { useCheckout } from "../market/hooks/useCheckout";
import { CheckoutHeader } from "../components/Checkout/CheckoutHeader";
import { CheckoutSummary } from "../components/Checkout/CheckoutSummary";
import { ShippingFormStripe } from "../components/Checkout/ShippingFormStripe";
import { StripePaymentForm } from "../components/Checkout/StripePaymentForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

/**
 * Cliente del checkout - maneja toda la lógica y renderiza los componentes.
 * Checkout 100% headless: pago con Stripe Elements, sin redirección a WooCommerce.
 */
export const CheckoutClient: React.FC = () => {
  const router = useRouter();
  const { cart } = useCart();
  const { showToast } = useToast();
  const [paymentSession, setPaymentSession] = useState<{
    orderId: number;
    orderKey: string;
    clientSecret: string;
  } | null>(null);

  const {
    currentStep,
    formData,
    errors,
    isProcessing,
    shippingMethods,
    selectedShippingMethod,
    shippingFromPrintful,
    shippingMethodsLoading,
    shippingStateRequired,
    updateShippingAddress,
    setShippingMethod,
    handleNextStep,
    handlePreviousStep,
    handleSubmit,
    validateCurrentStep,
    getSteps,
    calculateSubtotal,
    calculateShipping,
    calculateTax,
    calculateTotal,
  } = useCheckout();

  // Si el carrito está vacío, redirigir al mercado
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <span className="text-2xl font-bold text-negro mb-4">
            Your cart is empty
          </span>
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
              {/* Paso 0: Shipping (formulario propio: nombre, email, teléfono, dirección; sin Stripe Address Element) */}
              {currentStep === 0 && (
                <ShippingFormStripe
                  shippingAddress={formData.shippingAddress}
                  shippingMethods={shippingMethods}
                  selectedShippingMethod={selectedShippingMethod}
                  errors={errors}
                  onShippingAddressChange={updateShippingAddress}
                  onShippingMethodChange={setShippingMethod}
                  loading={shippingMethodsLoading}
                  ratesFromApi={shippingFromPrintful}
                  stateRequiredForRates={shippingStateRequired}
                />
              )}

              {/* Paso 1: Review o formulario de pago Stripe */}
              {currentStep === 1 && !paymentSession && (
                <div className="space-y-6">
                  <span className="text-xl font-bold text-negro block">Order Review</span>

                  {/* Resumen de envío */}
                  <div className="border-t border-gray-200 pt-6">
                    <span className="text-lg font-semibold text-negro mb-4 block">
                      Shipping Address
                    </span>
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

                  {/* Método de envío */}
                  <div className="border-t border-gray-200 pt-6">
                    <span className="text-lg font-semibold text-negro mb-4 block">
                      Shipping Method
                    </span>
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">
                        {selectedShippingMethod?.name ?? "—"}
                      </p>
                      <p>{selectedShippingMethod?.description ?? ""}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulario de pago Stripe (mismo paso Review, sin salir de la página) */}
              {currentStep === 1 && paymentSession && (
                <div className="space-y-6">
                  <span className="text-xl font-bold text-negro block">Payment</span>
                  <p className="text-sm text-gray-600">
                    Complete your order securely with your card.
                  </p>
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret: paymentSession.clientSecret,
                      locale: "en",
                      appearance: {
                        theme: "stripe",
                        variables: { colorPrimary: "#0a0a0a" },
                      },
                    }}
                  >
                    <StripePaymentForm
                      orderId={paymentSession.orderId}
                      orderKey={paymentSession.orderKey}
                      onSuccess={(orderId, orderKey) => {
                        router.push(
                          `/checkout/success?order_id=${orderId}&key=${encodeURIComponent(orderKey)}`,
                        );
                      }}
                      onError={(message) => showToast(message, "error", 5000)}
                    />
                  </Elements>
                  <button
                    type="button"
                    onClick={() => setPaymentSession(null)}
                    className="text-sm text-gray-600 hover:text-negro underline"
                  >
                    ← Back to review
                  </button>
                </div>
              )}

              {/* Botones de navegación (ocultos cuando se muestra el formulario Stripe) */}
              {!(currentStep === 1 && paymentSession) && (
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

                  {currentStep === 1 && !paymentSession ? (
                    <button
                      onClick={async () => {
                        if (!validateCurrentStep()) return;
                        const result = await handleSubmit();
                        if (result) setPaymentSession(result);
                      }}
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
                        "Place order"
                      )}
                    </button>
                  ) : (
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
                        "Continue"
                      )}
                    </button>
                  )}
                </div>
              )}
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
              shippingFromPrintful={shippingFromPrintful}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
