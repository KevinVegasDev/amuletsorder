# 📊 Análisis Completo de Componentes - Carrito y Favoritos

## 📋 Resumen Ejecutivo

Este documento contiene un análisis detallado de todos los componentes relacionados con las funcionalidades de **Carrito de Compras** y **Favoritos/Wishlist**, incluyendo estado actual, funcionalidades existentes, elementos visuales, y lo que falta implementar.

---

## 🎯 Componentes Analizados

1. **ProductCard.tsx** - Tarjeta de producto individual
2. **Header.tsx** - Encabezado con iconos de carrito y favoritos
3. **CatalogLayout.tsx** - Layout del catálogo de productos
4. **HomeProductsSection.tsx** - Sección de productos en home
5. **ProductGrid.tsx** - Grid contenedor de productos
6. **CategorySection.tsx** - Sección por categorías
7. **Iconos** - CartIcon, HeartIcon, HeartHeaderIcon

---

## 1️⃣ ProductCard.tsx

### ✅ Estado Actual - Funcional

**Props disponibles:**
```typescript
interface ProductCardProps {
  product: Product;
  className?: string;
  onAddToCart?: (product: Product) => void;  // ⚠️ Prop definida pero no usada
  onAddToWishlist?: (product: Product) => void;  // ✅ Prop definida y usada
}
```

**Funcionalidades implementadas:**
- ✅ Estado local `isLiked` para controlar el corazón
- ✅ Función `handleAddToWishlist` que llama a `onAddToWishlist`
- ✅ Botón de corazón visualmente implementado
- ✅ Efecto hover en el corazón (`isHeartHovered`)
- ✅ Prevención de propagación de eventos (evita navegación al hacer clic en corazón)
- ✅ Manejo de imágenes (primaria y secundaria en hover)
- ✅ Badge "SOLD OUT" para productos sin stock
- ✅ Formateo de precios

**Funcionalidades faltantes:**
- ❌ **NO hay botón "Agregar al carrito"** - La prop `onAddToCart` existe pero no se usa
- ❌ Estado `isLiked` es local, no se sincroniza con contexto global
- ❌ No valida si el producto ya está en favoritos al cargar
- ❌ No hay feedback visual al agregar a favoritos (toast/notificación)
- ❌ No valida stock antes de permitir agregar a favoritos

### 🎨 Estado Actual - Visual

**Elementos visuales presentes:**
- ✅ Botón de corazón en posición `bottom-2 right-2` (esquina inferior derecha)
- ✅ Corazón cambia de estado (lleno/vacío) según `isLiked` o `isHeartHovered`
- ✅ Usa `HeartIcon` con props `color` y `filled`
- ✅ Transiciones suaves en hover (`hover:scale-[1.01]`)
- ✅ Badge "SOLD OUT" con estilo blanco y sombra
- ✅ Layout responsive con aspect ratio `aspect-[3/4]`

**Elementos visuales faltantes:**
- ❌ Botón "Agregar al carrito" (no existe visualmente)
- ❌ Indicador visual cuando se agrega a favoritos
- ❌ Contador de cantidad si el producto está en el carrito
- ❌ Overlay de "Agregado" o similar

### 🔧 Problemas Identificados

1. **Estado local vs global:**
   - `isLiked` es estado local, se pierde al recargar
   - No se sincroniza con un contexto global de favoritos

2. **Props no utilizadas:**
   - `onAddToCart` está definida pero nunca se llama

3. **Falta validación:**
   - No verifica si el producto ya está en favoritos al montar
   - No valida stock antes de acciones

---

## 2️⃣ Header.tsx

### ✅ Estado Actual - Funcional

**Componente:**
- Componente funcional simple (no es "use client")
- Renderiza iconos estáticos sin funcionalidad

**Iconos presentes:**
- ✅ `CartIcon` - Icono de carrito
- ✅ `HeartHeaderIcon` - Icono de favoritos
- ✅ `PersonIcon` - Icono de usuario

**Funcionalidades faltantes:**
- ❌ **NO hay onClick handlers** en los iconos
- ❌ **NO hay contador** de items en el carrito
- ❌ **NO hay contador** de favoritos
- ❌ **NO abre modales/dropdowns** al hacer clic
- ❌ **NO hay estado** para controlar apertura/cierre
- ❌ **NO hay integración** con contextos

### 🎨 Estado Actual - Visual

**Estilos aplicados:**
- ✅ Hover effect: `hover:text-[var(--color-hovered)]`
- ✅ Transiciones: `transition-colors duration-200`
- ✅ Cursor pointer en los contenedores
- ✅ Layout flex con gap-4
- ✅ Padding horizontal: `px-[50px]`

**Elementos visuales faltantes:**
- ❌ Badge/contador sobre el icono de carrito
- ❌ Badge/contador sobre el icono de favoritos
- ❌ Indicador visual de estado activo
- ❌ Modal/drawer para carrito (debe ser sidebar desde la derecha)
- ❌ Modal/dropdown para favoritos

