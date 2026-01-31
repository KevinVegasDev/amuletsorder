# 📋 Plan de Trabajo: Conexión Checkout WooCommerce + Stripe

## 🎯 ACLARACIÓN IMPORTANTE: ¿Qué Checkout Vamos a Usar?

### ✅ **Checkout de Stripe (a través de WooCommerce)**

**NO usaremos:**
- ❌ Checkout personalizado de tu frontend (el que ya tienes)
- ❌ Checkout nativo de WooCommerce (el formulario de WordPress)

**SÍ usaremos:**
- ✅ **Stripe Checkout** (la página de pago de Stripe)
- ✅ WooCommerce solo crea el pedido y genera la URL de Stripe
- ✅ El usuario completa el pago en `checkout.stripe.com`

### 🔄 Flujo Completo:

```
1. Usuario en tu frontend (amuletsorder.com o localhost:3000)
   ↓
2. Agrega productos al carrito (localStorage - ya funciona)
   ↓
3. Click en "Finalizar Compra" o "Buy Now"
   ↓
4. Se crea el pedido en WooCommerce (headlessamulets.in) vía API
   ↓
5. WooCommerce devuelve payment_url de Stripe
   ↓
6. Usuario es REDIRIGIDO a checkout.stripe.com (página de Stripe)
   ↓
7. Usuario completa el pago en Stripe
   ↓
8. Stripe redirige de vuelta a tu sitio (success/cancel URL)
   ↓
9. Tu frontend muestra página de éxito
```

### 💡 ¿Por qué Stripe Checkout y no el checkout personalizado?

**Ventajas:**
- ✅ **Seguridad**: Stripe maneja todos los datos de tarjeta (PCI compliant)
- ✅ **Menos código**: No necesitas manejar formularios de pago
- ✅ **Menos mantenimiento**: Stripe se encarga de actualizaciones
- ✅ **Más confiable**: Stripe es una marca reconocida y confiable
- ✅ **Ya está configurado**: Stripe ya está conectado en WooCommerce

**Desventaja:**
- ⚠️ El usuario "sale" de tu dominio (pero es seguro y profesional)

---

## 📝 Variables de Entorno: ¿Qué Necesitas?

### ✅ **YA TIENES TODO LO NECESARIO**

Revisando tu `.env.local`, ya tienes:
- ✅ `WORDPRESS_CONSUMER_KEY` 
- ✅ `WORDPRESS_CONSUMER_SECRET`
- ✅ `NEXT_PUBLIC_WORDPRESS_API_URL`

### ❌ **NO necesitas variables adicionales de Stripe**

**¿Por qué?**
- Las claves de Stripe están configuradas en WooCommerce (no en tu frontend)
- Tu frontend solo necesita hablar con WooCommerce
- WooCommerce se encarga de hablar con Stripe

### 🔧 Actualizar `.env.local` para localhost

Agrega estas variables para que funcione con localhost:

```env
# Variables de entorno para la API de WordPress
NEXT_PUBLIC_WORDPRESS_API_URL=https://headlessamulets.in/wp-json/wc/v3
WORDPRESS_CONSUMER_KEY=ck_3920833f95e5844e5c4d20769130937acd85a7ca
WORDPRESS_CONSUMER_SECRET=cs_78bf6b61b0ac11f7171f085a85f533473dd4f75f

# URL base para el entorno de desarrollo
NEXTAUTH_URL=http://localhost:3000

# URLs de Redirección (para después del pago)
# IMPORTANTE: Usar localhost para desarrollo
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CHECKOUT_SUCCESS_URL=http://localhost:3000/checkout/success
NEXT_PUBLIC_CHECKOUT_CANCEL_URL=http://localhost:3000/checkout
```

**Nota**: Cuando vayas a producción, cambia las URLs a `https://amuletsorder.com`

---

## 🚀 Plan de Trabajo Paso a Paso

### **FASE 1: Preparación** (5 minutos)

