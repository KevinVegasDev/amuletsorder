import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const WOOCOMMERCE_URL =
  process.env.WORDPRESS_API_URL ||
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  "";
const CONSUMER_KEY = process.env.WORDPRESS_CONSUMER_KEY || "";
const CONSUMER_SECRET = process.env.WORDPRESS_CONSUMER_SECRET || "";

function createAuthHeader(): string {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString(
    "base64",
  );
  return `Basic ${auth}`;
}

/**
 * Guarda el PaymentIntent ID en los metadatos del pedido de WooCommerce.
 * El plugin de Stripe de WooCommerce usa _stripe_intent_id para vincular
 * el webhook payment_intent.succeeded al pedido y cambiarlo a "processing".
 */
async function saveIntentIdToOrder(
  orderId: number,
  paymentIntentId: string,
): Promise<void> {
  if (!WOOCOMMERCE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) return;

  const wooBase = WOOCOMMERCE_URL.replace(/\/$/, "");

  const res = await fetch(`${wooBase}/orders/${orderId}`, {
    method: "PUT",
    headers: {
      Authorization: createAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      meta_data: [
        // Clave que usa el plugin oficial de Stripe para WooCommerce
        { key: "_stripe_intent_id", value: paymentIntentId },
        // Clave legacy (versiones antiguas del plugin)
        { key: "_stripe_source_id", value: paymentIntentId },
        // Clave del gateway para que WooCommerce identifique el método de pago
        { key: "_payment_method_id", value: paymentIntentId },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(
      `[create-payment-intent] Failed to save intent ID to WooCommerce order #${orderId}:`,
      errText,
    );
  } else {
    console.log(
      `[create-payment-intent] Saved PaymentIntent ${paymentIntentId} to WooCommerce order #${orderId}`,
    );
  }
}

/**
 * POST /api/checkout/create-payment-intent
 */
export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY not configured" },
        { status: 500 },
      );
    }

    const stripe = new Stripe(secretKey);

    const body = await request.json();
    const { orderId, amount, email, shippingAddress } = body as {
      orderId: number;
      amount: number;
      email?: string;
      shippingAddress?: {
        firstName: string;
        lastName: string;
        address: string;
        apartment?: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        phone?: string;
      };
    };

    if (!orderId || amount == null || amount <= 0) {
      return NextResponse.json(
        { error: "orderId and positive amount required" },
        { status: 400 },
      );
    }

    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      ...(email && { receipt_email: email }),
      ...(shippingAddress && {
        shipping: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
          phone: shippingAddress.phone || undefined,
          address: {
            line1: shippingAddress.address,
            line2: shippingAddress.apartment || undefined,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postal_code: shippingAddress.zipCode,
            country: shippingAddress.country,
          },
        },
      }),
      description: `Amulets Order #${orderId}`,
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_id: String(orderId),
        customer_email: email || "No email provided",
      },
    });

    // ✅ CRÍTICO: Guardar el PaymentIntent ID en el pedido de WooCommerce.
    // El plugin de Stripe de WooCommerce necesita _stripe_intent_id para
    // vincular el webhook payment_intent.succeeded al pedido correcto
    // y actualizarlo de "pending" a "processing" (lo que dispara Printful).
    await saveIntentIdToOrder(orderId, paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    console.error("Error creating payment intent:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
