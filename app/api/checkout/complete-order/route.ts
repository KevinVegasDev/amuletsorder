import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

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
 * POST /api/checkout/complete-order
 *
 * Llamado desde la página de éxito cuando Stripe redirige con redirect_status=succeeded.
 * Verifica server-side que el PaymentIntent realmente fue exitoso y actualiza
 * el pedido de WooCommerce a "processing" (lo que dispara el envío a Printful).
 *
 * Body: { orderId: number, paymentIntentId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey || !WOOCOMMERCE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { orderId, paymentIntentId } = body as {
      orderId: number;
      paymentIntentId: string;
    };

    if (!orderId || !paymentIntentId) {
      return NextResponse.json(
        { error: "orderId and paymentIntentId are required" },
        { status: 400 },
      );
    }

    // ✅ Verificar server-side que el pago realmente fue exitoso en Stripe
    const stripe = new Stripe(secretKey);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      console.warn(
        `[complete-order] PaymentIntent ${paymentIntentId} status is "${paymentIntent.status}", not "succeeded". Skipping order update.`,
      );
      return NextResponse.json(
        {
          ok: false,
          reason: `Payment status is "${paymentIntent.status}"`,
        },
        { status: 200 },
      );
    }

    // Verificar que el order_id en metadata coincide con el que nos pasan
    const metaOrderId = paymentIntent.metadata?.order_id;
    if (metaOrderId && String(metaOrderId) !== String(orderId)) {
      console.error(
        `[complete-order] order_id mismatch: param=${orderId}, stripe_metadata=${metaOrderId}`,
      );
      return NextResponse.json(
        { error: "Order ID mismatch" },
        { status: 400 },
      );
    }

    const wooBase = WOOCOMMERCE_URL.replace(/\/$/, "");

    // Actualizar el pedido a "processing" en WooCommerce
    const updateRes = await fetch(`${wooBase}/orders/${orderId}`, {
      method: "PUT",
      headers: {
        Authorization: createAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "processing",
        meta_data: [
          { key: "_stripe_intent_id", value: paymentIntentId },
          { key: "_stripe_source_id", value: paymentIntentId },
          { key: "_payment_method_id", value: paymentIntentId },
        ],
      }),
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      console.error(
        `[complete-order] Failed to update WooCommerce order #${orderId}:`,
        errText,
      );
      return NextResponse.json(
        { ok: false, reason: "WooCommerce update failed" },
        { status: 500 },
      );
    }

    console.log(
      `[complete-order] Order #${orderId} updated to "processing" (PI: ${paymentIntentId})`,
    );

    return NextResponse.json({ ok: true, orderId, status: "processing" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    console.error("[complete-order] Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
