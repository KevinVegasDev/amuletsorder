"use client";

import { useState, useCallback, useEffect } from "react";
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
  /** true cuando las tarifas de envío vienen de la API de Printful (mismo cálculo que WooCommerce/Printful) */
  shippingFromPrintful: boolean;

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
  /** Crea pedido en WC y PaymentIntent en Stripe; devuelve { orderId, orderKey, clientSecret } para mostrar Stripe Elements. Sin redirección. */
  handleSubmit: () => Promise<{ orderId: number; orderKey: string; clientSecret: string } | null>;
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
  // Checkout con pago en WooCommerce:
  // 0: Shipping (datos de envío)
  // 1: Review (revisión y redirección a Woo para pagar)
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CheckoutFormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<CheckoutValidationErrors>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const { cart, clearCart } = useCart();
  const { showToast } = useToast();

  // Métodos de envío: estáticos por defecto, o dinámicos desde Printful cuando hay dirección
  const [shippingMethodsState, setShippingMethodsState] = useState<ShippingMethod[]>(DEFAULT_SHIPPING_METHODS);
  const [shippingMethodsLoading, setShippingMethodsLoading] = useState(false);
  const [shippingFromPrintful, setShippingFromPrintful] = useState(false);

  const shippingMethods = shippingMethodsState;
  const selectedShippingMethod =
    shippingMethods.find((m) => m.id === formData.shippingMethod) ||
    shippingMethods[0];

  // Obtener tarifas de envío (Printful o estáticas) cuando la dirección está lista
  useEffect(() => {
    const addr = formData.shippingAddress;
    if (!addr.country || (!addr.zipCode && !addr.city)) return;

    const cartItems = cart.items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      printfulVariantId: item.product.printfulVariants?.[0]?.variant_id,
      printfulSyncProductId: item.product.printfulSyncProductId,
    }));

    setShippingMethodsLoading(true);
    fetch("/api/shipping/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: addr, cartItems }),
    })
      .then((res) => res.json())
      .then((data) => {
        const rates = data.rates ?? DEFAULT_SHIPPING_METHODS;
        setShippingMethodsState(Array.isArray(rates) ? rates : DEFAULT_SHIPPING_METHODS);
        setShippingFromPrintful(Boolean(data.fromPrintful));
        setFormData((prev) => {
          const methods = Array.isArray(rates) ? rates : DEFAULT_SHIPPING_METHODS;
          const currentExists = methods.some((m: ShippingMethod) => m.id === prev.shippingMethod);
          if (!currentExists && methods.length > 0) {
            return { ...prev, shippingMethod: methods[0].id };
          }
          return prev;
        });
      })
      .catch(() => {
        setShippingMethodsState(DEFAULT_SHIPPING_METHODS);
        setShippingFromPrintful(false);
      })
      .finally(() => setShippingMethodsLoading(false));
  }, [
    formData.shippingAddress.country,
    formData.shippingAddress.zipCode,
    formData.shippingAddress.city,
    formData.shippingAddress.state,
    formData.shippingAddress.address,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    cart.items.map((i) => `${i.product.id}-${i.quantity}`).join(","),
  ]);

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
        } else if (
          shippingAddress.country === "US" &&
          !/^\d{5}(-\d{4})?$/.test(shippingAddress.zipCode)
        ) {
          newErrors.shippingAddress!.zipCode = "Please enter a valid ZIP code";
        }
        if (!shippingAddress.country.trim()) {
          newErrors.shippingAddress!.country = "Country is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors.shippingAddress || {}).length === 0;
      }
      case 1: // Review
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
   * Crear pedido en WooCommerce (pending) y PaymentIntent en Stripe.
   * Devuelve { orderId, orderKey, clientSecret } para que el front muestre Stripe Elements y confirme el pago.
   * Sin redirección a WooCommerce/Stripe hosted.
   */
  const handleSubmit = useCallback(async (): Promise<{
    orderId: number;
    orderKey: string;
    clientSecret: string;
  } | null> => {
    if (!validateCurrentStep()) {
      return null;
    }

    if (cart.items.length === 0) {
      showToast("Your cart is empty", "error", 3000);
      return null;
    }

    setIsProcessing(true);

    try {
      const { createWooCommerceOrder } = await import("../../lib/woocommerce-api");

      const totals = {
        subtotal: calculateSubtotal(),
        shipping: calculateShipping(),
        tax: calculateTax(),
        total: calculateTotal(),
      };

      const order = await createWooCommerceOrder(
        formData,
        cart.items,
        totals,
        selectedShippingMethod.name
      );

      const res = await fetch("/api/checkout/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          amount: totals.total,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error creating payment intent");
      }

      const { clientSecret } = await res.json();
      if (!clientSecret) throw new Error("Missing client secret");

      return { orderId: order.id, orderKey: order.order_key, clientSecret };
    } catch (error: any) {
      console.error("Error preparing payment:", error);
      showToast(
        error.message || "Failed to prepare payment. Please try again.",
        "error",
        5000
      );
      return null;
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
    showToast,
  ]);

  /**
   * Ir al siguiente paso (solo avanza de Shipping a Review; el pago se dispara desde el componente con handleSubmit).
   */
  const handleNextStep = useCallback(() => {
    if (validateCurrentStep() && currentStep < 1) {
      setCurrentStep(currentStep + 1);
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
        id: "review",
        label: "Review",
        completed: false,
        current: currentStep === 1,
      },
    ];
  }, [currentStep]);

  return {
    currentStep,
    formData,
    errors,
    isProcessing,
    shippingMethods,
    selectedShippingMethod,
    shippingFromPrintful,
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

