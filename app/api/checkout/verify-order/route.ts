import { NextRequest, NextResponse } from "next/server";

const WOOCOMMERCE_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL!;
const CONSUMER_KEY = process.env.WORDPRESS_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.WORDPRESS_CONSUMER_SECRET!;

function createAuthHeader(): string {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString(
    "base64",
  );
  return `Basic ${auth}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("order_id");
    const orderKey = searchParams.get("key");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 },
      );
    }

    const response = await fetch(`${WOOCOMMERCE_URL}/orders/${orderId}`, {
      method: "GET",
      headers: {
        Authorization: createAuthHeader(),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = await response.json();

    // Si nos pasan el order key, lo validamos para evitar que cualquiera consulte órdenes por ID
    if (orderKey && orderKey !== order.order_key) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // line_items: nombre, cantidad, total; image puede no venir en la respuesta estándar
    const line_items = (order.line_items || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      product_id: item.product_id,
      quantity: item.quantity,
      total: item.total,
      image: item.image?.src || null,
    }));

    return NextResponse.json({
      id: order.id,
      order_key: order.order_key,
      status: order.status,
      total: order.total,
      currency: order.currency || "USD",
      date_created: order.date_created,
      line_items,
    });
  } catch (error: any) {
    console.error("Error verifying order:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