#### ✅ Paso 1.1: Actualizar `.env.local`
- [ ] Agregar variables de URLs para localhost (ya están arriba)
- [ ] Verificar que las credenciales de WooCommerce estén correctas

#### ✅ Paso 1.2: Verificar Stripe en WooCommerce
- [ ] Ir a WordPress: `https://headlessamulets.in/wp-admin`
- [ ] Navegar a: **WooCommerce → Settings → Payments → Stripe**
- [ ] Verificar que Stripe esté activo y en modo prueba
- [ ] Configurar URLs de redirección:
  - **Success URL**: `http://localhost:3000/checkout/success?order_id={order_id}`
  - **Cancel URL**: `http://localhost:3000/checkout?canceled=true`

---

### **FASE 2: Crear Endpoint de API** (15 minutos)

#### ✅ Paso 2.1: Crear `app/api/checkout/create-order/route.ts`
Este endpoint:
- Recibe el carrito y datos del formulario
- Crea el pedido en WooCommerce
- Devuelve la URL de pago de Stripe

**Archivo a crear**: `app/api/checkout/create-order/route.ts`

---

### **FASE 3: Actualizar Funciones de WooCommerce** (10 minutos)

#### ✅ Paso 3.1: Actualizar `app/lib/woocommerce-api.ts`
- [ ] Descomentar y actualizar `createWooCommerceOrder()`
- [ ] Hacer que llame al endpoint de API que creamos

---

### **FASE 4: Actualizar Hook de Checkout** (15 minutos)

#### ✅ Paso 4.1: Actualizar `app/market/hooks/useCheckout.ts`
- [ ] Reemplazar el código simulado en `handleSubmit()`
- [ ] Conectar con la función real de WooCommerce
- [ ] Manejar la redirección a Stripe

**Cambios principales:**
- Eliminar el código de simulación
- Llamar a `createWooCommerceOrder()`
- Si hay `payment_url`, redirigir a Stripe
- Si no hay `payment_url`, mostrar error

---

### **FASE 5: Crear Página de Éxito** (10 minutos)

#### ✅ Paso 5.1: Crear `app/checkout/success/page.tsx`
- [ ] Página que muestra confirmación del pedido
- [ ] Obtener `order_id` de la URL
- [ ] Verificar el pedido en WooCommerce
- [ ] Mostrar información del pedido

#### ✅ Paso 5.2: Crear `app/api/checkout/verify-order/route.ts`
- [ ] Endpoint para verificar el estado del pedido
- [ ] Consultar WooCommerce API
- [ ] Devolver información del pedido

---

### **FASE 6: Simplificar Checkout Actual** (10 minutos)

#### ✅ Paso 6.1: Actualizar `app/checkout/CheckoutClient.tsx`
**Opciones:**

**Opción A (Recomendada)**: Simplificar el checkout
- Solo pedir dirección de envío
- Eliminar formulario de pago (no es necesario)
- Botón "Finalizar Compra" que crea el pedido y redirige a Stripe

**Opción B**: Mantener el checkout actual pero sin procesar pago
- Mantener todos los pasos
- Al final, redirigir a Stripe (no procesar pago en el frontend)

**Recomendación**: Opción A (más simple y directo)

---

### **FASE 7: Probar Todo** (15 minutos)

#### ✅ Paso 7.1: Probar "Add to Cart" → Checkout
1. Agregar producto al carrito
2. Ir a `/checkout`
3. Completar formulario de envío
4. Click en "Finalizar Compra"
5. Verificar que redirige a Stripe
6. Completar pago con tarjeta de prueba
7. Verificar que redirige a `/checkout/success`

#### ✅ Paso 7.2: Probar "Buy Now"
1. Click en "Buy Now" en un producto
2. Debería agregar al carrito y redirigir a `/checkout`
3. Seguir el mismo flujo que arriba

#### ✅ Paso 7.3: Verificar en WooCommerce
1. Ir a WordPress Admin
2. **WooCommerce → Orders**
3. Verificar que el pedido se creó correctamente
4. Verificar que el estado es "Processing" o "Completed"

