import { NextRequest, NextResponse } from "next/server";
import type { ShippingAddress } from "@/app/types/checkout";

export const runtime = "nodejs";

const PRINTFUL_API = "https://api.printful.com";
const PRINTFUL_TOKEN =
  process.env.PRINTFUL_ACCESS_TOKEN || process.env.PRINTFUL_API_KEY;
/** Si usas token de tipo Account, indica la tienda WooCommerce aquí. Si no, se obtiene de la API stores. */
const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID
  ? String(process.env.PRINTFUL_STORE_ID).trim()
  : undefined;

const WOOCOMMERCE_URL =
  process.env.WORDPRESS_API_URL ||
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  "";
const WOOCOMMERCE_CONSUMER_KEY = process.env.WORDPRESS_CONSUMER_KEY || "";
const WOOCOMMERCE_CONSUMER_SECRET = process.env.WORDPRESS_CONSUMER_SECRET || "";

function wooAuthHeader(): string {
  const auth = Buffer.from(
    `${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`
  ).toString("base64");
  return `Basic ${auth}`;
}

/** Las opciones de envío (Flat Rate, etc.) las provee Printful a WooCommerce. Aquí solo usamos la API de Printful. */

interface CartItemInput {
  productId: number;
  quantity: number;
  /** Id del producto padre en WooCommerce cuando el item es una variación; usado para obtener _printful_sync_product_id del padre */
  parentId?: number;
  /** Printful catalog variant_id (product.printfulVariants?.[0]?.variant_id) */
  printfulVariantId?: number;
  /** Printful sync product id (product.printfulSyncProductId); usado para resolver variant_id si no viene en el producto */
  printfulSyncProductId?: number;
}

/** Lista de tiendas Printful (Store Information API). Necesario con token Account para enviar X-PF-Store-Id. */
async function getPrintfulStores(): Promise<
  Array<{ id: number; type?: string; name?: string }>
