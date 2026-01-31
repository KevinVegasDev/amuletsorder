# Checkout 100% headless con Stripe Elements

## Objetivo
- **Sin redirección a WooCommerce**: el usuario no sale de amuletsorder.com.
- **Pago con componentes de Stripe** (Stripe Elements) en nuestra página, estilo Amulets Order.
- **Webhook Stripe → WooCommerce**: actualizar estado del pedido (pending → processing / completed) para no producir órdenes pendientes de pago.

## Flujo
1. Usuario completa envío en `/checkout`.
2. En "Review" hace clic en **Place order** → se crea el pedido en WooCommerce (estado `pending`).
3. Nuestro backend crea un **PaymentIntent** en Stripe y devuelve `client_secret`.
4. Se muestra el **formulario de pago de Stripe** (Elements) en la misma página.
5. Usuario introduce tarjeta y confirma → Stripe procesa el pago.
6. Si el pago es correcto: redirigimos a `/checkout/success?order_id=...` y vaciamos el carrito.
7. **Webhook** `payment_intent.succeeded`: nuestro backend actualiza el pedido en WooCommerce a `processing` (o `completed`).

## Cambios realizados
- Eliminada la lógica de redirección al checkout de WooCommerce (`payment_url`).
- Añadidos: `create-payment-intent`, webhook Stripe, componente de pago con Stripe Elements.
- Variables de entorno: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.

## Variables de entorno (.env.local)
```env
# Stripe (checkout headless)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Página de éxito: contacto (opcional)
NEXT_PUBLIC_WHATSAPP_NUMBER=+1234567890
NEXT_PUBLIC_CONTACT_EMAIL=support@amuletsorder.com
```

## Modo de prueba (test mode)
Para usar tarjetas de prueba **debes estar en modo de prueba** en Stripe:

1. **Claves de prueba**: Usa claves que empiecen por `pk_test_` y `sk_test_` (no `pk_live_` ni `sk_live_`). En [Stripe Dashboard](https://dashboard.stripe.com) activa el interruptor **“Test mode”** (arriba a la derecha) y copia las claves desde Developers → API keys.
2. **Tarjetas de prueba válidas** (solo funcionan con claves `_test_`):
   - **Pago correcto**: `4242 4242 4242 4242`
   - **Requiere autenticación (3D Secure)**: `4000 0025 0000 3155`
   - **Pago rechazado**: `4000 0000 0000 0002`
   - Cualquier fecha futura (MM/AA) y cualquier CVC de 3 dígitos.

Si ves *"El número de tu tarjeta no es válido"* con una tarjeta tipo 4444…, suele ser porque las claves en `.env.local` son de **modo live** o la tarjeta no es una de las [tarjetas de prueba de Stripe](https://docs.stripe.com/testing#cards).

## Webhook
- **URL**: `https://tu-dominio.com/api/webhooks/stripe`
- En Stripe Dashboard: Developers → Webhooks → Add endpoint.
- Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed` (opcional).
