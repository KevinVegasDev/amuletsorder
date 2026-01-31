"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "../../contexts/CartContext";

interface LineItem {
  id: number;
  name: string;
  product_id: number;
  quantity: number;
  total: string;
  image?: string | null;
}

interface OrderData {
  id: number;
  order_key: string;
  status: string;
  total: string;
  currency: string;
  date_created: string;
  line_items?: LineItem[];
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "0000000000";
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@amuletsorder.com";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const orderId = searchParams.get("order_id");
  const orderKey = searchParams.get("key");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Limpiar URL: quitar params de Stripe (payment_intent, client_secret, redirect_status) para no dejar datos sensibles en la barra de direcciones
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const hasStripeParams =
      params.has("payment_intent") ||
      params.has("payment_intent_client_secret") ||
      params.has("redirect_status");
    if (hasStripeParams && orderId && orderKey) {
      const clean = new URLSearchParams();
      clean.set("order_id", orderId);
      clean.set("key", orderKey);
      const newUrl = `${window.location.pathname}?${clean.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [orderId, orderKey]);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    const verifyOrder = async () => {
      try {
        const params = new URLSearchParams();
        params.set("order_id", orderId);
        if (orderKey) params.set("key", orderKey);

        const response = await fetch(`/api/checkout/verify-order?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to verify order");
        }

        const data = await response.json();
        setOrder(data);
      } catch (err: unknown) {
        console.error("Error verifying order:", err);
        setError(err instanceof Error ? err.message : "Failed to verify order");
      } finally {
        setLoading(false);
      }
    };

    verifyOrder();
  }, [orderId, orderKey]);

  // Vaciar carrito en cuanto el pedido esté verificado (ya pagaron y están en success)
  useEffect(() => {
    if (order) {
      clearCart();
    }
  }, [order, clearCart]);

  const whatsappUrl =
    WHATSAPP_NUMBER && order
      ? `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hi, I have a question about my order #${order.id}`
      )}`
      : null;
  const mailtoUrl = `mailto:${CONTACT_EMAIL}${order ? `?subject=Order #${order.id}` : ""}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-negro mx-auto mb-4" />
          <p className="text-gray-600">Verifying your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-negro mb-2">Order Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error || "Order not found"}</p>
          <Link
            href="/market"
            className="inline-block bg-negro text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const lineItems = order.line_items || [];

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Icono y título */}
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4"
            aria-hidden
          >
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-negro mb-2">
            Thank you for your purchase
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            We&apos;ve received your order and will ship in 5–7 business days.
          </p>
          <p className="text-gray-700 mt-1 font-medium">
            Your order number is <span className="font-bold">#{order.id}</span>
          </p>
          <p className="text-gray-600 text-sm mt-3">
            In the next few hours you&apos;ll receive a confirmation email at your inbox with the details of your purchase and shipping information.
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 text-left shadow-sm">
          <h2 className="text-lg font-bold text-negro mb-4">Order Summary</h2>
          <ul className="space-y-4">
            {lineItems.length > 0 ? (
              lineItems.map((item) => (
                <li key={item.id} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-100 overflow-hidden">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                        •
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-negro truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="flex-shrink-0 font-medium text-negro">
                    ${parseFloat(item.total || "0").toFixed(2)}
                  </div>
                </li>
              ))
            ) : (
              <li className="text-gray-500 text-sm">No items in this order.</li>
            )}
          </ul>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <span className="font-bold text-negro">Total</span>
            <span className="font-bold text-negro">${parseFloat(order.total || "0").toFixed(2)}</span>
          </div>
        </div>

        {/* Back to Home */}
        <div className="flex justify-center mb-6">
          <Link
            href="/market"
            className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-white text-negro border-2 border-gray-300 font-medium rounded-lg hover:bg-gray-50 hover:border-negro transition-colors"
          >
            Back to Home
          </Link>
        </div>

        {/* Contact */}
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-500">Need help? Contact us:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-negro text-white font-medium rounded-lg hover:opacity-90 transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Contact in WhatsApp
              </a>
            )}
            <a
              href={mailtoUrl}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-200 text-negro font-medium rounded-lg hover:bg-gray-300 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact by email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
