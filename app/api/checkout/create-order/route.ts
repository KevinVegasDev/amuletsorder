import { NextRequest, NextResponse } from "next/server";
import { CartItem } from "@/app/types/cart";
import { CheckoutFormData } from "@/app/types/checkout";

export const runtime = "nodejs";

const WOOCOMMERCE_URL =
  process.env.WORDPRESS_API_URL ||
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  "https://headlessamulets.in/wp-json/wc/v3";

const CONSUMER_KEY = process.env.WORDPRESS_CONSUMER_KEY || "";
const CONSUMER_SECRET = process.env.WORDPRESS_CONSUMER_SECRET || "";

function getStoreBaseUrlFromApiUrl(apiBaseUrl: string): string {
  const url = new URL(apiBaseUrl);
  const wpJsonIndex = url.pathname.indexOf("/wp-json/");
  const prefix = wpJsonIndex >= 0 ? url.pathname.slice(0, wpJsonIndex) : "";
  return `${url.origin}${prefix}`.replace(/\/$/, "");
}

/**
 * Crear headers de autenticación para WooCommerce API
 */
function createAuthHeader(): string {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString(
    "base64"
  );
  return `Basic ${auth}`;
}

/**
 * Transformar items del carrito al formato de WooCommerce
 */
function transformCartItems(cartItems: CartItem[]) {
  return cartItems.map((item) => {
    // Si el producto tiene parentId, significa que agregamos una variación al carrito.
    // product.id es el ID de la variación y parentId es el ID del producto principal.
    const isVariation = !!item.product.parentId;
    return {
      product_id: isVariation ? item.product.parentId : item.product.id,
      quantity: item.quantity,
      ...(isVariation && { variation_id: item.product.id }),
    };
  });
}

/**
 * Transformar dirección de envío al formato de WooCommerce
 */
function transformShippingAddress(formData: CheckoutFormData) {
  return {
    first_name: formData.shippingAddress.firstName,
    last_name: formData.shippingAddress.lastName,
    address_1: formData.shippingAddress.address,
    address_2: formData.shippingAddress.apartment || "",
    city: formData.shippingAddress.city,
    state: formData.shippingAddress.state,
    postcode: formData.shippingAddress.zipCode,
    country: formData.shippingAddress.country,
  };
}

/**
 * Transformar dirección de facturación al formato de WooCommerce
 */
function transformBillingAddress(formData: CheckoutFormData) {
  const address = formData.sameAsShipping
    ? formData.shippingAddress
    : formData.billingAddress || formData.shippingAddress;

  return {
    first_name: address.firstName,
    last_name: address.lastName,
    email: formData.shippingAddress.email,
    phone: formData.shippingAddress.phone,
    address_1: address.address,
    address_2: address.apartment || "",
    city: address.city,
    state: address.state,
    postcode: address.zipCode,
    country: address.country,
  };
}

/**
 * POST /api/checkout/create-order
 * Crea un pedido en WooCommerce y devuelve la URL de pago de Stripe
 */
export async function POST(request: NextRequest) {
  try {
    // Validar que las credenciales estén configuradas
    if (!CONSUMER_KEY || !CONSUMER_SECRET) {
      return NextResponse.json(
        { success: false, error: "WooCommerce credentials not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { cartItems, formData, totals, shippingMethodName } = body;

    // Validar que haya items en el carrito
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Transformar datos al formato de WooCommerce
    const lineItems = transformCartItems(cartItems);
    const shippingAddress = transformShippingAddress(formData);
    const billingAddress = transformBillingAddress(formData);

    // Método de envío: nombre desde WooCommerce/Printful (pasado por frontend)
    const shippingMethodTitle = shippingMethodName || "Shipping";

    // Crear objeto del pedido
    const orderData = {
      payment_method: "stripe", // ID del gateway de Stripe en WooCommerce
      payment_method_title: "Credit Card (Stripe)",
      set_paid: false, // No marcar como pagado hasta que Stripe confirme
      billing: billingAddress,
      shipping: shippingAddress,
      line_items: lineItems,
      shipping_lines: [
        {
          method_title: shippingMethodTitle,
          method_id: "flat_rate",
          total: totals.shipping.toFixed(2),
        },
      ],
      // Impuesto calculado en frontend (8%): lo guardamos como fee para que el total del pedido coincida con lo cobrado en Stripe
      fee_lines:
        totals.tax > 0
          ? [
              {
                name: "Tax",
                total: totals.tax.toFixed(2),
                tax_class: "",
                tax_status: "none" as const,
              },
            ]
          : [],
      meta_data: [
        {
          key: "_stripe_source_id",
          value: "", // Se llenará cuando Stripe procese el pago
        },
        // Backup del tax para la pantalla de success (por si fee_lines no se expone igual en la respuesta)
        { key: "_headless_tax", value: totals.tax.toFixed(2) },
      ],
    };

    const wooBase = WOOCOMMERCE_URL.replace(/\/$/, "");

    // Llamar a WooCommerce API para crear el pedido
    const response = await fetch(`${wooBase}/orders`, {
      method: "POST",
      headers: {
        Authorization: createAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      console.error("WooCommerce API Error:", errorData);
      return NextResponse.json(
        {
          success: false,
          error:
            errorData.message || `Error creating order: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const order = await response.json();

    // WooCommerce (y algunos gateways) pueden devolver payment_url automáticamente.
    // Si no viene en la respuesta REST, construimos el fallback al "order-pay".
    const storeBase = getStoreBaseUrlFromApiUrl(wooBase);
    const fallbackPaymentUrl =
      order?.id && order?.order_key
        ? `${storeBase}/checkout/order-pay/${order.id}/?pay_for_order=true&key=${order.order_key}`
        : null;

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_key: order.order_key,
      payment_url: order.payment_url || fallbackPaymentUrl,
      status: order.status,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
