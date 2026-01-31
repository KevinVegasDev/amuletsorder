import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * POST /api/checkout/create-payment-intent
 * Crea un PaymentIntent en Stripe para el pedido (checkout headless).
 * amount en dólares (ej: 240.00).
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { orderId, amount } = body as { orderId: number; amount: number };

    if (!orderId || amount == null || amount <= 0) {
      return NextResponse.json(
        { error: "orderId and positive amount required" },
        { status: 400 }
      );
    }

    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_id: String(orderId),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
