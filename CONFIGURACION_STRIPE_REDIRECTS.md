# 🔄 Configuración de URLs de Redirección para Stripe

## ⚠️ Aclaración Importante

**Las URLs de redirección NO se configuran en WooCommerce/WordPress.**

Las URLs de redirección se manejan de una de estas formas:

---

## 📍 Opción 1: Configurar en Stripe Dashboard (Recomendado)

### Para Stripe Checkout Sessions (hosted):

En Stripe **no existe** una opción “global” en el dashboard para definir `success_url` / `cancel_url` para **Checkout Sessions**.

✅ En Checkout Sessions, **las URLs se definen cuando se crea la sesión (por API)**:

- `success_url` / `cancel_url` se envían en el request de “Create a Checkout Session”: [`https://docs.stripe.com/api/checkout/sessions/create`](https://docs.stripe.com/api/checkout/sessions/create)
- Guía de “custom success page”: [`https://docs.stripe.com/payments/checkout/custom-success-page`](https://docs.stripe.com/payments/checkout/custom-success-page)

**Por eso, si estás usando WooCommerce + Stripe (plugin), normalmente NO verás dónde “poner” esas URLs en Stripe**: el plugin crea la sesión por ti y decide a qué URL regresar (generalmente a la página “order received” de WordPress).

### Para Payment Links (si los usas)

Las URLs de éxito/cancelación se configuran dentro del Payment Link (no aplica a tu flujo actual con WooCommerce order-pay).

---

## 📍 Opción 2: Pasar URLs al Crear el Pedido (Más Control)

Si WooCommerce Stripe Gateway permite pasar URLs personalizadas al crear el pedido, puedes modificar el endpoint para incluir las URLs.

### Modificar `app/api/checkout/create-order/route.ts`:

Agrega las URLs en el `orderData` o en los metadatos:

```typescript
const orderData = {
  payment_method: "stripe",
  payment_method_title: "Credit Card (Stripe)",
  set_paid: false,
  billing: billingAddress,
  shipping: shippingAddress,
  line_items: lineItems,
  shipping_lines: [...],
  meta_data: [
    {
      key: "_stripe_source_id",
      value: "",
    },
    // Agregar URLs de redirección si WooCommerce Stripe Gateway lo soporta
    {
      key: "_stripe_success_url",
      value: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout/success?order_id={order_id}`,
    },
    {
      key: "_stripe_cancel_url",
      value: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout?canceled=true`,
    },
  ],
};
```

---

## 📍 Opción 3: Usar URLs por Defecto de WooCommerce

WooCommerce Stripe Gateway puede usar automáticamente las URLs basadas en:

- La URL del sitio configurada en **WordPress → Settings → General → WordPress Address (URL)**
- O la URL del pedido en WooCommerce

**Problema**: Esto redirigirá a `headlessamulets.in` en lugar de `amuletsorder.com` o `localhost:3000`.

---

## 🎯 Solución Recomendada

### Para Desarrollo (localhost):

1. **No necesitas configurar nada en WooCommerce**
2. **Configura en Stripe Dashboard** las URLs de localhost
3. O **pasa las URLs en el pedido** si WooCommerce Stripe Gateway lo soporta

### Para Producción:

1. **Configura en Stripe Dashboard** las URLs de producción:
   - Success URL: `https://amuletsorder.com/checkout/success?order_id={CHECKOUT_SESSION_ID}`
   - Cancel URL: `https://amuletsorder.com/checkout?canceled=true`

---

## 🔍 Verificar Cómo Funciona WooCommerce Stripe Gateway

### Paso 1: Crear un pedido de prueba

1. Crea un pedido vía API
2. Revisa la respuesta de WooCommerce
3. Verifica si `payment_url` incluye parámetros de redirección

### Paso 2: Revisar la documentación de WooCommerce Stripe Gateway

Algunos plugins de Stripe Gateway permiten configurar URLs en:

- **WooCommerce → Settings → Payments → Stripe → Advanced Settings**
- O en los metadatos del pedido

---

## 🧪 Probar sin Configurar URLs

**Puedes probar primero sin configurar URLs**:

1. Crea el pedido
2. Obtén el `payment_url` de Stripe
3. Completa el pago
4. Stripe redirigirá a una URL por defecto (probablemente `headlessamulets.in`)
5. Luego puedes ajustar las URLs según lo que necesites

---

## 📝 Nota sobre Webhooks

**Los webhooks de Stripe son diferentes**:

- **Webhooks**: Son para recibir notificaciones de eventos (pago completado, fallido, etc.)
- **URLs de redirección**: Son para redirigir al usuario después del pago

**Los webhooks son opcionales** pero recomendados para:

- Confirmar automáticamente que el pago fue exitoso
- Actualizar el estado del pedido en WooCommerce
- Enviar emails de confirmación

### WooCommerce Stripe (plugin) y webhooks

Si estás usando la extensión oficial de WooCommerce Stripe, desde la versión **8.6.1** los webhooks se configuran automáticamente al conectar Stripe (modo live y test). Puedes verificarlo en:

- **WooCommerce → Settings → Payments → Stripe → Settings → Configure connection**

La documentación oficial indica que el endpoint usado tiene el formato:
`https://www.example.com/?wc-api=wc_stripe`  
Referencia: [`https://woocommerce.com/document/stripe/setup-and-configuration/stripe-webhooks`](https://woocommerce.com/document/stripe/setup-and-configuration/stripe-webhooks)

---

## ✅ Resumen

1. **NO necesitas configurar URLs en WooCommerce** (a menos que el plugin lo permita)
2. En **Stripe Checkout Sessions**, `success_url`/`cancel_url` se definen **al crear la sesión (API)**; con WooCommerce, el plugin controla el retorno.
3. **Los webhooks son opcionales** pero recomendados
4. **Prueba primero** y ajusta según lo que funcione con tu configuración

---

¿Quieres que modifiquemos el código para pasar las URLs al crear el pedido?
