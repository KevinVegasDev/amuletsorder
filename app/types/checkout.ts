/**
 * Tipos para el proceso de checkout
 */

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentMethod {
  type: "card" | "paypal" | "apple_pay" | "google_pay";
  cardNumber?: string;
  cardHolderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  saveCard?: boolean;
}

export interface CheckoutStep {
  id: string;
  label: string;
  completed: boolean;
  current: boolean;
}

export interface CheckoutFormData {
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  shippingMethod: "standard" | "express" | "overnight";
  sameAsShipping?: boolean;
  billingAddress?: ShippingAddress;
}

export interface CheckoutValidationErrors {
  shippingAddress?: Partial<Record<keyof ShippingAddress, string>>;
  paymentMethod?: Partial<Record<keyof PaymentMethod, string>>;
  general?: string;
}

export interface ShippingMethod {
  id: "standard" | "express" | "overnight";
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

