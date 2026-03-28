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
