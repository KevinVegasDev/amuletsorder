# Plan de Trabajo - Funcionalidades de Carrito y Favoritos

## 📋 Resumen Ejecutivo

Este plan cubre la implementación completa de:

- ✅ Sistema de carrito de compras
- ✅ Sistema de favoritos/wishlist
- ✅ Persistencia de datos en localStorage
- ✅ UI/UX para gestión de carrito y favoritos
- ✅ Integración con componentes existentes

---

## 🎯 Fase 1: Estructura Base y Context Providers

### 1.1 Crear tipos para Carrito y Favoritos

**Archivo:** `app/types/cart.ts`

- [ ] Definir interface `CartItem` (producto + cantidad + variantes si aplica)
- [ ] Definir interface `Cart` (items + total + subtotal)
- [ ] Definir interface `WishlistItem` (producto)
- [ ] Definir tipos para acciones del contexto

### 1.2 Crear Context Provider para Carrito

**Archivo:** `app/contexts/CartContext.tsx`

- [ ] Crear CartContext con React Context API
- [ ] Implementar estado del carrito (items, total, cantidad)
- [ ] Implementar funciones:
  - `addToCart(product, quantity?)`
  - `removeFromCart(productId)`
  - `updateQuantity(productId, quantity)`
  - `clearCart()`
  - `getCartTotal()`
  - `getCartItemCount()`
- [ ] Implementar persistencia en localStorage
- [ ] Sincronizar estado inicial desde localStorage

### 1.3 Crear Context Provider para Favoritos

**Archivo:** `app/contexts/WishlistContext.tsx`

- [ ] Crear WishlistContext con React Context API
- [ ] Implementar estado de favoritos (array de productos)
- [ ] Implementar funciones:
  - `addToWishlist(product)`
  - `removeFromWishlist(productId)`
  - `isInWishlist(productId)`
  - `toggleWishlist(product)`
  - `clearWishlist()`
- [ ] Implementar persistencia en localStorage
- [ ] Sincronizar estado inicial desde localStorage

### 1.4 Integrar Providers en Layout

**Archivo:** `app/layout.tsx`

- [ ] Envolver la aplicación con CartProvider
- [ ] Envolver la aplicación con WishlistProvider
- [ ] Asegurar que funcionen en modo SSR (Next.js)

---

## 🛒 Fase 2: Funcionalidad del Carrito

### 2.1 Actualizar ProductCard para agregar al carrito

**Archivo:** `app/components/ProductCard.tsx`

- [ ] Integrar CartContext
- [ ] **NOTA:** El botón visual puede no ser necesario si se agrega desde otra parte
- [ ] Implementar función para agregar producto al carrito (usar prop `onAddToCart` existente)
- [ ] Mostrar feedback visual al agregar (toast/notificación)
- [ ] Validar stock antes de agregar
- [ ] Manejar productos agotados (prevenir agregar si no hay stock)

### 2.2 Crear componente CartSidebar (Sidebar desde la derecha)

**Archivo:** `app/components/CartSidebar.tsx`

- [ ] Crear sidebar que se desliza desde la derecha (NO dropdown)
- [ ] Ancho: ~400px en desktop, 100% en móvil
- [ ] Overlay oscuro de fondo cuando está abierto
- [ ] Botón de cerrar (X) en la esquina superior
- [ ] Mostrar lista scrollable de items del carrito
- [ ] Mostrar imagen, nombre, precio y cantidad de cada item
- [ ] Botones para aumentar/disminuir cantidad
- [ ] Botón para eliminar item
- [ ] Footer fijo con subtotal y total
- [ ] Botón "Checkout" en el footer
- [ ] Estado vacío cuando no hay items (centrado)
- [ ] Animación slide-in desde la derecha
- [ ] Cerrar al hacer clic fuera (en el overlay)
- [ ] Cerrar con tecla ESC

### 2.3 Actualizar Header con funcionalidad de carrito

**Archivo:** `app/components/header.tsx`