### 🔧 Problemas Identificados

1. **No es "use client":**
   - Necesita ser cliente para manejar estado y eventos

2. **Sin funcionalidad:**
   - Los iconos son decorativos, no interactivos

3. **Falta estructura para modales:**
   - No hay componentes de modal/drawer
   - No hay estado para controlar visibilidad

---

## 3️⃣ CatalogLayout.tsx

### ✅ Estado Actual - Funcional

**Funciones placeholder:**
```typescript
const handleAddToCart = (product: Product) => {
  // TODO: Implementar lógica del carrito
  console.log("Agregar al carrito:", product);
};

const handleAddToWishlist = (product: Product) => {
  // TODO: Implementar lógica de favoritos
  console.log("Agregar a favoritos:", product);
};
```

**Funcionalidades implementadas:**
- ✅ Pasa `handleAddToCart` a `ProductGrid`
- ✅ Pasa `handleAddToWishlist` a `ProductGrid`
- ✅ Manejo de filtros y paginación completo
- ✅ Carga de productos desde API

**Funcionalidades faltantes:**
- ❌ Funciones solo hacen `console.log`
- ❌ No hay integración con contextos
- ❌ No hay validaciones
- ❌ No hay feedback al usuario

### 🎨 Estado Actual - Visual

- ✅ Layout completo con sidebar de filtros
- ✅ Grid de productos responsive
- ✅ Paginación funcional
- ✅ Estados de carga y error

**No requiere cambios visuales** - Solo funcionalidad

---

## 4️⃣ HomeProductsSection.tsx

### ✅ Estado Actual - Funcional

**Funciones placeholder (idénticas a CatalogLayout):**
```typescript
const handleAddToCart = (product: Product) => {
  console.log("Agregar al carrito:", product);
  // Aquí puedes agregar la lógica para agregar al carrito
};

const handleAddToWishlist = (product: Product) => {
  console.log("Agregar a favoritos:", product);
  // Aquí puedes agregar la lógica para agregar a favoritos
};
```

**Funcionalidades implementadas:**
- ✅ Pasa funciones a `CategorySection` y `ProductCard`
- ✅ Carga productos y categorías
- ✅ Agrupa productos por categoría

**Funcionalidades faltantes:**
- ❌ Mismas que CatalogLayout - solo console.log

### 🎨 Estado Actual - Visual

- ✅ Secciones por categoría
- ✅ Grid responsive
- ✅ Enlaces "View all"

**No requiere cambios visuales** - Solo funcionalidad

---

## 5️⃣ ProductGrid.tsx

### ✅ Estado Actual - Funcional

**Componente:**
- ✅ Recibe props `onAddToCart` y `onAddToWishlist`
- ✅ Pasa props correctamente a cada `ProductCard`
- ✅ Grid responsive bien implementado

**Estado:** ✅ **COMPLETO** - No requiere cambios, solo pasa props

### 🎨 Estado Actual - Visual

