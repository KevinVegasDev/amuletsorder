import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

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
    const { orderId, amount } = body as { orderId: number; amount: number };

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
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_id: String(orderId),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    console.error("Error creating payment intent:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
