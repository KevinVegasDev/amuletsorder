"use client";

import { useState, useCallback, useMemo } from "react";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../contexts/ToastContext";
import {
  ShippingAddress,
  PaymentMethod,
  CheckoutFormData,
  CheckoutValidationErrors,
  CheckoutStep,
  ShippingMethod,
} from "../../types/checkout";

interface UseCheckoutProps {
  onSuccess?: () => void;
}

interface UseCheckoutReturn {
  // Estado
  currentStep: number;
  formData: CheckoutFormData;
  errors: CheckoutValidationErrors;
  isProcessing: boolean;
  shippingMethods: ShippingMethod[];
  selectedShippingMethod: ShippingMethod;

  // Métodos
  setCurrentStep: (step: number) => void;
  updateShippingAddress: (address: Partial<ShippingAddress>) => void;
  updatePaymentMethod: (payment: Partial<PaymentMethod>) => void;
  setShippingMethod: (methodId: ShippingMethod["id"]) => void;
  setSameAsShipping: (same: boolean) => void;
  updateBillingAddress: (address: Partial<ShippingAddress>) => void;
  validateCurrentStep: () => boolean;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  handleSubmit: () => Promise<void>;
  getSteps: () => CheckoutStep[];
  calculateSubtotal: () => number;
  calculateShipping: () => number;
  calculateTax: () => number;
  calculateTotal: () => number;
}

const DEFAULT_SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "standard",
    name: "Standard Shipping",
    description: "5-7 business days",
    price: 0,
    estimatedDays: "5-7",
  },
  {
    id: "express",
    name: "Express Shipping",
    description: "2-3 business days",
    price: 15.99,
    estimatedDays: "2-3",
  },
  {
    id: "overnight",
    name: "Overnight Shipping",
    description: "Next business day",
    price: 29.99,
    estimatedDays: "1",
  },
];

const DEFAULT_FORM_DATA: CheckoutFormData = {
  shippingAddress: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  },
  paymentMethod: {
    type: "card",
    cardNumber: "",
    cardHolderName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    saveCard: false,
  },
  shippingMethod: "standard",
  sameAsShipping: true,
};

/**
 * Hook para manejar toda la lógica del checkout
 */
