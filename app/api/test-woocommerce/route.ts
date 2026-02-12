import { NextRequest, NextResponse } from "next/server";

/**
 * Ruta de prueba para verificar la conexión con WooCommerce
 *
 * USO:
 * 1. Reemplaza las variables de entorno abajo con tus credenciales reales
 * 2. Accede a: http://localhost:3000/api/test-woocommerce
 * 3. Verás el estado de la conexión y los productos
 *
 * NOTA: Esta ruta es solo para desarrollo/testing. NO la uses en producción.
 */

// ⚠️ REEMPLAZA ESTAS VARIABLES CON TUS CREDENCIALES REALES DEL .env
const TEST_CONFIG = {
  baseUrl:
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
    process.env.WORDPRESS_API_URL ||
    "https://headlessamulets.in/wp-json/wc/v3",
  consumerKey: process.env.WORDPRESS_CONSUMER_KEY || "TU_CONSUMER_KEY_AQUI",
  consumerSecret:
    process.env.WORDPRESS_CONSUMER_SECRET || "TU_CONSUMER_SECRET_AQUI",
};

function createAuthHeaders(): HeadersInit {
  const auth = Buffer.from(
    `${TEST_CONFIG.consumerKey}:${TEST_CONFIG.consumerSecret}`
  ).toString("base64");
  return {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json",
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get("type") || "products"; // products, categories, tags, health

  try {
    // Test de salud de la API
    if (testType === "health") {
      const healthUrl = TEST_CONFIG.baseUrl.replace("/wc/v3", "/wp/v2");
      const healthResponse = await fetch(`${healthUrl}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return NextResponse.json({
        success: healthResponse.ok,
        status: healthResponse.status,
        statusText: healthResponse.statusText,
        message: healthResponse.ok
          ? "✅ WordPress REST API está disponible"
          : "❌ WordPress REST API no está disponible",
        url: healthUrl,
      });
    }

    // Test de productos
    if (testType === "products") {
      const params = new URLSearchParams({
        page: "1",
        per_page: "5",
        status: "publish",
      });

      const url = `${TEST_CONFIG.baseUrl}/products?${params}`;
      console.log("🔍 Testing WooCommerce API:", url);
      console.log("🔑 Auth configured:", {
        hasKey:
          !!TEST_CONFIG.consumerKey &&
          TEST_CONFIG.consumerKey !== "TU_CONSUMER_KEY_AQUI",
        hasSecret:
          !!TEST_CONFIG.consumerSecret &&
          TEST_CONFIG.consumerSecret !== "TU_CONSUMER_SECRET_AQUI",
      });

      const response = await fetch(url, {
        headers: createAuthHeaders(),
        cache: "no-store",
      });

      const responseText = await response.text();
      let responseData;

      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { raw: responseText.substring(0, 500) };
      }

      return NextResponse.json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        url,
        config: {
          baseUrl: TEST_CONFIG.baseUrl,
          hasConsumerKey:
            !!TEST_CONFIG.consumerKey &&
            TEST_CONFIG.consumerKey !== "TU_CONSUMER_KEY_AQUI",
          hasConsumerSecret:
            !!TEST_CONFIG.consumerSecret &&
            TEST_CONFIG.consumerSecret !== "TU_CONSUMER_SECRET_AQUI",
        },
        response: response.ok
          ? {
              productsCount: Array.isArray(responseData)
                ? responseData.length
                : 0,
              firstProduct:
                Array.isArray(responseData) && responseData.length > 0
                  ? {
                      id: responseData[0].id,
                      name: responseData[0].name,
                      status: responseData[0].status,
                    }
                  : null,
            }
          : {
              error: responseData,
            },
        message: response.ok
          ? `✅ Conexión exitosa. Se encontraron ${
              Array.isArray(responseData) ? responseData.length : 0
            } productos.`
          : `❌ Error ${response.status}: ${response.statusText}`,
      });
    }

    // Test de categorías
    if (testType === "categories") {
      const url = `${TEST_CONFIG.baseUrl}/products/categories?per_page=10`;
      const response = await fetch(url, {
        headers: createAuthHeaders(),
        cache: "no-store",
      });

      const responseData = await response.json();

      return NextResponse.json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        url,
        categoriesCount: Array.isArray(responseData) ? responseData.length : 0,
        categories: Array.isArray(responseData)
          ? responseData.map(
              (cat: { id: number; name: string; slug: string }) => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
              })
            )
          : responseData,
        message: response.ok
          ? `✅ Se encontraron ${
              Array.isArray(responseData) ? responseData.length : 0
            } categorías.`
          : `❌ Error ${response.status}: ${response.statusText}`,
      });
    }

    // Test de tags
    if (testType === "tags") {
      const url = `${TEST_CONFIG.baseUrl}/products/tags?per_page=10`;
      const response = await fetch(url, {
        headers: createAuthHeaders(),
        cache: "no-store",
      });

      const responseData = await response.json();

      return NextResponse.json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        url,
        tagsCount: Array.isArray(responseData) ? responseData.length : 0,
        tags: Array.isArray(responseData)
          ? responseData.map(
              (tag: { id: number; name: string; slug: string }) => ({
                id: tag.id,
                name: tag.name,
                slug: tag.slug,
              })
            )
          : responseData,
        message: response.ok
          ? `✅ Se encontraron ${
              Array.isArray(responseData) ? responseData.length : 0
            } tags.`
          : `❌ Error ${response.status}: ${response.statusText}`,
      });
    }

    // Diagnóstico de shipping: producto WC 276 (u otro) vs lista Printful
    if (testType === "shipping-debug") {
      const productIdParam = searchParams.get("productId") || "276";
      const productId = parseInt(productIdParam, 10) || 276;
      const printfulToken =
        process.env.PRINTFUL_ACCESS_TOKEN || process.env.PRINTFUL_API_KEY;
      const envStoreId = process.env.PRINTFUL_STORE_ID;

      const wcRes = await fetch(
        `${TEST_CONFIG.baseUrl}/products/${productId}`,
        { headers: createAuthHeaders(), cache: "no-store" }
      );
      const wcProduct = wcRes.ok ? await wcRes.json() : null;
      const wcMeta = wcProduct?.meta_data ?? [];
      const printfulMetaKeys = wcMeta
        .filter((m: { key: string }) =>
          String(m.key).toLowerCase().includes("printful")
        )
        .map((m: { key: string; value?: unknown }) => ({
          key: m.key,
          value: m.value,
        }));

      let storesList: Array<{ id: number; type?: string; name?: string }> = [];
      if (printfulToken) {
        const storesRes = await fetch("https://api.printful.com/stores", {
          headers: { Authorization: `Bearer ${printfulToken}` },
          cache: "no-store",
        });
        if (storesRes.ok) {
          const storesData = await storesRes.json();
          const result = storesData.result;
          storesList = Array.isArray(result)
            ? result
            : result && typeof result.id === "number"
              ? [result]
              : [];
        }
      }

      let printfulList: Array<{ id: number; external_id?: string; name?: string }> = [];
      let storeIdUsed: number | null = null;
      const perStoreProducts: Array<{
        storeId: number;
        storeName?: string;
        count: number;
        hasProduct276: boolean;
      }> = [];

      if (printfulToken) {
        const storeIdsToTry: number[] =
          envStoreId != null && envStoreId !== ""
            ? (() => {
                const n = parseInt(String(envStoreId).trim(), 10);
                return !Number.isNaN(n) && n > 0 ? [n] : [];
              })()
            : storesList.map((s) => s.id).filter((id): id is number => typeof id === "number");

        for (const storeId of storeIdsToTry) {
          const pfRes = await fetch(
            "https://api.printful.com/sync/products?limit=100",
            {
              headers: {
                Authorization: `Bearer ${printfulToken}`,
                "X-PF-Store-Id": String(storeId),
              },
              cache: "no-store",
            }
          );
          let parsed: Array<{ id: number; external_id?: string; name?: string }> = [];
          if (pfRes.ok) {
            const pfData = await pfRes.json();
            parsed = Array.isArray(pfData.result) ? pfData.result : [];
          }
          const storeName = storesList.find((s) => s.id === storeId)?.name;
          const count = parsed.length;
          const hasProduct276 = parsed.some(
            (p) =>
              p.external_id === String(productId) ||
              parseInt(String(p.external_id || ""), 10) === productId
          );
          perStoreProducts.push({
            storeId,
            storeName,
            count,
            hasProduct276,
          });
          if (hasProduct276 || (storeIdUsed == null && count > 0)) {
            storeIdUsed = storeId;
            printfulList = parsed;
          }
        }
        if (storeIdUsed == null && storeIdsToTry.length > 0)
          storeIdUsed = storeIdsToTry[0];

        if (printfulList.length === 0 && storeIdsToTry.length === 0) {
          const pfRes = await fetch(
            "https://api.printful.com/sync/products?limit=100",
            {
              headers: { Authorization: `Bearer ${printfulToken}` },
              cache: "no-store",
            }
          );
          if (pfRes.ok) {
            const pfData = await pfRes.json();
            printfulList = Array.isArray(pfData.result) ? pfData.result : [];
          }
        }
      }

      const match = printfulList.find(
        (p) =>
          p.external_id === String(productId) ||
          (typeof p.external_id === "string" &&
            parseInt(p.external_id, 10) === productId)
      );

      return NextResponse.json({
        success: true,
        productId,
        wooCommerce: wcRes.ok
          ? {
              id: wcProduct?.id,
              name: wcProduct?.name,
              parent_id: wcProduct?.parent_id,
              meta_data_printful: printfulMetaKeys,
              all_meta_keys: wcMeta.map((m: { key: string }) => m.key),
            }
          : { error: wcRes.status, statusText: wcRes.statusText },
        printful: {
          hasToken: !!printfulToken,
          storesList: storesList.map((s) => ({
            id: s.id,
            type: s.type,
            name: s.name,
          })),
          perStoreProducts,
          storeIdUsed: storeIdUsed ?? (envStoreId || "none"),
          storeProductsCount: printfulList.length,
          externalIds: printfulList.slice(0, 15).map((p) => ({
            id: p.id,
            external_id: p.external_id,
            name: p.name,
          })),
          matchForProductId: match
            ? { printfulSyncId: match.id, external_id: match.external_id }
            : null,
        },
        hint: !match
          ? "Con token Account hace falta X-PF-Store-Id. Lista de tiendas arriba (storesList). Si storeProductsCount=0, prueba añadir PRINTFUL_STORE_ID en .env con el id de la tienda WooCommerce."
          : "Match encontrado. El shipping debería poder resolver sync id.",
      });
    }

    // Test Printful: producto WC → meta sync id → Printful variant → shipping rates
    if (testType === "printful") {
      const printfulToken =
        process.env.PRINTFUL_ACCESS_TOKEN || process.env.PRINTFUL_API_KEY;
      const steps: Record<string, unknown> = {};

      // 1) Primer producto de WooCommerce
      const productsRes = await fetch(
        `${TEST_CONFIG.baseUrl}/products?per_page=1&status=publish`,
        {
          headers: createAuthHeaders(),
          cache: "no-store",
        }
      );
      const productsList = productsRes.ok ? await productsRes.json() : [];
      const firstProduct =
        Array.isArray(productsList) && productsList.length > 0
          ? productsList[0]
          : null;
      steps.wooProduct = firstProduct
        ? {
            id: firstProduct.id,
            name: firstProduct.name,
            hasMetaData: !!firstProduct.meta_data,
            /** Solo keys que contienen "printful" */
            metaDataKeysPrintful:
              firstProduct.meta_data
                ?.map((m: { key: string }) => m.key)
                .filter((k: string) => k.toLowerCase().includes("printful")) ??
              [],
            /** TODAS las meta keys del producto (para ver qué guarda el plugin de Printful) */
            allMetaKeys:
              firstProduct.meta_data?.map((m: { key: string }) => m.key) ?? [],
          }
        : "No products";

      if (!firstProduct?.id) {
        return NextResponse.json({
          success: false,
          steps,
          message: "No hay productos en WooCommerce para probar.",
        });
      }

      const metaList = firstProduct.meta_data ?? [];
      const printfulMetaKeys = [
        "_printful_sync_product_id",
        "printful_sync_product_id",
        "_printful_product_id",
        "printful_product_id",
      ];
      let syncProductId: number | null = null;
      for (const key of printfulMetaKeys) {
        const meta = metaList.find((m: { key: string }) => m.key === key);
        const raw = meta?.value;
        if (raw != null) {
          const id = typeof raw === "number" ? raw : parseInt(String(raw), 10);
          if (!Number.isNaN(id) && id > 0) {
            syncProductId = id;
            break;
          }
        }
      }
      steps.printfulSyncProductId =
        syncProductId ?? "No encontrado en meta_data";

      if (!printfulToken) {
        return NextResponse.json({
          success: false,
          steps,
          message:
            "Falta PRINTFUL_ACCESS_TOKEN o PRINTFUL_API_KEY en .env.local",
        });
      }

      if (syncProductId == null) {
        return NextResponse.json({
          success: false,
          steps,
          message:
            "Producto sin _printful_sync_product_id. Sincroniza el producto con Printful en WooCommerce.",
        });
      }

      // 2) Printful store product → variant_id
      const pfProductRes = await fetch(
        `https://api.printful.com/store/products/${syncProductId}`,
        {
          headers: { Authorization: `Bearer ${printfulToken}` },
        }
      );
      const pfProduct = pfProductRes.ok ? await pfProductRes.json() : null;
      const variants = pfProduct?.result?.sync_variants;
      const variantId =
        Array.isArray(variants) && variants.length > 0
          ? variants[0].variant_id ?? variants[0].id
          : null;
      steps.printfulVariantId =
        variantId ??
        (pfProductRes.ok
          ? "No variants"
          : { status: pfProductRes.status, body: await pfProductRes.text() });

      if (variantId == null) {
        return NextResponse.json({
          success: false,
          steps,
          message: "Printful no devolvió variant_id para este sync product.",
        });
      }

      // 3) Printful shipping rates
      const shippingRes = await fetch(
        "https://api.printful.com/shipping/rates",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${printfulToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient: { country_code: "US", state_code: "AK", zip: "99685" },
            items: [{ variant_id: variantId, quantity: 1 }],
          }),
        }
      );
      const shippingBody = await shippingRes.text();
      const shippingData = shippingRes.ok
        ? (() => {
            try {
              return JSON.parse(shippingBody);
            } catch {
              return null;
            }
          })()
        : null;
      const rates = shippingData?.result;
      steps.printfulRates = Array.isArray(rates)
        ? rates.length
        : shippingRes.ok
        ? 0
        : { status: shippingRes.status, body: shippingBody.slice(0, 300) };

      return NextResponse.json({
        success: !!Array.isArray(rates) && rates.length > 0,
        steps,
        message:
          Array.isArray(rates) && rates.length > 0
            ? `✅ Printful OK. ${rates.length} tarifas para US.`
            : "❌ Printful no devolvió tarifas o falló la petición.",
      });
    }

    // Ver TODAS las meta de un producto (para descubrir qué key usa el plugin de Printful)
    if (testType === "printful-meta") {
      const productIdParam = searchParams.get("productId");
      const productId = productIdParam ? parseInt(productIdParam, 10) : null;
      if (!productId || Number.isNaN(productId)) {
        return NextResponse.json(
          {
            error: "Query productId requerido (ej: ?type=printful-meta&productId=276)",
            availableTypes: ["health", "products", "categories", "tags", "printful", "printful-meta"],
          },
          { status: 400 }
        );
      }
      const res = await fetch(`${TEST_CONFIG.baseUrl}/products/${productId}`, {
        headers: createAuthHeaders(),
        cache: "no-store",
      });
      if (!res.ok) {
        return NextResponse.json({ success: false, error: await res.text(), status: res.status });
      }
      const product = await res.json();
      const metaList = product.meta_data ?? [];
      const allMeta = metaList.map((m: { key: string; value: unknown }) => ({ key: m.key, value: m.value }));
      const printfulLike = allMeta.filter((m: { key: string }) => /printful|pf_|_pf/i.test(m.key));
      return NextResponse.json({
        success: true,
        productId: product.id,
        name: product.name,
        totalMetaCount: allMeta.length,
        allMetaKeys: allMeta.map((m: { key: string }) => m.key),
        printfulLikeKeys: printfulLike.map((m: { key: string }) => m.key),
        fullMetaPrintfulLike: printfulLike,
        fullMetaAll: allMeta,
      });
    }

    return NextResponse.json(
      {
        error: "Tipo de test no válido",
        availableTypes: [
          "health",
          "products",
          "categories",
          "tags",
          "printful",
          "printful-meta",
        ],
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Error en test:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        stack: error instanceof Error ? error.stack : undefined,
        config: {
          baseUrl: TEST_CONFIG.baseUrl,
          hasConsumerKey:
            !!TEST_CONFIG.consumerKey &&
            TEST_CONFIG.consumerKey !== "TU_CONSUMER_KEY_AQUI",
          hasConsumerSecret:
            !!TEST_CONFIG.consumerSecret &&
            TEST_CONFIG.consumerSecret !== "TU_CONSUMER_SECRET_AQUI",
        },
      },
      { status: 500 }
    );
  }
}