- [ ] Convertir a "use client" (actualmente no lo es)
- [ ] Integrar CartContext
- [ ] Mostrar contador de items en el icono de carrito (badge)
- [ ] Integrar CartSidebar
- [ ] Manejar estado de apertura/cierre del sidebar
- [ ] Agregar onClick handler al icono de carrito
- [ ] Badge visible solo si count > 0

### 2.4 Crear página de Carrito (Opcional pero recomendado)

**Archivo:** `app/cart/page.tsx`

- [ ] Página completa del carrito
- [ ] Lista detallada de productos
- [ ] Controles de cantidad
- [ ] Cálculo de totales
- [ ] Botón de checkout
- [ ] Opción de continuar comprando
- [ ] Estado vacío con mensaje

---

## ❤️ Fase 3: Funcionalidad de Favoritos

### 3.1 Actualizar ProductCard para favoritos

**Archivo:** `app/components/ProductCard.tsx`

- [ ] Integrar WishlistContext
- [ ] Sincronizar estado de `isLiked` con WishlistContext
- [ ] Actualizar función `handleAddToWishlist` para usar contexto
- [ ] Mostrar estado correcto del corazón (lleno/vacío) según WishlistContext
- [ ] Al hacer clic en corazón: agregar/quitar de "guardados" (localStorage)
- [ ] Al cargar componente: verificar si producto está en favoritos y actualizar `isLiked`
- [ ] Persistencia en localStorage (se mantiene al hacer F5, se pierde al cerrar navegador)

### 3.2 Crear componente WishlistDropdown/Modal

**Archivo:** `app/components/WishlistDropdown.tsx` o `WishlistModal.tsx`

- [ ] Crear dropdown/modal que se abre al hacer clic en icono de favoritos del header
- [ ] Funciona como "Guardar" - productos guardados localmente
- [ ] Mostrar lista de productos guardados/favoritos
- [ ] Mostrar imagen y nombre de cada producto
- [ ] Botón para eliminar de favoritos (quitar de guardados)
- [ ] Botón "Agregar al carrito" desde favoritos
- [ ] **NO incluir** botón "Ver todos los favoritos" (no hay página)
- [ ] Estado vacío cuando no hay favoritos
- [ ] Animaciones de entrada/salida
- [ ] Persistencia en localStorage (se mantiene al hacer F5, se pierde al cerrar navegador)

### 3.3 Actualizar Header con funcionalidad de favoritos

**Archivo:** `app/components/header.tsx`

- [ ] Integrar WishlistContext
- [ ] Mostrar contador de favoritos guardados en el icono (badge)
- [ ] Integrar WishlistDropdown/Modal
- [ ] Manejar apertura/cierre del dropdown/modal
- [ ] Agregar onClick handler al icono de favoritos
- [ ] Badge visible solo si count > 0
- [ ] Funciona como "Guardar" - muestra productos guardados

### 3.4 NOTA: No se creará página de Wishlist

**Aclaración:**

- ❌ NO habrá página dedicada de favoritos
- ✅ Solo modal/dropdown desde el icono del header
- ✅ Funciona como "Guardar" - productos guardados localmente
- ✅ Persistencia en localStorage (se mantiene al hacer F5, se pierde al cerrar navegador)
- ✅ Similar al carrito pero para productos guardados/favoritos

---

## 🔄 Fase 4: Integración con Componentes Existentes

### 4.1 Actualizar CatalogLayout

**Archivo:** `app/components/CatalogLayout.tsx`

- [ ] Integrar CartContext y WishlistContext
- [ ] Reemplazar funciones placeholder con funciones reales
- [ ] Eliminar console.logs
- [ ] Pasar funciones correctas a ProductGrid

### 4.2 Actualizar HomeProductsSection

**Archivo:** `app/components/HomeProductsSection.tsx`

- [ ] Integrar CartContext y WishlistContext
- [ ] Reemplazar funciones placeholder con funciones reales
- [ ] Eliminar console.logs
- [ ] Pasar funciones correctas a ProductCard

### 4.3 Actualizar ProductGrid

**Archivo:** `app/components/ProductGrid.tsx`

- [ ] Verificar que pasa correctamente las props
- [ ] No requiere cambios si ya está bien estructurado

