# Guía de Integración: Stripe + WooCommerce Headless

## 📋 Resumen de la Arquitectura

- **Frontend Next.js**: `amuletsorder.com`
- **WordPress/WooCommerce**: `headlessamulets.in`
- **Gateway de Pago**: Stripe (ya configurado en WooCommerce)

---

## 🎯 Opción Recomendada: Checkout Nativo de WooCommerce

### ¿Por qué esta opción?

1. ✅ **Seguridad**: WooCommerce maneja todos los datos sensibles (PCI compliant)
2. ✅ **Simplicidad**: Menos código, menos mantenimiento
3. ✅ **Confiabilidad**: Stripe Gateway de WooCommerce está probado y soportado
4. ✅ **Experiencia de usuario**: El checkout de WooCommerce es profesional y confiable
5. ✅ **Menos pasos**: Solo necesitas crear el pedido y redirigir

### Flujo de la Opción Recomendada:

```
1. Usuario en amuletsorder.com → Agrega productos al carrito (localStorage)
2. Usuario hace clic en "Finalizar Compra"
3. Frontend crea pedido en WooCommerce (headlessamulets.in) vía API REST
4. WooCommerce devuelve payment_url de Stripe
5. Frontend redirige a payment_url (checkout.stripe.com)
6. Usuario completa pago en Stripe
7. Stripe redirige de vuelta a tu sitio (success/cancel URLs)
8. Frontend muestra confirmación
```

---

## 🔧 Configuración Requerida

### 1. Variables de Entorno (.env.local)

```env
# ============================================
# WooCommerce API (REQUERIDO)
# ============================================
# URL base de la API de WooCommerce
NEXT_PUBLIC_WORDPRESS_API_URL=https://headlessamulets.in/wp-json/wc/v3

# Credenciales de API de WooCommerce
# Obtenerlas desde: WordPress Admin → WooCommerce → Settings → Advanced → REST API
WORDPRESS_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WORDPRESS_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# Stripe (OPCIONAL - Solo si haces checkout desde cero)
# ============================================
# Si usas checkout nativo de WooCommerce, NO necesitas estas variables
# Solo las necesitas si decides hacer checkout desde cero con Stripe.js

# Clave pública de Stripe (para Stripe.js en frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Clave secreta de Stripe (SOLO en servidor, NUNCA exponer en frontend)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Webhook secret (para verificar eventos de Stripe)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# URLs de Redirección (para después del pago)
# ============================================
NEXT_PUBLIC_SITE_URL=https://amuletsorder.com
NEXT_PUBLIC_CHECKOUT_SUCCESS_URL=https://amuletsorder.com/checkout/success
NEXT_PUBLIC_CHECKOUT_CANCEL_URL=https://amuletsorder.com/checkout
```

### 2. ¿Necesitas Plugin de CORS?

**Respuesta corta: NO, si usas la API REST de WooCommerce correctamente.**

**Explicación:**
- La API REST de WooCommerce usa **autenticación HTTP Basic** (Consumer Key/Secret)
- Esto NO requiere CORS porque las llamadas se hacen desde tu servidor Next.js (API routes), no desde el navegador
- Solo necesitarías CORS si hicieras llamadas directas desde el navegador (no recomendado por seguridad)

**Si aún así tienes problemas de CORS:**
- Instala el plugin: **"CORS Headers"** o **"WP REST API - Filter Fields"**
- O configura CORS manualmente en WordPress (wp-config.php o .htaccess)

### 3. ¿Necesitas CoCart o WPGraphQL?

**Respuesta: NO necesariamente.**

#### API REST de WooCommerce (Lo que ya tienes):
- ✅ **Suficiente** para crear pedidos y obtener productos
- ✅ **Más simple** - no requiere plugins adicionales
- ✅ **Ya lo estás usando** para productos
- ✅ **Funciona perfecto** para checkout

#### CoCart (Opcional):
- Útil si quieres **sincronizar el carrito** entre frontend y WordPress
- Permite que el carrito persista en WordPress (no solo localStorage)
- **NO es necesario** si tu carrito está solo en el frontend

#### WPGraphQL (Opcional):
- Útil si prefieres GraphQL sobre REST
- Más flexible para queries complejas
- **NO es necesario** para checkout básico

**Recomendación**: Empieza con la API REST que ya tienes. Solo agrega CoCart si necesitas sincronizar el carrito con WordPress.

