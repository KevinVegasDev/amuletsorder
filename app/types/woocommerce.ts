/**
 * Tipos para integración con WooCommerce API
 * Estos tipos corresponden a la estructura de datos de WooCommerce Orders
 */

import { ShippingAddress } from "./checkout";

/**
 * Item de línea de pedido de WooCommerce
 */
export interface WooCommerceLineItem {
  product_id: number;
  quantity: number;
  variation_id?: number;
  subtotal?: string;
  total?: string;
}

/**
 * Dirección de envío de WooCommerce
 */
export interface WooCommerceShippingAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

/**
 * Dirección de facturación de WooCommerce
 */
export interface WooCommerceBillingAddress extends WooCommerceShippingAddress {
  email: string;
  phone: string;
}

/**
 * Método de envío de WooCommerce
 */
export interface WooCommerceShippingLine {
  method_title: string;
  method_id: string;
  total: string;
}

/**
 * Pedido de WooCommerce (para crear)
 */
export interface WooCommerceCreateOrder {
  payment_method: string;
  payment_method_title: string;
  set_paid: boolean;
  billing: WooCommerceBillingAddress;
  shipping: WooCommerceShippingAddress;
  line_items: WooCommerceLineItem[];
  shipping_lines: WooCommerceShippingLine[];
  meta_data?: Array<{
    key: string;
    value: string | number | boolean;
  }>;
}

/**
 * Respuesta de WooCommerce al crear pedido
 */
export interface WooCommerceOrderResponse {
  id: number;
  order_key: string;
  status: string;
  currency: string;
  date_created: string;
  total: string;
  payment_url?: string; // URL de pago de Stripe si está disponible
  // ... otros campos de WooCommerce
}

/**
 * Respuesta de error de WooCommerce
 */
export interface WooCommerceErrorResponse {
  code: string;
  message: string;
  data?: {
    status: number;
    [key: string]: any;
  };
}

/**
 * Datos para procesar pago con Stripe a través de WooCommerce
 */
export interface StripePaymentData {
  order_id: number;
  payment_intent_id?: string;
  client_secret?: string;
  payment_method_id?: string;
}