---

## 🎨 Fase 5: Mejoras de UI/UX

### 5.1 Crear componente de Notificaciones/Toast

**Archivo:** `app/components/Toast.tsx` o usar librería

- [ ] Sistema de notificaciones para acciones del usuario
- [ ] Mensajes de éxito al agregar al carrito
- [ ] Mensajes de éxito al agregar a favoritos
- [ ] Mensajes de error si algo falla
- [ ] Auto-dismiss después de unos segundos
- [ ] Animaciones suaves

### 5.2 Mejorar feedback visual

- [ ] Agregar animaciones al agregar productos
- [ ] Efectos de hover mejorados
- [ ] Estados de carga en botones
- [ ] Indicadores visuales de éxito/error

### 5.3 Responsive Design

- [ ] Asegurar que dropdowns funcionen en móvil
- [ ] Adaptar carrito y favoritos para pantallas pequeñas
- [ ] Menús móviles si es necesario

---

## 🧪 Fase 6: Testing y Validación

### 6.1 Validar funcionalidad del carrito

- [ ] Agregar productos al carrito
- [ ] Actualizar cantidades
- [ ] Eliminar productos
- [ ] Limpiar carrito
- [ ] Persistencia en localStorage
- [ ] Cálculo correcto de totales

### 6.2 Validar funcionalidad de favoritos

- [ ] Agregar productos a favoritos
- [ ] Eliminar de favoritos
- [ ] Estado sincronizado en todos los componentes
- [ ] Persistencia en localStorage

### 6.3 Validar integración

- [ ] Carrito funciona desde ProductCard
- [ ] Carrito funciona desde CatalogLayout
- [ ] Carrito funciona desde HomeProductsSection
- [ ] Favoritos funcionan desde todos los componentes
- [ ] Header muestra contadores correctos
- [ ] Dropdowns funcionan correctamente

### 6.4 Validar casos edge

- [ ] Productos agotados no se pueden agregar
- [ ] Manejo de errores
- [ ] Validación de datos
- [ ] Limpieza de datos inválidos

---

## 📦 Fase 7: Optimizaciones y Mejoras Finales

### 7.1 Optimización de rendimiento

- [ ] Memoización de componentes pesados
- [ ] Lazy loading de imágenes en dropdowns
- [ ] Optimización de re-renders

### 7.2 Accesibilidad

- [ ] ARIA labels en botones
- [ ] Navegación por teclado
- [ ] Screen reader support

### 7.3 Documentación

- [ ] Comentarios en código complejo
- [ ] README actualizado con nuevas funcionalidades

---

## 🚀 Orden de Implementación Recomendado

1. **Fase 1** - Estructura base (Context Providers)
2. **Fase 2** - Carrito completo
3. **Fase 3** - Favoritos completo
4. **Fase 4** - Integración
5. **Fase 5** - Mejoras UI/UX
6. **Fase 6** - Testing
7. **Fase 7** - Optimizaciones

---

## 📝 Notas Técnicas

### Tecnologías a usar:

- React Context API para estado global
- localStorage para persistencia
- TypeScript para type safety
- Tailwind CSS para estilos (ya en uso)

### Consideraciones:

- SSR de Next.js: Asegurar que localStorage solo se use en cliente
- Performance: Evitar re-renders innecesarios
- UX: Feedback inmediato al usuario
- Persistencia: localStorage (se mantiene al hacer F5, se pierde al cerrar navegador)
- **Favoritos/Wishlist:** Funciona como "Guardar" - NO hay página dedicada, solo modal/dropdown desde header
- **Carrito:** Sidebar desde la derecha (NO dropdown)

---

## ✅ Checklist Final

- [ ] Carrito funcional con todas las operaciones
- [ ] Favoritos funcional con todas las operaciones
- [ ] Persistencia en localStorage
- [ ] UI completa en header
- [ ] Integración con todos los componentes
- [ ] Responsive design
- [ ] Sin errores de consola
- [ ] Testing completo
- [ ] Documentación actualizada

---

**Fecha de creación:** $(date)
**Última actualización:** $(date)
