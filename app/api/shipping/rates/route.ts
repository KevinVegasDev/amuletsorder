import { NextRequest, NextResponse } from "next/server";
import type { ShippingAddress } from "@/app/types/checkout";

export const runtime = "nodejs";

const PRINTFUL_API = "https://api.printful.com";
const PRINTFUL_TOKEN = process.env.PRINTFUL_ACCESS_TOKEN || process.env.PRINTFUL_API_KEY;

/** Tarifas estáticas cuando Printful no está configurado o falla */
const FALLBACK_RATES = [
  { id: "standard", name: "Standard Shipping", description: "5-7 business days", price: 0, estimatedDays: "5-7" },
  { id: "express", name: "Express Shipping", description: "2-3 business days", price: 15.99, estimatedDays: "2-3" },
  { id: "overnight", name: "Overnight Shipping", description: "Next business day", price: 29.99, estimatedDays: "1" },
];

interface CartItemInput {
  productId: number;
  quantity: number;
  /** Printful catalog variant_id (product.printfulVariants?.[0]?.variant_id) */
  printfulVariantId?: number;
  /** Printful sync product id (product.printfulSyncProductId); usado para resolver variant_id si no viene en el producto */
  printfulSyncProductId?: number;
}

/** Resolver variant_id desde Printful store product (sync_variants[0]) */
async function getVariantIdFromSyncProduct(syncProductId: number): Promise<number | null> {
  if (!PRINTFUL_TOKEN) return null;
  try {
    const res = await fetch(`${PRINTFUL_API}/store/products/${syncProductId}`, {
      headers: { Authorization: `Bearer ${PRINTFUL_TOKEN}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const variants = data.result?.sync_variants;
    if (!Array.isArray(variants) || variants.length === 0) return null;
    const first = variants[0];
    return typeof first.variant_id === "number" ? first.variant_id : typeof first.id === "number" ? first.id : null;
  } catch {
    return null;
  }
}

/**
 * POST /api/shipping/rates
 * Calcula tarifas de envío con Printful (si hay token y items con variant_id o printfulSyncProductId).
 * Si no, devuelve tarifas estáticas (Standard, Express, Overnight).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, cartItems }: { address: ShippingAddress; cartItems: CartItemInput[] } = body;

    if (!address?.country) {
      return NextResponse.json({ rates: FALLBACK_RATES, fromPrintful: false });
    }

    if (!PRINTFUL_TOKEN) {
      return NextResponse.json({ rates: FALLBACK_RATES, fromPrintful: false });
    }

    // Resolver variant_id por ítem: usar printfulVariantId o obtenerlo desde printfulSyncProductId
    const syncProductCache = new Map<number, number | null>();
    const itemsWithVariant: { variant_id: number; quantity: number }[] = [];

    for (const item of cartItems || []) {
      let variantId: number | null = typeof item.printfulVariantId === "number" ? item.printfulVariantId : null;
      if (variantId == null && typeof item.printfulSyncProductId === "number") {
        if (!syncProductCache.has(item.printfulSyncProductId)) {
          syncProductCache.set(item.printfulSyncProductId, await getVariantIdFromSyncProduct(item.printfulSyncProductId));
        }
        variantId = syncProductCache.get(item.printfulSyncProductId) ?? null;
      }
      if (variantId != null) {
        itemsWithVariant.push({ variant_id: variantId, quantity: item.quantity });
      }
    }

    if (itemsWithVariant.length === 0) {
      return NextResponse.json({ rates: FALLBACK_RATES, fromPrintful: false });
    }

    const recipient = {
      country_code: address.country,
      state_code: address.state || undefined,
      city: address.city || undefined,
      zip: address.zipCode || undefined,
      address1: address.address || undefined,
      address2: address.apartment || undefined,
    };

    const items = itemsWithVariant;

    const res = await fetch(`${PRINTFUL_API}/shipping/rates`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PRINTFUL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipient, items }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn("Printful shipping rates error:", res.status, err);
      return NextResponse.json({ rates: FALLBACK_RATES, fromPrintful: false });
    }

    const data = await res.json();
    const result = data.result;

    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json({ rates: FALLBACK_RATES, fromPrintful: false });
    }

    const rates = result.map((r: { id?: string; name?: string; rate?: string; min_days?: number; max_days?: number }) => {
      const id = (r.id ?? r.name ?? "standard").toString().toLowerCase().replace(/\s+/g, "_");
      const price = parseFloat(r.rate ?? "0") || 0;
      const min = r.min_days ?? 0;
      const max = r.max_days ?? 0;
      const estimatedDays = max > 0 ? `${min}-${max}` : min > 0 ? `${min}` : "5-7";
      return {
        id,
        name: r.name ?? "Shipping",
        description: `${estimatedDays} business days`,
        price,
        estimatedDays,
      };
    });

    return NextResponse.json({ rates, fromPrintful: true });
  } catch (e) {
    console.error("Shipping rates error:", e);
    return NextResponse.json({ rates: FALLBACK_RATES, fromPrintful: false });
  }
}
