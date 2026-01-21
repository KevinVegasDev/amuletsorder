# Guía de Integración: WooCommerce + Stripe

Esta guía explica cómo conectar el checkout con WooCommerce y Stripe cuando estés listo.

## 📋 Requisitos Previos

1. **WordPress con WooCommerce instalado**
2. **WooCommerce Stripe Payment Gateway** instalado y configurado
3. **Credenciales de API de WooCommerce** configuradas
4. **Claves de API de Stripe** configuradas en WooCommerce

## 🔧 Configuración

### 1. Variables de Entorno

Asegúrate de tener estas variables en tu `.env.local`:

```env
# WordPress/WooCommerce API
NEXT_PUBLIC_WORDPRESS_API_URL=https://tudominio.com/wp-json/wc/v3
WORDPRESS_CONSUMER_KEY=ck_xxxxxxxxxxxxx
WORDPRESS_CONSUMER_SECRET=cs_xxxxxxxxxxxxx
```

### 2. Configurar WooCommerce Stripe Gateway

1. Ve a **WooCommerce → Settings → Payments → Stripe**
2. Activa Stripe
3. Configura tus claves de API de Stripe:
   - **Publishable Key**
   - **Secret Key**
4. Configura el modo (Test o Live)
5. Guarda los cambios

## 🔌 Pasos para Conectar

### Paso 1: Descomentar Código en `useCheckout.ts`

Abre `app/market/hooks/useCheckout.ts` y busca la función `handleSubmit()`.

Descomenta el bloque que dice:

```typescript
// TODO: DESCOMENTAR Y CONECTAR CON WOOCOMMERCE
```

### Paso 2: Descomentar Funciones en `woocommerce-api.ts`

Abre `app/lib/woocommerce-api.ts` y descomenta las funciones:

- `createWooCommerceOrder()`
- `processStripePayment()`
- `confirmStripePayment()`

### Paso 3: Instalar Stripe.js (si usas Stripe Elements)

Si quieres usar Stripe Elements para el formulario de pago:

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

Luego actualiza `PaymentForm.tsx` para usar Stripe Elements.

### Paso 4: Crear API Route para Confirmar Pago (Opcional)

Si prefieres confirmar el pago desde el servidor, crea:

`app/api/stripe/confirm-payment/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { confirmStripePayment } from "@/lib/woocommerce-api";

export async function POST(request: NextRequest) {
  try {
    const { client_secret, payment_method_id } = await request.json();

    const result = await confirmStripePayment(client_secret, payment_method_id);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
```

## 🔄 Flujo de Pago

### Opción A: Stripe Checkout (Redirección)

1. Usuario completa el checkout
2. Se crea el pedido en WooCommerce
3. WooCommerce devuelve `payment_url`
4. Usuario es redirigido a Stripe Checkout
5. Usuario completa el pago en Stripe
6. Stripe redirige de vuelta a tu sitio
7. WooCommerce recibe la confirmación vía webhook

**Ventaja**: Más simple, no necesitas manejar tarjetas directamente

### Opción B: Stripe Elements (Pago Inline)

1. Usuario completa el checkout
2. Se crea el pedido en WooCommerce
3. Se crea un Payment Intent en Stripe
4. Se muestra el formulario de tarjeta con Stripe Elements
5. Usuario ingresa datos de tarjeta
6. Se confirma el pago con Stripe
7. WooCommerce recibe la confirmación

**Ventaja**: Mejor UX, el usuario no sale de tu sitio

## 📝 Estructura de Archivos

```
app/
├── types/
│   └── woocommerce.ts          ✅ Tipos para WooCommerce
├── lib/
│   └── woocommerce-api.ts      ✅ Funciones para conectar con WooCommerce
├── market/
│   └── hooks/
│       └── useCheckout.ts     ✅ Hook con lógica de checkout (comentado)
└── components/
    └── Checkout/
        └── PaymentForm.tsx    ⚠️ Actualizar para Stripe Elements (opcional)
```

## 🧪 Testing

### Modo Test

1. Configura Stripe en modo Test en WooCommerce
2. Usa tarjetas de prueba de Stripe:
   - **Éxito**: `4242 4242 4242 4242`
   - **Rechazo**: `4000 0000 0000 0002`
   - **3D Secure**: `4000 0025 0000 3155`

### Verificar Pedidos

Después de un pago exitoso, verifica en:

- **WooCommerce → Orders**: Debe aparecer el pedido
- **Stripe Dashboard**: Debe aparecer el pago

## 🐛 Troubleshooting

### Error: "Invalid API credentials"

- Verifica que `WORDPRESS_CONSUMER_KEY` y `WORDPRESS_CONSUMER_SECRET` sean correctos
- Asegúrate de que las credenciales tengan permisos de lectura/escritura

### Error: "Payment method not found"

- Verifica que WooCommerce Stripe Gateway esté activo
- Revisa que las claves de Stripe estén configuradas correctamente

### El pedido se crea pero el pago falla

- Revisa los logs de WooCommerce
- Verifica los webhooks de Stripe en el dashboard

## 📚 Recursos

- [WooCommerce REST API Documentation](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [WooCommerce Stripe Gateway](https://woocommerce.com/products/stripe/)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Elements](https://stripe.com/docs/stripe-js/react)

## ✅ Checklist de Implementación

- [ ] WooCommerce instalado y configurado
- [ ] WooCommerce Stripe Gateway instalado
- [ ] Variables de entorno configuradas
- [ ] Código descomentado en `useCheckout.ts`
- [ ] Código descomentado en `woocommerce-api.ts`
- [ ] Probado en modo Test
- [ ] Webhooks de Stripe configurados
- [ ] Probado con tarjetas de prueba
- [ ] Listo para producción
