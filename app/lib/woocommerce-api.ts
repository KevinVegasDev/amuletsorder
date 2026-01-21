/**
 * Funciones para interactuar con WooCommerce API
 * 
 * TODO: Conectar con WooCommerce cuando esté listo
 * 
 * Pasos para conectar:
 * 1. Asegúrate de tener WooCommerce instalado en WordPress
 * 2. Configura las credenciales de API en .env:
 *    - WORDPRESS_API_URL (ej: https://tudominio.com/wp-json/wc/v3)
 *    - WORDPRESS_CONSUMER_KEY
 *    - WORDPRESS_CONSUMER_SECRET
 * 3. Instala y configura WooCommerce Stripe Payment Gateway
 * 4. Descomenta y ajusta las funciones según tu configuración
 */

import {
  WooCommerceCreateOrder,
  WooCommerceOrderResponse,
  WooCommerceErrorResponse,
} from "../types/woocommerce";
import { CartItem } from "../types/cart";
import { CheckoutFormData } from "../types/checkout";

// Configuración de la API de WooCommerce
const getWooCommerceConfig = () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
    process.env.WORDPRESS_API_URL ||
    "https://headlessamulets.in/wp-json/wc/v3";

  const consumerKey = process.env.WORDPRESS_CONSUMER_KEY || "";
  const consumerSecret = process.env.WORDPRESS_CONSUMER_SECRET || "";

  return {
    baseUrl,
    consumerKey,
    consumerSecret,
  };
};

/**
 * Crear headers de autenticación para WooCommerce API
 */
function createWooCommerceAuthHeaders(): HeadersInit {
  const config = getWooCommerceConfig();
  const auth = Buffer.from(
    `${config.consumerKey}:${config.consumerSecret}`
  ).toString("base64");

  return {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json",
  };
}

/**
 * Transformar items del carrito a formato WooCommerce
 */
function transformCartItemsToWooCommerce(
  cartItems: CartItem[]
): WooCommerceCreateOrder["line_items"] {
  return cartItems.map((item) => ({
    product_id: item.product.id,
    quantity: item.quantity,
    // Si el producto tiene variación, incluir variation_id
    // variation_id: item.product.variationId, // TODO: Agregar si usas variaciones
  }));
}

/**
 * Transformar dirección de envío a formato WooCommerce
 */
function transformShippingAddressToWooCommerce(
  shippingAddress: CheckoutFormData["shippingAddress"]
): WooCommerceCreateOrder["shipping"] {
  return {
    first_name: shippingAddress.firstName,
    last_name: shippingAddress.lastName,
    address_1: shippingAddress.address,
    address_2: shippingAddress.apartment || "",
    city: shippingAddress.city,
    state: shippingAddress.state,
    postcode: shippingAddress.zipCode,
    country: shippingAddress.country,
    email: shippingAddress.email,
    phone: shippingAddress.phone,
  };
}

/**
 * Transformar dirección de facturación a formato WooCommerce
 */
function transformBillingAddressToWooCommerce(
  formData: CheckoutFormData
): WooCommerceCreateOrder["billing"] {
  const billingAddress = formData.sameAsShipping
    ? formData.shippingAddress
    : formData.billingAddress || formData.shippingAddress;

  return {
    first_name: billingAddress.firstName,
    last_name: billingAddress.lastName,
    address_1: billingAddress.address,
    address_2: billingAddress.apartment || "",
    city: billingAddress.city,
    state: billingAddress.state,
    postcode: billingAddress.zipCode,
    country: billingAddress.country,
    email: billingAddress.email,
    phone: billingAddress.phone,
  };
}

/**
 * Crear pedido en WooCommerce
 * 
 * TODO: Implementar cuando WooCommerce esté configurado
 * 
 * Esta función:
 * 1. Crea el pedido en WooCommerce
 * 2. WooCommerce procesa el pago con Stripe
 * 3. Devuelve la URL de pago o confirmación
 * 
 * @param formData - Datos del formulario de checkout
 * @param cartItems - Items del carrito
 * @param totals - Totales calculados
 * @returns Respuesta de WooCommerce con el pedido creado
 */