---

## 📂 Archivos que Vamos a Crear/Modificar

### ✅ **Nuevos archivos:**
1. `app/api/checkout/create-order/route.ts` - Crear pedido en WooCommerce
2. `app/api/checkout/verify-order/route.ts` - Verificar pedido
3. `app/checkout/success/page.tsx` - Página de éxito

### ✅ **Archivos a modificar:**
1. `.env.local` - Agregar URLs de localhost
2. `app/lib/woocommerce-api.ts` - Implementar función real
3. `app/market/hooks/useCheckout.ts` - Conectar con WooCommerce
4. `app/checkout/CheckoutClient.tsx` - Simplificar (opcional)

---

## 🎯 Resumen del Flujo Técnico

### **Cuando el usuario hace click en "Finalizar Compra":**

```typescript
// 1. useCheckout.ts → handleSubmit()
const order = await createWooCommerceOrder(formData, cart.items, totals);

// 2. woocommerce-api.ts → createWooCommerceOrder()
const response = await fetch("/api/checkout/create-order", {
  method: "POST",
  body: JSON.stringify({ cartItems, formData, totals })
});

// 3. app/api/checkout/create-order/route.ts
// Crea pedido en WooCommerce vía API REST
const response = await fetch(`${WOOCOMMERCE_URL}/orders`, {
  method: "POST",
  headers: { Authorization: "Basic ..." },
  body: JSON.stringify(orderData)
});

// 4. WooCommerce devuelve el pedido con payment_url
return { order_id, payment_url: "https://checkout.stripe.com/..." };

// 5. useCheckout.ts recibe payment_url
if (order.payment_url) {
  window.location.href = order.payment_url; // Redirige a Stripe
}

// 6. Usuario completa pago en Stripe
// 7. Stripe redirige a: http://localhost:3000/checkout/success?order_id=123

// 8. success/page.tsx verifica el pedido
const order = await fetch(`/api/checkout/verify-order?order_id=${orderId}`);
```

---

## ⚠️ Puntos Importantes

### 1. **No necesitas variables de Stripe en el frontend**
- Las claves de Stripe están en WooCommerce
- Tu frontend solo habla con WooCommerce
- WooCommerce habla con Stripe

### 2. **El checkout personalizado se simplifica**
- Ya no necesitas procesar el pago en el frontend
- Solo necesitas recopilar dirección de envío
- El pago se hace en Stripe

### 3. **Funciona con localhost**
- Las URLs de redirección pueden ser `http://localhost:3000`
- Stripe puede redirigir a localhost sin problemas
- Solo asegúrate de configurar las URLs en WooCommerce Stripe

### 4. **Buy Now y Add to Cart funcionan igual**
- Ambos agregan al carrito
- Ambos redirigen a `/checkout`
- El flujo de pago es el mismo

---

## ✅ Checklist Final

Antes de empezar, verifica:

- [ ] WooCommerce está instalado y funcionando
- [ ] Stripe Gateway está activo en WooCommerce
- [ ] Stripe está en modo prueba
- [ ] Tienes las credenciales de WooCommerce API
- [ ] Tu `.env.local` tiene las variables correctas
- [ ] Tu servidor Next.js puede hacer llamadas a `headlessamulets.in`

---

## 🚀 ¿Empezamos?

**Orden sugerido de implementación:**

1. ✅ Actualizar `.env.local` (2 min)
2. ✅ Crear endpoint `/api/checkout/create-order` (15 min)
3. ✅ Actualizar `woocommerce-api.ts` (10 min)
4. ✅ Actualizar `useCheckout.ts` (15 min)
5. ✅ Crear página de éxito (10 min)
6. ✅ Probar todo (15 min)

**Tiempo total estimado: ~1 hora**

---

¿Quieres que empecemos con el Paso 1? ¡Dime y comenzamos a implementar! 🚀
