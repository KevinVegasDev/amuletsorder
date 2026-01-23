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
  baseUrl: process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 
           process.env.WORDPRESS_API_URL || 
           "https://headlessamulets.in/wp-json/wc/v3",
  consumerKey: process.env.WORDPRESS_CONSUMER_KEY || "TU_CONSUMER_KEY_AQUI",
  consumerSecret: process.env.WORDPRESS_CONSUMER_SECRET || "TU_CONSUMER_SECRET_AQUI",
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
        hasKey: !!TEST_CONFIG.consumerKey && TEST_CONFIG.consumerKey !== "TU_CONSUMER_KEY_AQUI",
        hasSecret: !!TEST_CONFIG.consumerSecret && TEST_CONFIG.consumerSecret !== "TU_CONSUMER_SECRET_AQUI",
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
          hasConsumerKey: !!TEST_CONFIG.consumerKey && TEST_CONFIG.consumerKey !== "TU_CONSUMER_KEY_AQUI",
          hasConsumerSecret: !!TEST_CONFIG.consumerSecret && TEST_CONFIG.consumerSecret !== "TU_CONSUMER_SECRET_AQUI",
        },
        response: response.ok ? {
          productsCount: Array.isArray(responseData) ? responseData.length : 0,
          firstProduct: Array.isArray(responseData) && responseData.length > 0 ? {
            id: responseData[0].id,
            name: responseData[0].name,
            status: responseData[0].status,
          } : null,
        } : {
          error: responseData,
        },
        message: response.ok 
          ? `✅ Conexión exitosa. Se encontraron ${Array.isArray(responseData) ? responseData.length : 0} productos.`
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
        categories: Array.isArray(responseData) ? responseData.map((cat: { id: number; name: string; slug: string }) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
        })) : responseData,
        message: response.ok 
          ? `✅ Se encontraron ${Array.isArray(responseData) ? responseData.length : 0} categorías.`
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
        tags: Array.isArray(responseData) ? responseData.map((tag: { id: number; name: string; slug: string }) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
        })) : responseData,
        message: response.ok 
          ? `✅ Se encontraron ${Array.isArray(responseData) ? responseData.length : 0} tags.`
          : `❌ Error ${response.status}: ${response.statusText}`,
      });
    }

    return NextResponse.json({
      error: "Tipo de test no válido",
      availableTypes: ["health", "products", "categories", "tags"],
    }, { status: 400 });

  } catch (error) {
    console.error("❌ Error en test:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      stack: error instanceof Error ? error.stack : undefined,
      config: {
        baseUrl: TEST_CONFIG.baseUrl,
        hasConsumerKey: !!TEST_CONFIG.consumerKey && TEST_CONFIG.consumerKey !== "TU_CONSUMER_KEY_AQUI",
        hasConsumerSecret: !!TEST_CONFIG.consumerSecret && TEST_CONFIG.consumerSecret !== "TU_CONSUMER_SECRET_AQUI",
      },
    }, { status: 500 });
  }
}