> {
  if (!PRINTFUL_TOKEN) return [];
  try {
    const res = await fetch(`${PRINTFUL_API}/stores`, {
      headers: { Authorization: `Bearer ${PRINTFUL_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    const result = data.result;
    if (Array.isArray(result)) return result;
    if (result && typeof result === "object" && typeof result.id === "number")
      return [result];
    return [];
  } catch {
    return [];
  }
}

/**
 * Obtener el store id a usar: env PRINTFUL_STORE_ID o primera tienda de la lista (tipo WooCommerce si existe).
 */
async function resolvePrintfulStoreId(): Promise<number | undefined> {
  if (PRINTFUL_STORE_ID) {
    const n = parseInt(PRINTFUL_STORE_ID, 10);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  const stores = await getPrintfulStores();
  const woo = stores.find(
    (s) =>
      String(s.type || "").toLowerCase() === "woocommerce" ||
      String(s.name || "").toLowerCase().includes("woo")
  );
  if (woo && typeof woo.id === "number") return woo.id;
  const first = stores[0];
  return first && typeof first.id === "number" ? first.id : undefined;
}

/**
 * Resolver variant_id de Printful desde store product.
 * Si wcProductOrVariationId viene (ej. id de variación WC), se busca la sync variant
 * cuyo external_id coincida; si no, se usa la primera. Así el shipping coincide con la variación elegida.
 */
async function getVariantIdFromSyncProduct(
  syncProductId: number,
  wcProductOrVariationId?: number,
  storeId?: number
): Promise<number | null> {
  if (!PRINTFUL_TOKEN) return null;
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${PRINTFUL_TOKEN}`,
    };
    if (storeId != null) headers["X-PF-Store-Id"] = String(storeId);
    const res = await fetch(`${PRINTFUL_API}/sync/products/${syncProductId}`, {
      headers,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const variants = data.result?.sync_variants;
    if (!Array.isArray(variants) || variants.length === 0) return null;

    if (wcProductOrVariationId != null) {
      const externalIdStr = String(wcProductOrVariationId);
      const match = variants.find(
        (v: { external_id?: string; variant_id?: number; id?: number }) =>
          v.external_id === externalIdStr || v.external_id === String(wcProductOrVariationId)
      );
      if (match) {
        // ONLY use variant_id (Printful catalog ID, small number like 4011).
        // NEVER fall back to .id — that is the Sync Variant ID (large number like 5166537160)
        // which Printful REJECTS in the shipping rates / orders API.
        const vid =
          typeof match.variant_id === "number" && match.variant_id > 0
            ? match.variant_id
            : null;
        if (vid != null) return vid;
        // If this matched variant has no catalog variant_id (product not fully synced),
        // fall through to try other variants instead of returning wrong sync ID.
        console.warn(
          `[shipping/rates] Sync variant external_id=${externalIdStr} has no catalog variant_id (likely not fully synced in Printful). Trying first synced variant.`
        );
      }
    }

    // Fall back to the first variant that has a valid catalog variant_id (> 0).
    // Skip variants with no catalog variant_id (unsynced) — never use .id as a fallback.
    const synced = variants.find(
      (v: { variant_id?: number }) =>
        typeof v.variant_id === "number" && v.variant_id > 0
    );
    if (synced) {
      console.warn(
        `[shipping/rates] Using first synced variant_id=${synced.variant_id} for sync product ${syncProductId} as fallback.`
      );
      return synced.variant_id as number;
    }
    console.error(
      `[shipping/rates] Sync product ${syncProductId} has no variants with a valid catalog variant_id. Product may not be fully synced in Printful.`
    );
    return null;
  } catch {
    return null;
  }
}

/** Meta keys que pueden guardar el sync product id de Printful en WooCommerce */
const PRINTFUL_SYNC_META_KEYS = [
  "_printful_sync_product_id",
  "printful_sync_product_id",
  "_printful_product_id",
  "printful_product_id",
];

/** Extraer sync product id de meta_data de un producto WooCommerce */
function parsePrintfulSyncIdFromMeta(
  metaList: Array<{ key: string; value?: string | number }>
): number | null {
  for (const key of PRINTFUL_SYNC_META_KEYS) {
    const meta = metaList.find((m) => m.key === key);
    const raw = meta?.value;
    if (raw === undefined || raw === null) continue;
    const id = typeof raw === "number" ? raw : parseInt(String(raw), 10);
    if (!Number.isNaN(id) && id > 0) return id;
  }
  return null;
}

/** Obtener Printful sync product id del producto en WooCommerce (meta_data). Si es variación, intenta el padre. */
async function getPrintfulSyncProductIdFromWooCommerce(
  productId: number
): Promise<number | null> {
  const base = WOOCOMMERCE_URL.replace(/\/$/, "");
  if (!base || !WOOCOMMERCE_CONSUMER_KEY || !WOOCOMMERCE_CONSUMER_SECRET)
    return null;
  try {
    const res = await fetch(`${base}/products/${productId}`, {
      headers: { Authorization: wooAuthHeader() },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const product: {
      parent_id?: number;
      meta_data?: Array<{ key: string; value?: string | number }>;
    } = await res.json();
    const metaList = product.meta_data ?? [];
    let syncId = parsePrintfulSyncIdFromMeta(metaList);
    // Si es variación (tiene parent_id), intentar meta del producto padre
    if (syncId == null && product.parent_id && product.parent_id > 0) {
      const parentRes = await fetch(`${base}/products/${product.parent_id}`, {
        headers: { Authorization: wooAuthHeader() },
        cache: "no-store",
      });
      if (parentRes.ok) {
        const parent: {
          meta_data?: Array<{ key: string; value?: string | number }>;
        } = await parentRes.json();
        syncId = parsePrintfulSyncIdFromMeta(parent.meta_data ?? []);
      }
    }
    return syncId;
  } catch {
    return null;
  }
}

/**
 * Fallback: obtener lista de sync products de la tienda Printful (Ecommerce Platform Sync API).
 * Para tiendas WooCommerce/Shopify se usa GET /sync/products, no /store/products.
 * Con token Account es necesario storeId (X-PF-Store-Id).
 */
async function fetchPrintfulStoreProductList(
  storeId?: number
): Promise<Array<{ id: number; external_id?: string }>> {
  if (!PRINTFUL_TOKEN) return [];
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${PRINTFUL_TOKEN}`,
    };
    if (storeId != null) headers["X-PF-Store-Id"] = String(storeId);
    const res = await fetch(`${PRINTFUL_API}/sync/products?limit=100`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.result) ? data.result : [];
  } catch {
    return [];
  }
}

function findPrintfulSyncIdByWooId(
  storeList: Array<{ id?: number; external_id?: string }>,
  wcProductId: number
): number | null {
  const idStr = String(wcProductId);
  const found = storeList.find((p) => {
    const ext = p.external_id;
    if (ext == null) return false;
    if (ext === idStr) return true;
    if (ext === String(wcProductId)) return true;
    const num = parseInt(ext, 10);
    if (!Number.isNaN(num) && num === wcProductId) return true;
    return false;
  });
  return found && typeof found.id === "number" ? found.id : null;
}

/**
 * POST /api/shipping/rates
 * Opciones de envío solo desde Printful (igual que en WooCommerce cuando está conectado a Printful).
 * WooCommerce no usa zonas propias para esto: Printful inyecta Flat Rate, etc. Nosotros llamamos
 * directo a la API de Printful; el sync product id lo sacamos del meta del producto en WooCommerce.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      address,
      cartItems,
    }: { address: ShippingAddress; cartItems: CartItemInput[] } = body;

    if (!address?.country) {
      return NextResponse.json({ rates: [], fromPrintful: false });
    }

    // 1) Tarifas de Printful (igual que el checkout de WooCommerce: Printful provee las opciones)
    if (PRINTFUL_TOKEN && cartItems?.length) {
      const syncProductCache = new Map<string, number | null>();
      const wooSyncIdCache = new Map<number, number | null>();
      let printfulStoreList: Array<{ id: number; external_id?: string }> | null = null;
      let resolvedStoreId: number | undefined;
      const itemsWithVariant: { variant_id: number; quantity: number }[] = [];

      for (const item of cartItems) {
        let variantId: number | null =
          typeof item.printfulVariantId === "number"
            ? item.printfulVariantId
            : null;
        let syncProductId: number | null =
          typeof item.printfulSyncProductId === "number"
            ? item.printfulSyncProductId
            : null;

        // Si el front no envió sync product id, obtenerlo desde WooCommerce (meta Printful).
        // Para variaciones, el meta _printful_sync_product_id está en el producto padre; usar parentId si viene.
        if (syncProductId == null && (typeof item.parentId === "number" || typeof item.productId === "number")) {
          const wooIdToTry = typeof item.parentId === "number" ? item.parentId : item.productId;
          if (!wooSyncIdCache.has(wooIdToTry)) {
            let sid = await getPrintfulSyncProductIdFromWooCommerce(wooIdToTry);
            if (sid == null && PRINTFUL_TOKEN) {
              if (resolvedStoreId === undefined)
                resolvedStoreId = await resolvePrintfulStoreId();
              if (printfulStoreList === null) {
                printfulStoreList = await fetchPrintfulStoreProductList(resolvedStoreId);
                if (process.env.NODE_ENV === "development" && printfulStoreList.length > 0) {
                  console.log("[shipping/rates] Printful store list:", {
                    storeId: resolvedStoreId,
                    total: printfulStoreList.length,
                    external_ids: printfulStoreList.slice(0, 10).map((p) => ({ id: p.id, external_id: p.external_id })),
                  });
                }
              }
              sid = findPrintfulSyncIdByWooId(printfulStoreList, wooIdToTry);
              if (process.env.NODE_ENV === "development") {
                console.log("[shipping/rates] Fallback lookup:", { wooIdToTry, foundSyncId: sid });
              }
            }
            wooSyncIdCache.set(wooIdToTry, sid);
          }
          syncProductId = wooSyncIdCache.get(wooIdToTry) ?? null;
        }

        if (variantId == null && syncProductId != null) {
          if (resolvedStoreId === undefined)
            resolvedStoreId = await resolvePrintfulStoreId();
          const cacheKey = `${syncProductId}:${item.productId}`;
          if (!syncProductCache.has(cacheKey)) {
            syncProductCache.set(
              cacheKey,
              await getVariantIdFromSyncProduct(syncProductId, item.productId, resolvedStoreId)
            );
          }
          variantId = syncProductCache.get(cacheKey) ?? null;
        }

        if (variantId != null) {
          itemsWithVariant.push({
            variant_id: variantId,
            quantity: item.quantity,
          });
        }
      }

      if (process.env.NODE_ENV === "development") {
        console.log("[shipping/rates] Printful:", {
          cartItemsCount: cartItems.length,
          fromFrontend: cartItems.map((i) => ({
            id: i.productId,
            syncId: i.printfulSyncProductId,
            variantId: i.printfulVariantId,
          })),
          wooSyncIdCache: Object.fromEntries(wooSyncIdCache),
          syncProductCache: Object.fromEntries(syncProductCache),
          itemsWithVariantCount: itemsWithVariant.length,
        });
      }

      if (itemsWithVariant.length > 0) {
        if (resolvedStoreId === undefined)
          resolvedStoreId = await resolvePrintfulStoreId();
        const shippingHeaders: Record<string, string> = {
          Authorization: `Bearer ${PRINTFUL_TOKEN}`,
          "Content-Type": "application/json",
        };
        if (resolvedStoreId != null) shippingHeaders["X-PF-Store-Id"] = String(resolvedStoreId);
        const requestBody = {
          recipient: {
            country_code: address.country,
            state_code: address.state || undefined,
            city: address.city || undefined,
            zip: address.zipCode || undefined,
            address1: address.address || undefined,
            address2: address.apartment || undefined,
          },
          items: itemsWithVariant,
        };
        if (process.env.NODE_ENV === "development") {
          console.log("[shipping/rates] Printful request:", JSON.stringify({ storeId: resolvedStoreId, recipient: requestBody.recipient, itemsCount: requestBody.items.length }));
        }
        const res = await fetch(`${PRINTFUL_API}/shipping/rates`, {
          method: "POST",
          headers: shippingHeaders,
          body: JSON.stringify(requestBody),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.warn(
            "[shipping/rates] Printful API error:",
            res.status,
            errText
          );
          const errJson = (() => {
            try {
              return JSON.parse(errText);
            } catch {
              return null;
            }
          })();
          const message = errJson?.error?.message ?? errText?.slice(0, 200) ?? "";
          const stateRequired = typeof message === "string" && message.toLowerCase().includes("state code is missing");
          return NextResponse.json({
            rates: [],
            fromPrintful: false,
            ...(stateRequired && { stateRequired: true }),
            ...(process.env.NODE_ENV === "development" && {
              debug: {
                reason: "printful_api_error",
                status: res.status,
                message,
              },
            }),
          });
        }

        if (res.ok) {
          const data = await res.json();
          const result = data.result;
          if (process.env.NODE_ENV === "development") {
            if (Array.isArray(result)) {
              console.log("[shipping/rates] Printful raw result (full objects):", JSON.stringify(result));
              console.log("[shipping/rates] Printful rates summary:", result.map((r: Record<string, unknown>) => ({ id: r.id, name: r.name, rate: r.rate, min_days: r.min_days, max_days: r.max_days })));
            }
            if (data && typeof data === "object" && !Array.isArray(data) && Object.keys(data).length > 1) {
              console.log("[shipping/rates] Printful full response keys:", Object.keys(data));
            }
          }
          if (Array.isArray(result) && result.length > 0) {
            const rates = result.map(
              (r: {
                id?: string;
                name?: string;
                rate?: string;
                min_days?: number;
                max_days?: number;
              }) => {
                const id = (r.id ?? r.name ?? "standard")
                  .toString()
                  .toLowerCase()
                  .replace(/\s+/g, "_");
                const price = parseFloat(r.rate ?? "0") || 0;
                const min = r.min_days ?? 0;
                const max = r.max_days ?? 0;
                const estimatedDays =
                  max > 0 ? `${min}-${max}` : min > 0 ? `${min}` : "5-7";
                return {
                  id,
                  name: r.name ?? "Shipping",
                  description: `${estimatedDays} business days`,
                  price,
                  estimatedDays,
                };
              }
            );
            return NextResponse.json({ rates, fromPrintful: true });
          }
        }
      }
    }

    // Sin tarifas de Printful: token ausente, ningún item con variant_id, o dirección incompleta.
    // Para productos manuales (sin Printful), devolver un método de envío estándar como fallback.
    const hasPrintfulItems = cartItems?.some(
      (item) =>
        typeof item.printfulSyncProductId === "number" ||
        typeof item.printfulVariantId === "number"
    );

    if (!hasPrintfulItems && cartItems?.length > 0) {
      // Productos manuales: ofrecer métodos de envío genéricos para no bloquear el checkout
      const fallbackRates = [
        {
          id: "standard_shipping",
          name: "Standard Shipping",
          description: "5-7 business days",
          price: 5.99,
          estimatedDays: "5-7",
        },
        {
          id: "express_shipping",
          name: "Express Shipping",
          description: "2-3 business days",
          price: 14.99,
          estimatedDays: "2-3",
        },
      ];
      return NextResponse.json({ rates: fallbackRates, fromPrintful: false });
    }

    const debug =
      process.env.NODE_ENV === "development"
        ? {
            reason: !PRINTFUL_TOKEN
              ? "missing_printful_token"
              : !cartItems?.length
              ? "no_cart_items"
              : "no_printful_variant_resolved",
            hint: !PRINTFUL_TOKEN
              ? "Set PRINTFUL_ACCESS_TOKEN (or PRINTFUL_API_KEY) in .env.local"
              : "Ensure WooCommerce products have _printful_sync_product_id meta and are synced with Printful.",
          }
        : undefined;
    return NextResponse.json({ rates: [], fromPrintful: false, ...(debug && { debug }) });
  } catch (e) {
    console.error("Shipping rates error:", e);
    return NextResponse.json({ rates: [], fromPrintful: false });
  }
}
