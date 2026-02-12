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

/** Item de línea en la respuesta GET order de WooCommerce */
interface WooOrderLineItem {
  id?: number;
  name?: string;
  product_id: number;
  quantity: number;
  total?: string;
  image?: { src?: string };
}

/** Entrada de meta_data en la respuesta de WooCommerce */
interface WooOrderMetaItem {
  key: string;
  value?: string | number | boolean;
}

/** Entrada de fee_lines en la respuesta de WooCommerce */
interface WooOrderFeeLine {
  name?: string;
  total?: string;
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
    const line_items = (order.line_items || []).map((item: WooOrderLineItem) => ({
      id: item.id,
      name: item.name,
      product_id: item.product_id,
      quantity: item.quantity,
      total: item.total,
      image: item.image?.src || null,
    }));

    // Totales para la pantalla de success (subtotal, envío, impuestos)
    const lineItemsSubtotal = (order.line_items || []).reduce(
      (sum: number, i: WooOrderLineItem) => sum + parseFloat(i.total || "0"),
      0
    );
    // Si WooCommerce no envía subtotal o es 0, usar suma de line_items para que no salga $0.00
    const subtotal =
      order.line_items?.length > 0 && lineItemsSubtotal > 0
        ? String(lineItemsSubtotal)
        : (order.subtotal ?? String(lineItemsSubtotal));
    const shippingTotal = order.shipping_total ?? order.total_shipping ?? "0";
    // Tax: lo guardamos al crear el pedido en meta_data y/o fee_lines
    const metaTax = order.meta_data?.find((m: WooOrderMetaItem) => m.key === "_headless_tax")?.value;
    const feeTax = order.fee_lines?.find((f: WooOrderFeeLine) => f.name === "Tax")?.total;
    const totalTax = metaTax ?? feeTax ?? order.total_tax ?? "0";
    const discountTotal = order.discount_total ?? order.total_discount ?? "0";

    return NextResponse.json({
      id: order.id,
      order_key: order.order_key,
      status: order.status,
      total: order.total,
      currency: order.currency || "USD",
      date_created: order.date_created,
      line_items,
      subtotal,
      shipping_total: String(shippingTotal),
      total_tax: String(totalTax),
      discount_total: String(discountTotal),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error verifying order:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