export const useCheckout = ({
  onSuccess,
}: UseCheckoutProps = {}): UseCheckoutReturn => {
  const [currentStep, setCurrentStep] = useState(0); // 0: Shipping, 1: Payment, 2: Review
  const [formData, setFormData] = useState<CheckoutFormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<CheckoutValidationErrors>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const { cart, clearCart } = useCart();
  const { showToast } = useToast();

  // Métodos de envío disponibles
  const shippingMethods = DEFAULT_SHIPPING_METHODS;
  const selectedShippingMethod =
    shippingMethods.find((m) => m.id === formData.shippingMethod) ||
    shippingMethods[0];

  /**
   * Validar email
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validar teléfono
   */
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
  };

  /**
   * Validar paso actual
   */
  const validateCurrentStep = useCallback((): boolean => {
    switch (currentStep) {
      case 0: {
        // Shipping - validar dirección de envío
        const newErrors: CheckoutValidationErrors = {
          shippingAddress: {},
        };

        const { shippingAddress } = formData;

        if (!shippingAddress.firstName.trim()) {
          newErrors.shippingAddress!.firstName = "First name is required";
        }
        if (!shippingAddress.lastName.trim()) {
          newErrors.shippingAddress!.lastName = "Last name is required";
        }
        if (!shippingAddress.email.trim()) {
          newErrors.shippingAddress!.email = "Email is required";
        } else if (!validateEmail(shippingAddress.email)) {
          newErrors.shippingAddress!.email = "Please enter a valid email";
        }
        if (!shippingAddress.phone.trim()) {
          newErrors.shippingAddress!.phone = "Phone number is required";
        } else if (!validatePhone(shippingAddress.phone)) {
          newErrors.shippingAddress!.phone = "Please enter a valid phone number";
        }
        if (!shippingAddress.address.trim()) {
          newErrors.shippingAddress!.address = "Address is required";
        }
        if (!shippingAddress.city.trim()) {
          newErrors.shippingAddress!.city = "City is required";
        }
        if (!shippingAddress.state.trim()) {
          newErrors.shippingAddress!.state = "State is required";
        }
        if (!shippingAddress.zipCode.trim()) {
          newErrors.shippingAddress!.zipCode = "ZIP code is required";
        } else if (!/^\d{5}(-\d{4})?$/.test(shippingAddress.zipCode)) {
          newErrors.shippingAddress!.zipCode = "Please enter a valid ZIP code";
        }
        if (!shippingAddress.country.trim()) {
          newErrors.shippingAddress!.country = "Country is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors.shippingAddress || {}).length === 0;
      }
      case 1: {
        // Payment - validar método de pago
        const newErrors: CheckoutValidationErrors = {
          paymentMethod: {},
        };

        const { paymentMethod } = formData;

        if (paymentMethod.type === "card") {
          if (!paymentMethod.cardNumber) {
            newErrors.paymentMethod!.cardNumber = "Card number is required";
          } else {
            const cardNumber = paymentMethod.cardNumber.replace(/\s/g, "");
            if (cardNumber.length < 13 || cardNumber.length > 19) {
              newErrors.paymentMethod!.cardNumber = "Invalid card number";
            }
          }
          if (!paymentMethod.cardHolderName) {
            newErrors.paymentMethod!.cardHolderName = "Cardholder name is required";
          }
          if (!paymentMethod.expiryMonth || !paymentMethod.expiryYear) {
            newErrors.paymentMethod!.expiryMonth = "Expiry date is required";
          }
          if (!paymentMethod.cvv) {
            newErrors.paymentMethod!.cvv = "CVV is required";
          } else if (!/^\d{3,4}$/.test(paymentMethod.cvv)) {
            newErrors.paymentMethod!.cvv = "Invalid CVV";
          }
        }

        setErrors(newErrors);
        return Object.keys(newErrors.paymentMethod || {}).length === 0;
      }
      case 2: // Review
        return true;
      default:
        return false;
    }
  }, [currentStep, formData]);

  /**
   * Actualizar dirección de envío
   */
  const updateShippingAddress = useCallback(
    (address: Partial<ShippingAddress>) => {
      setFormData((prev) => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          ...address,
        },
      }));
      // Limpiar errores del campo actualizado
      if (errors.shippingAddress) {
        const updatedErrors = { ...errors.shippingAddress };
        Object.keys(address).forEach((key) => {
          delete updatedErrors[key as keyof ShippingAddress];
        });
        setErrors({
          ...errors,
          shippingAddress: Object.keys(updatedErrors).length
            ? updatedErrors
            : undefined,
        });
      }
    },
    [errors]
  );

  /**
   * Actualizar método de pago
   */
  const updatePaymentMethod = useCallback((payment: Partial<PaymentMethod>) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: {
        ...prev.paymentMethod,
        ...payment,
      },
    }));
    // Limpiar errores del campo actualizado
    if (errors.paymentMethod) {
      const updatedErrors = { ...errors.paymentMethod };
      Object.keys(payment).forEach((key) => {
        delete updatedErrors[key as keyof PaymentMethod];
      });
      setErrors({
        ...errors,
        paymentMethod: Object.keys(updatedErrors).length
          ? updatedErrors
          : undefined,
      });
    }
  }, [errors]);

  /**
   * Establecer método de envío
   */
  const setShippingMethod = useCallback(
    (methodId: ShippingMethod["id"]) => {
      setFormData((prev) => ({
        ...prev,
        shippingMethod: methodId,
      }));
    },
    []
  );

  /**
   * Establecer si la dirección de facturación es la misma que la de envío
   */
  const setSameAsShipping = useCallback((same: boolean) => {
    setFormData((prev) => ({
      ...prev,
      sameAsShipping: same,
      billingAddress: same ? undefined : prev.shippingAddress,
    }));
  }, []);

  /**
   * Actualizar dirección de facturación
   */
  const updateBillingAddress = useCallback(
    (address: Partial<ShippingAddress>) => {
      setFormData((prev) => ({
        ...prev,
        billingAddress: {
          ...(prev.billingAddress || prev.shippingAddress),
          ...address,
        },
      }));
    },
    []
  );

  /**
   * Ir al siguiente paso
   */
  const handleNextStep = useCallback(() => {
    if (validateCurrentStep()) {
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  }, [currentStep, validateCurrentStep]);

  /**
   * Volver al paso anterior
   */
  const handlePreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  /**
   * Calcular subtotal
   */
  const calculateSubtotal = useCallback((): number => {
    return cart.total;
  }, [cart.total]);

  /**
   * Calcular costo de envío
   */
  const calculateShipping = useCallback((): number => {
    return selectedShippingMethod.price;
  }, [selectedShippingMethod]);

  /**
   * Calcular impuesto (8% simplificado)
   */
  const calculateTax = useCallback((): number => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    return (subtotal + shipping) * 0.08;
  }, [calculateSubtotal, calculateShipping]);

  /**
   * Calcular total
   */
  const calculateTotal = useCallback((): number => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const tax = calculateTax();
    return subtotal + shipping + tax;
  }, [calculateSubtotal, calculateShipping, calculateTax]);

  /**
   * Obtener pasos del checkout
   */
  const getSteps = useCallback((): CheckoutStep[] => {
    return [
      {
        id: "shipping",
        label: "Shipping",
        completed: currentStep > 0,
        current: currentStep === 0,
      },
      {
        id: "payment",
        label: "Payment",
        completed: currentStep > 1,
        current: currentStep === 1,
      },
      {
        id: "review",
        label: "Review",
        completed: false,
        current: currentStep === 2,
      },
    ];
  }, [currentStep]);

  /**
   * Procesar el pedido
   * 
   * TODO: Conectar con WooCommerce + Stripe cuando esté listo
   * 
   * Flujo actual (simulado):
   * 1. Validar formulario
   * 2. Simular creación de pedido
   * 3. Limpiar carrito
   * 4. Redirigir a éxito
   * 
   * Flujo con WooCommerce + Stripe (cuando esté conectado):
   * 1. Validar formulario
   * 2. Crear pedido en WooCommerce (createWooCommerceOrder)
   * 3. Si hay payment_url, redirigir a Stripe
   * 4. O procesar pago directamente con Stripe (processStripePayment)
   * 5. Confirmar pago (confirmStripePayment)
   * 6. Limpiar carrito solo si el pago es exitoso
   * 7. Redirigir a página de éxito con order_id
   */
  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (cart.items.length === 0) {
      showToast("Your cart is empty", "error", 3000);
      return;
    }

    setIsProcessing(true);

    try {
      // ============================================
      // TODO: DESCOMENTAR Y CONECTAR CON WOOCOMMERCE
      // ============================================
      /*
      // Importar funciones de WooCommerce API
      import {
        createWooCommerceOrder,
        processStripePayment,
        confirmStripePayment,
      } from "../../lib/woocommerce-api";

      // Calcular totales
      const totals = {
        subtotal: calculateSubtotal(),
        shipping: calculateShipping(),
        tax: calculateTax(),
        total: calculateTotal(),
      };

      // 1. Crear pedido en WooCommerce
      const order = await createWooCommerceOrder(
        formData,
        cart.items,
        totals
      );

      // 2. Si WooCommerce devuelve payment_url (Stripe Checkout), redirigir
      if (order.payment_url) {
        // Redirigir a Stripe para completar el pago
        window.location.href = order.payment_url;
        return;
      }

      // 3. Si no hay payment_url, procesar pago directamente con Stripe
      // (Esto requiere que tengas Stripe Elements configurado en el frontend)
      if (formData.paymentMethod.type === "card") {
        // Crear Payment Intent
        const paymentData = await processStripePayment(order.id);

        // Confirmar pago con Stripe
        // NOTA: Esto requiere tener Stripe.js cargado en el frontend
        // y un payment_method_id creado con Stripe Elements
        const confirmation = await confirmStripePayment(
          paymentData.client_secret,
          formData.paymentMethod.paymentMethodId || "" // TODO: Obtener de Stripe Elements
        );

        if (!confirmation.success) {
          throw new Error("Payment failed");
        }
      }

      // 4. Si el pago es exitoso, limpiar carrito
      clearCart();

      // 5. Mostrar mensaje de éxito
      showToast("Order placed successfully!", "success", 3000);

      // 6. Redirigir a página de confirmación con order_id
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = `/checkout/success?order_id=${order.id}`;
      }
      */

      // ============================================
      // CÓDIGO TEMPORAL (SIMULACIÓN) - ELIMINAR CUANDO CONECTES
      // ============================================
      // Simular procesamiento del pedido
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Log para desarrollo
      console.log("⚠️ Order submitted (simulated):", {
        formData,
        cart: cart.items,
        totals: {
          subtotal: calculateSubtotal(),
          shipping: calculateShipping(),
          tax: calculateTax(),
          total: calculateTotal(),
        },
      });

      // Limpiar carrito
      clearCart();

      // Mostrar mensaje de éxito
      showToast("Order placed successfully!", "success", 3000);

      // Llamar callback de éxito
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirigir a página de confirmación
        window.location.href = "/checkout/success";
      }
      // ============================================
    } catch (error) {
      console.error("Error processing order:", error);
      showToast("Failed to process order. Please try again.", "error", 3000);
    } finally {
      setIsProcessing(false);
    }
  }, [
    formData,
    cart,
    validateCurrentStep,
    calculateSubtotal,
    calculateShipping,
    calculateTax,
    calculateTotal,
    clearCart,
    showToast,
    onSuccess,
  ]);

  return {
    currentStep,
    formData,
    errors,
    isProcessing,
    shippingMethods,
    selectedShippingMethod,
    setCurrentStep,
    updateShippingAddress,
    updatePaymentMethod,
    setShippingMethod,
    setSameAsShipping,
    updateBillingAddress,
    validateCurrentStep,
    handleNextStep,
    handlePreviousStep,
    handleSubmit,
    getSteps,
    calculateSubtotal,
    calculateShipping,
    calculateTax,
    calculateTotal,
  };
};