- ✅ Grid responsive: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`
- ✅ Gap consistente: `gap-8`
- ✅ Transiciones suaves

**Estado:** ✅ **COMPLETO**

---

## 6️⃣ CategorySection.tsx

### ✅ Estado Actual - Funcional

**Componente:**
- ✅ Recibe props `onAddToCart` y `onAddToWishlist`
- ✅ Pasa props correctamente a `ProductCard`
- ✅ Muestra máximo 4 productos por categoría

**Estado:** ✅ **COMPLETO** - No requiere cambios, solo pasa props

---

## 7️⃣ Iconos

### CartIcon.tsx
- ✅ SVG bien estructurado
- ✅ Props: `color` (string)
- ✅ Tamaño: 24x24
- ✅ **Falta:** Soporte para badge/contador visual

### HeartIcon.tsx
- ✅ SVG bien estructurado
- ✅ Props: `color` (string), `filled` (boolean)
- ✅ Tamaño: 25x22
- ✅ Soporta estado lleno/vacío
- ✅ **Estado:** ✅ **COMPLETO**

### HeartHeaderIcon.tsx
- ✅ SVG bien estructurado
- ✅ Props: `fill` (string), `width`, `height`, `className`
- ✅ Tamaño por defecto: 25x21
- ✅ **Estado:** ✅ **COMPLETO**

---

## 📊 Resumen de Estado por Componente

| Componente | Funcionalidad | Visual | Estado General |
|------------|---------------|--------|----------------|
| **ProductCard** | ⚠️ Parcial (solo favoritos) | ✅ Completo | ⚠️ Necesita carrito + contexto |
| **Header** | ❌ Sin funcionalidad | ⚠️ Sin contadores | ❌ Necesita implementación completa |
| **CatalogLayout** | ⚠️ Placeholders | ✅ Completo | ⚠️ Necesita contextos |
| **HomeProductsSection** | ⚠️ Placeholders | ✅ Completo | ⚠️ Necesita contextos |
| **ProductGrid** | ✅ Completo | ✅ Completo | ✅ **LISTO** |
| **CategorySection** | ✅ Completo | ✅ Completo | ✅ **LISTO** |
| **Iconos** | ✅ Completo | ✅ Completo | ✅ **LISTO** |

---

## 🎯 Lo que FALTA Implementar

### 🔴 Crítico (Debe implementarse)

1. **Context Providers:**
   - `CartContext` - Estado global del carrito
   - `WishlistContext` - Estado global de favoritos
   - Persistencia en localStorage

2. **Componente CartSidebar (NO dropdown):**
   - Sidebar que se desliza desde la derecha
   - Lista de items del carrito
   - Controles de cantidad
   - Cálculo de totales
   - Botón de checkout

3. **Componente WishlistModal/Dropdown:**
   - Modal o dropdown para favoritos
   - Lista de productos favoritos
   - Opción de agregar al carrito desde favoritos

4. **Integración en Header:**
   - Convertir a "use client"
   - Agregar onClick handlers
   - Mostrar contadores
   - Abrir modales/sidebars

5. **Integración en ProductCard:**
   - Sincronizar `isLiked` con WishlistContext
   - Agregar botón "Agregar al carrito" (si es necesario)
   - Validar estado de favoritos al montar

6. **Actualizar funciones placeholder:**
   - Reemplazar console.logs con funciones reales
   - Integrar con contextos

### 🟡 Importante (Mejoras)

1. **Sistema de notificaciones:**
   - Toast para feedback al agregar productos
   - Mensajes de éxito/error

2. **Validaciones:**
   - Verificar stock antes de agregar
   - Prevenir duplicados
   - Validar datos

3. **Optimizaciones:**
   - Memoización de componentes
   - Evitar re-renders innecesarios

---

## 🎨 Especificaciones Visuales Necesarias

### CartSidebar (desde la derecha)
- Ancho: ~400px en desktop, 100% en móvil
- Animación: slide-in desde la derecha
- Overlay oscuro de fondo
- Botón de cerrar (X)
- Lista scrollable de items
- Footer fijo con totales y botón checkout

### WishlistModal/Dropdown
- Modal centrado o dropdown desde el icono
- Grid de productos favoritos
- Botones de acción (eliminar, agregar al carrito)

### Contadores en Header
- Badge pequeño sobre el icono
- Color destacado (ej: rojo/rosa)
- Número centrado
- Visible solo si count > 0

---

## 🔄 Flujo de Datos Actual vs Necesario

### Actual (Roto):
```
ProductCard → onAddToWishlist prop → console.log
Header → Iconos estáticos → Sin funcionalidad
```

### Necesario:
```
ProductCard → WishlistContext → localStorage → Header (contador)
ProductCard → CartContext → localStorage → Header (contador + sidebar)
Header → onClick → Abrir CartSidebar/WishlistModal
```

---

## ✅ Checklist de Implementación

### Fase 1: Contextos
- [ ] Crear `app/types/cart.ts` con tipos
- [ ] Crear `app/contexts/CartContext.tsx`
- [ ] Crear `app/contexts/WishlistContext.tsx`
- [ ] Integrar providers en `app/layout.tsx`

### Fase 2: Carrito
- [ ] Crear `app/components/CartSidebar.tsx` (sidebar desde derecha)
- [ ] Actualizar `Header.tsx` (onClick + contador)
- [ ] Integrar CartContext en componentes que usan `onAddToCart`

### Fase 3: Favoritos
- [ ] Crear `app/components/WishlistModal.tsx` o `WishlistDropdown.tsx`
- [ ] Actualizar `Header.tsx` (onClick + contador)
- [ ] Actualizar `ProductCard.tsx` (sincronizar con WishlistContext)

### Fase 4: Integración
- [ ] Actualizar `CatalogLayout.tsx` (usar contextos)
- [ ] Actualizar `HomeProductsSection.tsx` (usar contextos)
- [ ] Eliminar funciones placeholder

### Fase 5: Mejoras
- [ ] Sistema de notificaciones (Toast)
- [ ] Validaciones
- [ ] Testing

---

## 📝 Notas Técnicas

### Consideraciones SSR (Next.js)
- Los contextos deben manejar hidratación correctamente
- localStorage solo disponible en cliente
- Usar `useEffect` para sincronizar estado inicial

### Estructura de Datos

**CartItem:**
```typescript
{
  product: Product;
  quantity: number;
  // Opcional: variantes, tallas, etc.
}
```

**WishlistItem:**
```typescript
{
  product: Product;
  addedAt: Date;
}
```

### localStorage Keys
- `"amulets_cart"` - Para el carrito
- `"amulets_wishlist"` - Para favoritos

---

**Fecha de análisis:** $(date)
**Última actualización:** $(date)

