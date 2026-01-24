# Personalización de Categorías desde WordPress

## 📋 Cómo funciona la Navegación de Categorías

La navegación estilo "Stories" en el Market ahora usa las **categorías de productos de WooCommerce** en lugar de posts de colección.

### 🔍 De dónde se extraen las categorías

Las categorías se obtienen directamente de **WooCommerce → Productos → Categorías** en tu WordPress.

### 🖼️ Cómo se obtienen las imágenes

Las imágenes de las categorías se generan automáticamente tomando la **primera imagen del primer producto** de cada categoría. El sistema mejora automáticamente la calidad de las imágenes removiendo dimensiones pequeñas de la URL.

## 🎨 Cómo personalizar desde WordPress

### 1. Crear/Editar Categorías

1. Ve a **WooCommerce → Productos → Categorías** en tu WordPress
2. Crea una nueva categoría o edita una existente
3. Configura:
   - **Nombre**: Aparecerá en la navegación
   - **Slug**: Se usa para las URLs (ej: `/market?category=nombre-categoria`)
   - **Descripción**: Opcional, se puede usar para SEO

### 2. Asignar Productos a Categorías

Para que una categoría aparezca en la navegación y tenga imagen:

1. Ve a **WooCommerce → Productos**
2. Edita un producto
3. En la sección **Categorías del producto**, selecciona la categoría deseada
4. **Importante**: Asegúrate de que el producto tenga al menos una imagen
5. Guarda el producto

### 3. Controlar qué Categorías Aparecen

El sistema automáticamente:
- ✅ Muestra solo categorías que tienen productos (`count > 0`)
- ✅ Excluye categorías con slug "uncategorized" y "all"
- ✅ Ordena las categorías según el orden en WordPress

### 4. Personalizar la Imagen de una Categoría

**Método actual**: La imagen se toma del primer producto de la categoría.

Para cambiar la imagen de una categoría:
1. Asegúrate de que el **primer producto** de esa categoría tenga la imagen que quieres
2. O reorganiza los productos para que el producto con la imagen deseada sea el primero

**Nota**: En el futuro, WooCommerce permite agregar imágenes directamente a las categorías, pero esto requiere configuración adicional.

## 🔧 Configuración Técnica

### Archivos relevantes:

- `app/components/CollectionStoriesNavigation.tsx` - Componente de navegación
- `app/market/page.tsx` - Página del Market que carga las categorías
- `app/lib/product-helpers.ts` - Función `getCategoryImages()` que obtiene las imágenes
- `app/lib/wordpress-api.ts` - Función `getProductCategories()` que obtiene las categorías

### Mejoras de calidad de imagen:

El sistema automáticamente mejora la calidad de las imágenes:
- Remueve dimensiones pequeñas de la URL (ej: `-150x150`, `-300x300`)
- Usa `quality={95}` en el componente Image de Next.js
- Optimiza el tamaño según el dispositivo (`sizes` attribute)

## 📝 Ejemplo de Flujo

1. **En WordPress**:
   - Creas categoría "Streetwear"
   - Agregas productos a esa categoría
   - El primer producto tiene una imagen de alta calidad

2. **En el Frontend**:
   - La categoría aparece automáticamente en la navegación
   - La imagen del primer producto se usa como imagen de la categoría
   - Al hacer clic, filtra los productos de esa categoría

## 🚀 Próximas Mejoras Posibles

- [ ] Agregar soporte para imágenes de categoría personalizadas desde WordPress
- [ ] Permitir ordenar categorías manualmente
- [ ] Agregar descripciones cortas a las categorías en la navegación
- [ ] Cachear imágenes de categorías para mejor rendimiento
