# Checklist: etiquetas y contenido para el Home (WordPress reinstalado)

Después de reinstalar WordPress/WooCommerce, crea lo siguiente para que el home y los componentes se vean correctamente. El proyecto usa **slugs exactos**; el nombre visible puede variar.

---

## 1. Etiquetas de producto (WooCommerce) — Tags

Son las que usa el frontend para decidir qué productos mostrar en cada sección. **Créalas en: WooCommerce → Productos → Etiquetas.**

| Slug exacto     | Uso en el proyecto                                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **home**        | Productos que salen en **“Shop by category”** (Home). Solo las categorías que tengan al menos un producto con tag `home` se muestran. También define qué productos se cargan para el home. |
| **recomendado** | Productos de la sección **“Recommended”** (RecommendedSection). Si no existe el tag, se usan productos **destacados**.                                                                     |
| **trending**    | Productos de la sección **“Trending”** (hasta 3). Si no existe el tag, se usan productos **destacados**.                                                                                   |

**Pasos:**

1. WooCommerce → Productos → Etiquetas.
2. Crear 3 etiquetas con **slug** exacto:
   - `home` (nombre ej.: "Home" o "Inicio").
   - `recomendado` (nombre ej.: "Recomendado").
   - `trending` (nombre ej.: "Trending").
3. Asignar a los productos que quieras que aparezcan en cada sección.

**Nota:** Si no hay productos con tag `home`, el home usa productos **destacados** (Featured). Lo mismo para recomendados y trending.

---

## 2. Productos destacados (WooCommerce)

No es una etiqueta; es la opción **“Destacado”** del producto.

- Se usan como **fallback** cuando no hay productos con tag `home`, `recomendado` o `trending`.
- En el catálogo (/market) el filtro “Featured” también usa este campo.

**Pasos:** En cada producto, en el panel derecho, marcar **“Destacado”** (Featured product).

---

## 3. Categorías de entradas (WordPress) — Para Banner y Colecciones

Son categorías de **posts** (entradas), no de productos. **Créalas en: Entradas → Categorías.**

| Slug exacto   | Uso en el proyecto                                                                                                                                               |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Banner**    | Posts cuyas **imagen destacada** se usan para el **Hero** (y en teoría para un slider). El código toma la primera imagen del primer post con categoría `Banner`. |
| **coleccion** | Posts que se muestran en **CollectionSection** (bloques grandes “Shop now”). Se usan los **2 primeros** posts de esta categoría.                                 |

**Pasos:**

1. Entradas → Categorías.
2. Crear:
   - Categoría con slug **`Banner`** (nombre ej.: "Banner").
   - Categoría con slug **`coleccion`** (nombre ej.: "Colección").
3. Crear al menos:
   - **1 post** en categoría **Banner** (para el Hero). Asignar **Imagen destacada**.
   - **2 posts** en categoría **coleccion** (para la sección de colecciones). Asignar **Imagen destacada** a cada uno.

---

## 4. Imágenes que debes tener

| Dónde                | Origen                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| **Hero (home)**      | Imagen destacada del **primer post** con categoría **Banner**.                                   |
| **Colecciones**      | Imagen destacada de cada **post** con categoría **coleccion** (2 posts).                         |
| **Shop by category** | Primera imagen del **primer producto** (con tag `home`) de cada categoría. Viene de WooCommerce. |
| **Productos**        | Imágenes del producto en WooCommerce.                                                            |

Asegúrate de que:

- Los posts de Banner y colección tengan **Imagen destacada** asignada.
- Los productos tengan al menos una imagen en WooCommerce.

---

## 5. Categorías de producto (WooCommerce)

- El home **excluye** la categoría con slug **`uncategorized`** (`filterOptions.excludeSlugs: ["uncategorized"]`).
- Las categorías que se muestran en “Shop by category” son solo las que tienen **al menos un producto con tag `home`**.
- Crea las categorías de producto que necesites y asígnalas a productos; luego asigna el tag **home** a los productos que quieras que definan las categorías visibles en el home.

---

## 6. Resumen rápido de creación

1. **WooCommerce → Etiquetas:** crear `home`, `recomendado`, `trending` (slugs exactos).
2. **WooCommerce → Productos:** asignar esas etiquetas y marcar “Destacado” donde quieras; subir imágenes.
3. **WordPress → Entradas → Categorías:** crear `Banner` y `coleccion` (slugs exactos).
4. **WordPress → Entradas:** crear 1 post en **Banner** (con imagen destacada) y 2 posts en **coleccion** (con imagen destacada).

Con esto, el home, la sección de categorías, Recommended, Trending, Hero y Colecciones deberían mostrarse correctamente tras reinstalar WordPress y configurar de nuevo el `.env.local` (Strapi y WooCommerce).
