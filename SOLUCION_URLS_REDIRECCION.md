# 🔄 Solución Real: URLs de Redirección en Stripe Checkout

## ⚠️ Aclaración Importante

**NO existe una opción en el Dashboard de Stripe para configurar URLs de redirección globales.**

Las URLs de redirección (`success_url` y `cancel_url`) **solo se pueden configurar cuando CREAS un Checkout Session** mediante la API de Stripe.

---

## 🔍 El Problema

Cuando usas **WooCommerce Stripe Gateway**:

1. WooCommerce crea el Checkout Session automáticamente
2. WooCommerce Stripe Gateway NO te permite pasar `success_url` y `cancel_url` personalizadas
3. WooCommerce usa URLs por defecto basadas en tu sitio de WordPress (`headlessamulets.in`)

**Resultado**: El usuario es redirigido a `headlessamulets.in` en lugar de `amuletsorder.com` o `localhost:3000`.

---

## ✅ Soluciones Posibles

### **Opción 1: Crear Checkout Session Directamente (Recomendado)**

En lugar de dejar que WooCommerce cree el Checkout Session, **creamos el Checkout Session directamente desde nuestro endpoint** usando la API de Stripe.

**Ventajas**:
- ✅ Control total sobre las URLs de redirección
- ✅ Funciona con cualquier dominio (localhost, producción, etc.)
- ✅ Más flexible

**Desventajas**:
- ⚠️ Necesitas las claves de API de Stripe en tu `.env.local`
- ⚠️ Más código que mantener

---

### **Opción 2: Usar Webhooks para Redirección Manual**

1. Crear el pedido en WooCommerce (sin payment_url)
2. Crear Checkout Session desde nuestro endpoint con URLs personalizadas
3. Redirigir al usuario a Stripe
4. Usar webhook para detectar cuando el pago es exitoso
5. Redirigir manualmente al usuario a la página de éxito

**Ventajas**:
- ✅ Control sobre las URLs
- ✅ No depende de WooCommerce Stripe Gateway

**Desventajas**:
- ⚠️ Más complejo
- ⚠️ Requiere webhooks configurados

---

### **Opción 3: Modificar WooCommerce para Pasar URLs**

Si WooCommerce Stripe Gateway tiene hooks o filtros, podemos interceptar la creación del Checkout Session y agregar las URLs.

**Ventajas**:
- ✅ Mantiene el flujo de WooCommerce

**Desventajas**:
- ⚠️ Requiere plugin personalizado en WordPress
- ⚠️ Puede romperse con actualizaciones de WooCommerce

---

## 🎯 Solución Recomendada: Opción 1

### Crear Checkout Session Directamente

**Paso 1**: Agregar variables de Stripe a `.env.local`

```env
# Stripe (para crear Checkout Sessions directamente)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Paso 2**: Modificar `app/api/checkout/create-order/route.ts`

En lugar de solo crear el pedido en WooCommerce, también creamos el Checkout Session de Stripe:

```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

// Después de crear el pedido en WooCommerce:
const checkoutSession = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  line_items: lineItems.map(item => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.product.name,
      },
      unit_amount: Math.round(item.product.price * 100), // Convertir a centavos
    },
    quantity: item.quantity,
  })),
  mode: "payment",
  success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout/success?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout?canceled=true`,
  metadata: {
    order_id: order.id.toString(),
    order_key: order.order_key,
  },
});

// Devolver la URL del Checkout Session
return NextResponse.json({
  success: true,
  order_id: order.id,
  order_key: order.order_key,
  payment_url: checkoutSession.url, // URL de Stripe Checkout
  status: order.status,
});
```

---

## 📝 Nota Importante sobre Webhooks

**Según la documentación de Stripe**:

> "Webhooks are required for reliable fulfillment, as customers aren't guaranteed to reach the success page (e.g., due to internet connection loss)."

**Esto significa**:
- Las URLs de redirección son para UX (experiencia de usuario)
- Los webhooks son para confirmar el pago en el servidor (más confiable)
- Debes configurar webhooks para confirmar pagos automáticamente

---

## 🚀 Implementación Recomendada

1. **Crear pedido en WooCommerce** (para tener el registro)
2. **Crear Checkout Session en Stripe** (con URLs personalizadas)
3. **Redirigir al usuario** a la URL del Checkout Session
4. **Configurar webhook** (opcional pero recomendado) para confirmar el pago

---

## ❓ ¿Qué Prefieres?

1. **Implementar la Opción 1** (crear Checkout Session directamente) - Más control
2. **Probar primero** con WooCommerce y ver a dónde redirige - Más simple
3. **Buscar otra solución** según tu configuración específica

¿Cuál prefieres que implementemos?
