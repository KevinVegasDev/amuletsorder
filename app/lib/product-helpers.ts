import { Product, ProductCategory } from "../types/product";
import { getHomeProducts, getProductCategories } from "./wordpress-api";

/**
 * Opciones para filtrar categorías
 */
export interface FilterCategoryOptions {
  /**
   * Categorías a excluir (por slug)
   * @default ["uncategorized"]
   */
  excludeSlugs?: string[];
  
  /**
   * Si debe excluir categorías sin productos
   * @default true
   */
  excludeEmpty?: boolean;
  
  /**
   * Función personalizada para filtrar categorías
   */
  customFilter?: (category: ProductCategory) => boolean;
}

/**
 * Opciones para agrupar productos
 */
export interface GroupProductsOptions {
  /**
   * Si debe evitar duplicados al agrupar
   * @default true
   */
  avoidDuplicates?: boolean;
  
  /**
   * Función personalizada para agrupar productos
   */
  customGrouping?: (products: Product[]) => Record<string, Product[]>;
}

/**
 * Resultado de cargar productos y categorías
 */
export interface ProductsDataResult {
  products: Product[];
  categories: ProductCategory[];
  productsByCategory: Record<string, Product[]>;
  categoriesWithProducts: ProductCategory[];
  homeCategories: ProductCategory[];
  categoryImages: Record<string, string>; // slug -> imageUrl
}

/**
 * Filtrar categorías según las opciones proporcionadas
 */
export function filterCategories(
  categories: ProductCategory[],
  options: FilterCategoryOptions = {}
): ProductCategory[] {
  const {
    excludeSlugs = ["uncategorized"],
    excludeEmpty = true,
    customFilter,
  } = options;

  return categories.filter((category) => {
    // Excluir por slug
    if (excludeSlugs.includes(category.slug)) {
      return false;
    }

    // Excluir categorías vacías
    if (excludeEmpty && (category.count || 0) === 0) {
      return false;
    }

    // Filtro personalizado
    if (customFilter && !customFilter(category)) {
      return false;
    }

    return true;
  });
}

/**
 * Agrupar productos por categoría
 */
export function groupProductsByCategory(
  products: Product[],
  options: GroupProductsOptions = {}
): Record<string, Product[]> {
  const { avoidDuplicates = true, customGrouping } = options;

  // Si hay una función de agrupación personalizada, usarla
  if (customGrouping) {
    return customGrouping(products);
  }

  const grouped: Record<string, Product[]> = {};

  products.forEach((product) => {
    // Si el producto tiene categorías, agregarlo a cada una
    if (product.categories && product.categories.length > 0) {
      product.categories.forEach((category) => {
        if (!grouped[category.slug]) {
          grouped[category.slug] = [];
        }

        // Solo agregar si no está ya en la lista (evitar duplicados)
        if (avoidDuplicates) {
          if (!grouped[category.slug].find((p) => p.id === product.id)) {
            grouped[category.slug].push(product);
          }
        } else {
          grouped[category.slug].push(product);
        }
      });
    }
  });

  return grouped;
}

/**
 * Obtener categorías que tienen productos
 */
export function getCategoriesWithProducts(
  categories: ProductCategory[],
  productsByCategory: Record<string, Product[]>
): ProductCategory[] {
  return categories.filter(
    (cat) => productsByCategory[cat.slug]?.length > 0
  );
}

/**
 * Filtrar categorías que tienen productos con etiqueta HOME
 */
export function getHomeCategories(
  categories: ProductCategory[],
  productsByCategory: Record<string, Product[]>,
  products: Product[]
): ProductCategory[] {
  // Obtener IDs de productos con tag "home"
  const homeProductIds = new Set(
    products
      .filter((product) =>
        product.tags?.some((tag) => tag.slug.toLowerCase() === "home")
      )
      .map((product) => product.id)
  );

  // Filtrar categorías que tienen al menos un producto con tag "home"
  return categories.filter((category) => {
    const categoryProducts = productsByCategory[category.slug] || [];
    return categoryProducts.some((product) => homeProductIds.has(product.id));
  });
}