---

## 🚀 Implementación: Checkout Nativo de WooCommerce

### Paso 1: Crear Endpoint de API en Next.js

Crea: `app/api/checkout/create-order/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { CartItem } from "@/app/types/cart";
import { CheckoutFormData } from "@/app/types/checkout";

const WOOCOMMERCE_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL!;
const CONSUMER_KEY = process.env.WORDPRESS_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.WORDPRESS_CONSUMER_SECRET!;

function createAuthHeader(): string {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  return `Basic ${auth}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartItems, formData, totals } = body;

    // Transformar items del carrito al formato de WooCommerce
    const lineItems = cartItems.map((item: CartItem) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    }));

    // Crear pedido en WooCommerce
    const orderData = {
      payment_method: "stripe", // O el ID de tu gateway de Stripe
      payment_method_title: "Credit Card (Stripe)",
      set_paid: false, // No marcar como pagado hasta que Stripe confirme
      billing: {
        first_name: formData.shippingAddress.firstName,
        last_name: formData.shippingAddress.lastName,
        email: formData.shippingAddress.email,
        phone: formData.shippingAddress.phone,
        address_1: formData.shippingAddress.address,
        address_2: formData.shippingAddress.apartment || "",
        city: formData.shippingAddress.city,
        state: formData.shippingAddress.state,
        postcode: formData.shippingAddress.zipCode,
        country: formData.shippingAddress.country,
      },
      shipping: {
        first_name: formData.shippingAddress.firstName,
        last_name: formData.shippingAddress.lastName,
        address_1: formData.shippingAddress.address,
        address_2: formData.shippingAddress.apartment || "",
        city: formData.shippingAddress.city,
        state: formData.shippingAddress.state,
        postcode: formData.shippingAddress.zipCode,
        country: formData.shippingAddress.country,
      },
      line_items: lineItems,
      shipping_lines: [
        {
          method_title: "Standard Shipping",
          method_id: "flat_rate",
          total: totals.shipping.toFixed(2),
        },
      ],
      meta_data: [
        {
          key: "_stripe_source_id",
          value: "", // Se llenará cuando Stripe procese el pago
        },
      ],
    };

    // Llamar a WooCommerce API
    const response = await fetch(`${WOOCOMMERCE_URL}/orders`, {
      method: "POST",
      headers: {
        Authorization: createAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error creating order");
    }

    const order = await response.json();

    // WooCommerce Stripe Gateway puede devolver payment_url
    // Si no, necesitas obtenerla de otra forma
    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_key: order.order_key,
      payment_url: order.payment_url || null,
      // Si no hay payment_url, necesitarás crear un Payment Intent manualmente
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### Paso 2: Obtener Payment URL de Stripe

Si WooCommerce no devuelve `payment_url` automáticamente, necesitas crear un Payment Intent:

**Opción A**: Usar el endpoint de WooCommerce Stripe Gateway (si está disponible):
```
POST /wp-json/wc/v3/orders/{order_id}/stripe/payment-intent
```

**Opción B**: Crear Payment Intent directamente con Stripe (requiere las variables de Stripe):

```typescript
// app/api/checkout/create-payment-intent/route.ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: NextRequest) {
  const { orderId, amount } = await request.json();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convertir a centavos
    currency: "usd",
    metadata: {
      order_id: orderId.toString(),
    },
  });

  return NextResponse.json({
    client_secret: paymentIntent.client_secret,
  });
}
```

### Paso 3: Actualizar useCheckout.ts

Modifica `app/market/hooks/useCheckout.ts` para usar el nuevo endpoint:

```typescript
const handleSubmit = useCallback(async () => {
  // ... validaciones ...

  setIsProcessing(true);

  try {
    const totals = {
      subtotal: calculateSubtotal(),
      shipping: calculateShipping(),
      tax: calculateTax(),
      total: calculateTotal(),
    };

    // 1. Crear pedido en WooCommerce
    const orderResponse = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartItems: cart.items,
        formData,
        totals,
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderData.success) {
      throw new Error(orderData.error || "Failed to create order");
    }

    // 2. Si hay payment_url, redirigir a Stripe Checkout
    if (orderData.payment_url) {
      window.location.href = orderData.payment_url;
      return; // El usuario será redirigido, no necesitas limpiar el carrito aún
    }

    // 3. Si no hay payment_url, crear Payment Intent manualmente
    // (Implementar según tu configuración de Stripe)

    // 4. Limpiar carrito solo después de confirmar que el pago fue exitoso
    // (Esto se hace en la página de success después de que Stripe redirija)

  } catch (error: any) {
    console.error("Error processing order:", error);
    showToast(error.message || "Failed to process order", "error", 3000);
  } finally {
    setIsProcessing(false);
  }
}, [/* ... */]);
```

### Paso 4: Configurar URLs de Redirección en WooCommerce

En WordPress Admin:
1. Ve a **WooCommerce → Settings → Payments → Stripe**
2. Configura las URLs de redirección:
   - **Success URL**: `https://amuletsorder.com/checkout/success?order_id={order_id}`
   - **Cancel URL**: `https://amuletsorder.com/checkout?canceled=true`

### Paso 5: Crear Página de Éxito

Crea `app/checkout/success/page.tsx`:

```typescript
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      // Verificar estado del pedido en WooCommerce
      fetch(`/api/checkout/verify-order?order_id=${orderId}`)
        .then((res) => res.json())
        .then((data) => setOrder(data));
    }
  }, [orderId]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">¡Pago Exitoso!</h1>
        {orderId && <p>Order ID: {orderId}</p>}
      </div>
    </div>
  );
}
```

---

## 🔄 Alternativa: Checkout desde Cero con Stripe

Si decides hacer el checkout completamente en tu frontend (más complejo):

### Pasos Adicionales:

1. **Instalar Stripe.js**:
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

2. **Crear Payment Intent** en tu API
3. **Usar Stripe Elements** en el frontend
4. **Confirmar el pago** con Stripe.js
5. **Actualizar el pedido** en WooCommerce después del pago
6. **Configurar Webhooks** de Stripe para confirmar pagos

**Complejidad**: ~15-20 pasos adicionales, más código, más mantenimiento.

---

## 📊 Comparación Final

| Aspecto | Checkout Nativo WooCommerce | Checkout desde Cero |
|---------|----------------------------|---------------------|
| **Complejidad** | ⭐⭐ (2/5) | ⭐⭐⭐⭐ (4/5) |
| **Seguridad** | ✅ PCI Compliant | ⚠️ Debes manejar PCI |
| **Código** | ~200 líneas | ~1000+ líneas |
| **Mantenimiento** | Bajo | Alto |
| **Experiencia UX** | Usuario sale del dominio | Usuario se queda |
| **Tiempo de desarrollo** | 2-4 horas | 1-2 días |

---

## ✅ Recomendación Final

**Usa el Checkout Nativo de WooCommerce** porque:
1. Es más seguro (PCI compliant)
2. Es más rápido de implementar
3. Requiere menos código
4. Es más confiable
5. El usuario confía en Stripe (marca reconocida)

**Para mitigar que el usuario "salga" del dominio:**
- Usa un mensaje claro: "Serás redirigido a Stripe para completar el pago de forma segura"
- Configura branding en Stripe (logo, colores)
- Después del pago, redirige de vuelta con un mensaje de agradecimiento profesional

---

## 🆘 Solución de Problemas

### Error: CORS
- Asegúrate de hacer las llamadas desde API routes de Next.js (servidor), no desde el navegador
- Si necesitas CORS, instala plugin "CORS Headers" en WordPress

### Error: "Invalid consumer key"
- Verifica que las credenciales estén correctas en .env
- Asegúrate de que el Consumer Key tenga permisos de lectura/escritura

### Error: "Payment URL not found"
- Verifica que WooCommerce Stripe Gateway esté instalado y activo
- Revisa la configuración de Stripe en WooCommerce
- Puede que necesites crear el Payment Intent manualmente

---

## 📝 Checklist de Implementación

- [ ] Configurar variables de entorno (.env.local)
- [ ] Crear endpoint `/api/checkout/create-order`
- [ ] Actualizar `useCheckout.ts` para crear pedido
- [ ] Configurar URLs de redirección en WooCommerce Stripe
- [ ] Crear página de éxito (`/checkout/success`)
- [ ] Crear página de cancelación (opcional)
- [ ] Probar flujo completo en modo prueba
- [ ] Configurar webhooks de Stripe (opcional, para confirmación automática)
- [ ] Cambiar a modo producción cuando esté listo

---

¿Quieres que implemente alguna de estas opciones ahora?
