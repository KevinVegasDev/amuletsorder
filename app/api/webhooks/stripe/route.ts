import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const WOOCOMMERCE_URL =
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  process.env.WORDPRESS_API_URL ||
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
 * POST /api/webhooks/stripe
 * Recibe eventos de Stripe y actualiza el pedido en WooCommerce.
 * Eventos: payment_intent.succeeded → pedido a "processing".
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret || !signature) {
      console.error("Webhook: missing STRIPE_WEBHOOK_SECRET or signature");
      return NextResponse.json(
        { error: "Webhook configuration error" },
        { status: 500 },
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Webhook signature verification failed:", message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.order_id;

      if (!orderId || !WOOCOMMERCE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
        console.error("Webhook: missing order_id or WooCommerce config");
        return NextResponse.json({ received: true });
      }

      const updateRes = await fetch(`${WOOCOMMERCE_URL}/orders/${orderId}`, {
          method: "PATCH",
          headers: {
            Authorization: createAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "processing" }),
        },
      );

      if (!updateRes.ok) {
        const errText = await updateRes.text();
        console.error("Webhook: failed to update WooCommerce order:", errText);
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.order_id;
      if (orderId && WOOCOMMERCE_URL && CONSUMER_KEY && CONSUMER_SECRET) {
        await fetch(`${WOOCOMMERCE_URL}/orders/${orderId}`, {
          method: "PATCH",
          headers: {
            Authorization: createAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "failed" }),
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