/**
 * Obtener imágenes para cada categoría (primera imagen del primer producto)
 * Mejora la calidad de la imagen removiendo dimensiones pequeñas de la URL
 */
export function getCategoryImages(
  categories: ProductCategory[],
  productsByCategory: Record<string, Product[]>
): Record<string, string> {
  const categoryImages: Record<string, string> = {};

  categories.forEach((category) => {
    const categoryProducts = productsByCategory[category.slug] || [];
    
    // Obtener la primera imagen del primer producto de la categoría
    if (categoryProducts.length > 0) {
      const firstProduct = categoryProducts[0];
      if (firstProduct.images && firstProduct.images.length > 0) {
        let imageUrl = firstProduct.images[0].src;
        
        // Mejorar calidad: remover dimensiones pequeñas de la URL para obtener imagen original
        // WordPress/WooCommerce a menudo agrega dimensiones como -150x150, -300x300, etc.
        if (
          imageUrl.includes("-150x150") ||
          imageUrl.includes("-300x300") ||
          imageUrl.includes("-600x600") ||
          imageUrl.includes("-768x768")
        ) {
          // Remover el patrón de dimensiones (ej: -300x300)
          imageUrl = imageUrl.replace(/-\d+x\d+/, "");
        }
        
        categoryImages[category.slug] = imageUrl;
      }
    }
  });

  return categoryImages;
}

/**
 * Cargar productos y categorías desde WordPress
 * Función helper principal para obtener y procesar datos de productos
 * Maneja errores y retorna estructura vacía si falla
 */
export async function loadProductsData(options: {
  /**
   * Número de productos a cargar
   * @default 20
   */
  productLimit?: number;
  
  /**
   * Opciones para filtrar categorías
   */
  filterOptions?: FilterCategoryOptions;
  
  /**
   * Opciones para agrupar productos
   */
  groupOptions?: GroupProductsOptions;
} = {}): Promise<ProductsDataResult> {
  const {
    productLimit = 20,
    filterOptions = {},
    groupOptions = {},
  } = options;

  try {
    // Cargar productos y categorías usando las funciones existentes
    const [productsResult, categoriesResult] = await Promise.allSettled([
      getHomeProducts(productLimit),
      getProductCategories(),
    ]);

    // Extraer resultados o usar arrays vacíos si hay error
    const products =
      productsResult.status === "fulfilled" ? productsResult.value : [];
    const allCategories =
      categoriesResult.status === "fulfilled" ? categoriesResult.value : [];

    // Log errores pero continuar
    if (productsResult.status === "rejected") {
      console.error("Error loading products:", productsResult.reason);
    }
    if (categoriesResult.status === "rejected") {
      console.error("Error loading categories:", categoriesResult.reason);
    }

    // Si no hay datos, retornar estructura vacía
    if (products.length === 0 || allCategories.length === 0) {
      return {
        products: [],
        categories: [],
        productsByCategory: {},
        categoriesWithProducts: [],
        homeCategories: [],
        categoryImages: {},
      };
    }

    // Filtrar categorías
    const categories = filterCategories(allCategories, filterOptions);

    // Agrupar productos por categoría
    const productsByCategory = groupProductsByCategory(products, groupOptions);

    // Obtener categorías que tienen productos
    const categoriesWithProducts = getCategoriesWithProducts(
      categories,
      productsByCategory
    );

    // Obtener categorías con productos etiquetados como HOME
    const homeCategories = getHomeCategories(
      categories,
      productsByCategory,
      products
    );

    // Obtener imágenes para las categorías HOME
    const categoryImages = getCategoryImages(homeCategories, productsByCategory);

    return {
      products,
      categories,
      productsByCategory,
      categoriesWithProducts,
      homeCategories,
      categoryImages,
    };
  } catch (error) {
    console.error("Error in loadProductsData:", error);
    // Retornar estructura vacía en caso de error
    return {
      products: [],
      categories: [],
      productsByCategory: {},
      categoriesWithProducts: [],
      homeCategories: [],
      categoryImages: {},
    };
  }
}