export async function createWooCommerceOrder(
  formData: CheckoutFormData,
  cartItems: CartItem[],
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  }
): Promise<WooCommerceOrderResponse> {
  const config = getWooCommerceConfig();

  // TODO: Descomentar cuando WooCommerce esté listo
  /*
  try {
    // Preparar datos del pedido
    const orderData: WooCommerceCreateOrder = {
      payment_method: formData.paymentMethod.type === "card" ? "stripe" : "paypal",
      payment_method_title:
        formData.paymentMethod.type === "card"
          ? "Credit Card (Stripe)"
          : "PayPal",
      set_paid: false, // No marcar como pagado hasta que Stripe confirme
      billing: transformBillingAddressToWooCommerce(formData),
      shipping: transformShippingAddressToWooCommerce(formData.shippingAddress),
      line_items: transformCartItemsToWooCommerce(cartItems),
      shipping_lines: [
        {
          method_title: "Standard Shipping", // TODO: Usar el método seleccionado
          method_id: "flat_rate",
          total: totals.shipping.toFixed(2),
        },
      ],
    };

    // Crear pedido en WooCommerce
    const response = await fetch(`${config.baseUrl}/orders`, {
      method: "POST",
      headers: createWooCommerceAuthHeaders(),
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error: WooCommerceErrorResponse = await response.json();
      throw new Error(error.message || "Error creating order");
    }

    const order: WooCommerceOrderResponse = await response.json();

    // Si WooCommerce Stripe Gateway está configurado, puede devolver payment_url
    // Esta URL redirige a Stripe para completar el pago
    if (order.payment_url) {
      return order;
    }

    // Si no hay payment_url, el pago se procesa automáticamente
    // o necesitas llamar a processStripePayment() después
    return order;
  } catch (error) {
    console.error("Error creating WooCommerce order:", error);
    throw error;
  }
  */

  // TEMPORAL: Simulación para desarrollo
  console.log("⚠️ WooCommerce integration not yet connected");
  console.log("Order data:", {
    formData,
    cartItems,
    totals,
  });

  // Simular respuesta
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Math.floor(Math.random() * 10000),
        order_key: `order_${Date.now()}`,
        status: "pending",
        currency: "USD",
        date_created: new Date().toISOString(),
        total: totals.total.toFixed(2),
        // payment_url: "https://checkout.stripe.com/...", // URL de Stripe cuando esté conectado
      });
    }, 1000);
  });
}

/**
 * Procesar pago con Stripe a través de WooCommerce
 * 
 * TODO: Implementar cuando WooCommerce Stripe Gateway esté configurado
 * 
 * Esta función:
 * 1. Crea un Payment Intent en Stripe (a través de WooCommerce)
 * 2. Devuelve el client_secret para confirmar el pago en el frontend
 * 
 * @param orderId - ID del pedido en WooCommerce
 * @param paymentMethodId - ID del método de pago de Stripe (si aplica)
 * @returns Datos del pago incluyendo client_secret
 */
export async function processStripePayment(
  orderId: number,
  paymentMethodId?: string
): Promise<{ client_secret: string; payment_intent_id: string }> {
  const config = getWooCommerceConfig();

  // TODO: Descomentar cuando WooCommerce Stripe Gateway esté listo
  /*
  try {
    // WooCommerce Stripe Gateway tiene un endpoint para crear Payment Intent
    // La ruta exacta depende de tu configuración
    const response = await fetch(
      `${config.baseUrl}/stripe/payment-intent`,
      {
        method: "POST",
        headers: createWooCommerceAuthHeaders(),
        body: JSON.stringify({
          order_id: orderId,
          payment_method_id: paymentMethodId,
        }),
      }
    );

    if (!response.ok) {
      const error: WooCommerceErrorResponse = await response.json();
      throw new Error(error.message || "Error creating payment intent");
    }

    const data = await response.json();
    return {
      client_secret: data.client_secret,
      payment_intent_id: data.payment_intent_id,
    };
  } catch (error) {
    console.error("Error processing Stripe payment:", error);
    throw error;
  }
  */

  // TEMPORAL: Simulación para desarrollo
  console.log("⚠️ Stripe payment processing not yet connected");
  console.log("Payment data:", { orderId, paymentMethodId });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        client_secret: `pi_mock_${Date.now()}`,
        payment_intent_id: `pi_${Date.now()}`,
      });
    }, 500);
  });
}

/**
 * Confirmar pago de Stripe
 * 
 * TODO: Implementar cuando Stripe esté conectado
 * 
 * Esta función confirma el pago con Stripe usando el client_secret
 * 
 * @param clientSecret - Client secret de Stripe
 * @param paymentMethodId - ID del método de pago
 * @returns Resultado de la confirmación
 */
export async function confirmStripePayment(
  clientSecret: string,
  paymentMethodId: string
): Promise<{ success: boolean; order_id?: number }> {
  // TODO: Descomentar cuando Stripe esté conectado
  /*
  try {
    // Usar Stripe.js en el frontend para confirmar el pago
    // O hacer una llamada a tu API de Next.js que confirme con Stripe
    const response = await fetch("/api/stripe/confirm-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_secret: clientSecret,
        payment_method_id: paymentMethodId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to confirm payment");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error confirming Stripe payment:", error);
    throw error;
  }
  */

  // TEMPORAL: Simulación para desarrollo
  console.log("⚠️ Stripe payment confirmation not yet connected");
  console.log("Confirmation data:", { clientSecret, paymentMethodId });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        order_id: Math.floor(Math.random() * 10000),
      });
    }, 1000);
  });
}

/**
 * Obtener estado de un pedido
 * 
 * TODO: Implementar para verificar el estado del pedido después del pago
 */
export async function getWooCommerceOrder(
  orderId: number
): Promise<WooCommerceOrderResponse> {
  const config = getWooCommerceConfig();

  // TODO: Descomentar cuando WooCommerce esté listo
  /*
  try {
    const response = await fetch(`${config.baseUrl}/orders/${orderId}`, {
      method: "GET",
      headers: createWooCommerceAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Error fetching order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching WooCommerce order:", error);
    throw error;
  }
  */

  // TEMPORAL: Simulación
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: orderId,
        order_key: `order_${orderId}`,
        status: "processing",
        currency: "USD",
        date_created: new Date().toISOString(),
        total: "0.00",
      });
    }, 500);
  });
}

