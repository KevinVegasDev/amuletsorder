# Sistema de Detección y Manejo de Variaciones de Productos

## ¿Cómo funciona la detección de variantes?

### 1. **Detección Automática desde WordPress**

El sistema detecta automáticamente si un producto tiene variaciones de la siguiente manera:

```typescript
// En app/lib/wordpress-api.ts - getProductBySlug()
if (wpProduct.type === "variable" && wpProduct.variations.length > 0) {
  variations = await getProductVariations(wpProduct.id);
}
```

**Criterios de detección:**
- El producto debe tener `type: "variable"` en WordPress
- Debe tener al menos una variación en el array `variations` (IDs de variaciones)
- Si cumple estos criterios, se hace un fetch a `/products/{id}/variations` para obtener todas las variaciones

### 2. **Obtención de Atributos**

Los atributos (Talla, Color, etc.) se obtienen del producto base:

```typescript
// En transformWordPressProduct()
const attributes: ProductAttribute[] | undefined = wpProduct.attributes
  ?.filter((attr) => attr.variation)  // Solo atributos que se usan para variaciones
  .map((attr) => ({
    id: attr.id,
    name: attr.name,        // Ej: "Talla", "Color"
    options: attr.options,  // Ej: ["S", "M", "X", "XL", "XLL"]
    variation: attr.variation,
    position: attr.position,
  }));
```

**Nota importante:** Solo se incluyen atributos donde `variation: true`, es decir, atributos que se usan para crear variaciones.

### 3. **Detección de Tipo de Atributo (Talla vs Color)**

El componente `ProductDetails` detecta automáticamente si un atributo es de tipo "Color" para renderizarlo como círculos de color:

```typescript
const isColorAttribute =
  attribute.name.toLowerCase() === "color" ||
  attribute.name.toLowerCase() === "colour";
```

**Atributos de Color:**
- Se renderizan como círculos con el color correspondiente
- Se usa la función `getColorHex()` para convertir nombres de colores a códigos hex

**Otros Atributos (Talla, etc.):**
- Se renderizan como botones rectangulares con texto

### 4. **Matching de Variación Seleccionada**

Cuando el usuario selecciona atributos (ej: Talla: "M", Color: "Black"), el sistema busca la variación correspondiente:

```typescript
const selectedVariation = useMemo(() => {
  if (!product.variations || product.variations.length === 0) {
    return null;
  }

  return product.variations.find((variation) => {
    return Object.keys(selectedAttributes).every(
      (attrName) =>
        variation.attributes[attrName] === selectedAttributes[attrName]
    );
  });
}, [product.variations, selectedAttributes]);
```

**Proceso:**
1. Se comparan todos los atributos seleccionados con cada variación
2. Se encuentra la variación donde todos los atributos coinciden
3. Si se encuentra, se usa el precio, stock y SKU de esa variación
4. Si no se encuentra, se usa el precio y stock del producto base

### 5. **Flujo Completo**

```
1. Usuario entra a página de producto
   ↓
2. getProductBySlug() obtiene el producto
   ↓
3. Si type === "variable" → Obtiene variaciones
   ↓
4. Transforma atributos (solo los que tienen variation: true)
   ↓
5. ProductDetails renderiza atributos dinámicamente
   ↓
6. Usuario selecciona atributos (Talla: "M", Color: "Black")
   ↓
7. Sistema busca variación que coincida
   ↓
8. Actualiza precio, stock y disponibilidad según variación
   ↓
9. Al agregar al carrito, se usa la variación seleccionada
```

## Ejemplo Práctico

### Producto en WordPress:
```json
{
  "id": 123,
  "type": "variable",
  "attributes": [
    {
      "id": 1,
      "name": "Talla",
      "variation": true,
      "options": ["S", "M", "X", "XL", "XLL"]
    },
    {
      "id": 2,
      "name": "Color",
      "variation": true,
      "options": ["Black", "Red", "Purple"]
    }
  ],
  "variations": [456, 457, 458, ...]  // IDs de variaciones
}
```

### Variaciones obtenidas:
```json
[
  {
    "id": 456,
    "price": "25.00",
    "attributes": {
      "Talla": "M",
      "Color": "Black"
    },
    "stock_status": "instock"
  },
  {
    "id": 457,
    "price": "25.00",
    "attributes": {
      "Talla": "M",
      "Color": "Red"
    },
    "stock_status": "outofstock"
  },
  ...
]
```

### En el Frontend:
- Se muestran botones para Talla: S, M, X, XL, XLL
- Se muestran círculos de color para: Black, Red, Purple
- Al seleccionar "M" + "Black" → encuentra variación 456
- Precio y stock se actualizan según variación 456

## Fallback para Productos Simples

Si el producto NO tiene atributos o variaciones:
- Se muestran opciones estáticas (S, M, X, XL, XLL y colores básicos)
- Se usa el precio y stock del producto base
- Funciona como un producto simple


