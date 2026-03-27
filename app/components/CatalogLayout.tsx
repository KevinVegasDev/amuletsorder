"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Product,
  ProductFilters as ProductFiltersType,
  ProductsResponse,
} from "../types/product";
import ProductGrid from "./ProductGrid";
import ProductFilters from "./ProductFilters";
import MobileFilters from "./MobileFilters";
import ProductSkeleton from "./ProductSkeleton";
import { NoProductsFound, ServerError } from "./EmptyState";
import { getProducts } from "../lib/wordpress-api";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";

interface CatalogLayoutProps {
  initialProducts?: ProductsResponse;
  filters?: ProductFiltersType;
  onFiltersChange?: (filters: ProductFiltersType) => void;
  showFilters?: boolean;
  className?: string;
  /** Control del panel de filtros en móvil (abre desde la izquierda). Si no se pasan, se usa estado interno. */
  isMobileFiltersOpen?: boolean;
  onCloseMobileFilters?: () => void;
}

const CatalogLayout: React.FC<CatalogLayoutProps> = ({
  initialProducts,
  filters = {},
  onFiltersChange,
  showFilters = true,
  className = "",
  isMobileFiltersOpen: controlledMobileFiltersOpen,
  onCloseMobileFilters,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [products, setProducts] = useState<Product[]>(
    initialProducts?.products || []
  );
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(
    initialProducts?.totalPages || 1
  );
  const [total, setTotal] = useState(initialProducts?.total || 0);

  // Categoría desde path (/market/category/camisole) o desde query (?category=camisole)
  const categoryFromPath =
    pathname.startsWith("/market/category/") &&
    pathname !== "/market/category"
      ? pathname.replace("/market/category/", "").split("/")[0]?.trim() || null
      : null;

  // Leer filtros de la URL al inicializar
  const getFiltersFromURL = useCallback((): ProductFiltersType => {
    const urlFilters: ProductFiltersType = {};

    const categoryParam = categoryFromPath ?? searchParams.get("category");
    if (categoryParam) {
      urlFilters.categories = [categoryParam];
    }

    // Leer rango de precio de la URL
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      urlFilters.priceRange = {
        min: minPrice ? parseInt(minPrice) : 0,
        max: maxPrice ? parseInt(maxPrice) : 1000,
      };
    }

    // Leer featured
    if (searchParams.get("featured") === "true") {
      urlFilters.featured = true;
    }

    // Leer onSale
    if (searchParams.get("onSale") === "true") {
      urlFilters.onSale = true;
    }

    const search = searchParams.get("search");
    if (search?.trim()) {
      urlFilters.search = search.trim();
    }

    return urlFilters;
  }, [searchParams, categoryFromPath]);

  const [currentFilters, setCurrentFilters] = useState<ProductFiltersType>(
    Object.keys(filters).length > 0 ? filters : getFiltersFromURL()
  );
  const [internalMobileFiltersOpen, setInternalMobileFiltersOpen] = useState(false);
  const isMobileFiltersOpen = controlledMobileFiltersOpen ?? internalMobileFiltersOpen;
  const handleCloseMobileFilters = onCloseMobileFilters ?? (() => setInternalMobileFiltersOpen(false));
  const [productsPerPage, setProductsPerPage] = useState(12);

  // Redirigir URLs antiguas: /market?category=x -> /market/category/x
  useEffect(() => {
    if (pathname !== "/market") return;
    const categoryParam = searchParams.get("category");
    if (!categoryParam) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    const basePath = `/market/category/${categoryParam}`;
    const query = params.toString();
    router.replace(query ? `${basePath}?${query}` : basePath, { scroll: false });
  }, [pathname, searchParams, router]);

  // Sincronizar filtros con la URL cuando cambian los searchParams
  useEffect(() => {
    const urlFilters = getFiltersFromURL();
    // Siempre actualizar los filtros con los de la URL, incluso si están vacíos
    // Esto asegura que cuando se quita un filtro de la URL, se recarguen los productos sin filtro
    setCurrentFilters(urlFilters);
  }, [searchParams, getFiltersFromURL]);

  // Función para cargar productos
  const loadProducts = useCallback(
    async (
      page: number = 1,
      newFilters: ProductFiltersType = currentFilters,
      perPage: number = productsPerPage,
      append: boolean = false
    ) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await getProducts(page, perPage, newFilters);
        setProducts((prev) => append ? [...prev, ...response.products] : response.products);
        setCurrentPage(response.currentPage);
        setTotalPages(response.totalPages);
        setTotal(response.total);
      } catch (err) {
        console.error("❌ Error loading products:", err);

        // Verificar si el error tiene código de estado
        const statusCode = (err as Error & { statusCode?: number })?.statusCode;
        const errorMessage = err instanceof Error ? err.message : "Error al cargar productos";

        // Si el error es 503 o un error de servicio no disponible
        const isServiceUnavailable = statusCode === 503 ||
          errorMessage.includes("503") ||
          errorMessage.includes("no está disponible") ||
          errorMessage.includes("Service Unavailable");

        if (isServiceUnavailable) {
          console.log("⚠️ WordPress service unavailable, showing empty state");
          if (!append) {
            setProducts([]);
            setCurrentPage(1);
            setTotalPages(0);
            setTotal(0);
          }
          setError(null);
          return;
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [currentFilters, productsPerPage]
  );

  // Efecto para cargar productos cuando cambian los filtros o la URL
  useEffect(() => {
    // Siempre recargar productos cuando cambian los filtros (incluyendo cuando se quitan)
    // No verificar initialProducts porque queremos que se actualice cuando cambia la URL
    loadProducts(1, currentFilters, productsPerPage);
  }, [currentFilters, loadProducts, productsPerPage]);

  // URLs amigables: categoría en el path (/market/category/camisole), resto en query
  const updateURL = useCallback((newFilters: ProductFiltersType) => {
    const basePath =
      newFilters.categories && newFilters.categories.length > 0
        ? `/market/category/${newFilters.categories[0]}`
        : "/market";

    const params = new URLSearchParams();
    if (newFilters.priceRange) {
      if (newFilters.priceRange.min > 0) {
        params.set("minPrice", newFilters.priceRange.min.toString());
      }
      if (newFilters.priceRange.max < 1000) {
        params.set("maxPrice", newFilters.priceRange.max.toString());
      }
    }
    if (newFilters.featured) params.set("featured", "true");
    if (newFilters.onSale) params.set("onSale", "true");
    if (newFilters.search?.trim()) params.set("search", newFilters.search.trim());

    const query = params.toString();
    const newURL = query ? `${basePath}?${query}` : basePath;
    router.replace(newURL, { scroll: false });
  }, [router]);

  // Manejar cambios en filtros
  const handleFiltersChange = (newFilters: ProductFiltersType) => {
    console.log("🔄 Filters changed:", newFilters);
    setCurrentFilters(newFilters);
    setCurrentPage(1);
    updateURL(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
    loadProducts(1, newFilters, productsPerPage);
  };

  // Manejar "Load more"
  const handleLoadMore = () => {
    if (currentPage < totalPages && !loadingMore) {
      const nextPage = currentPage + 1;
      loadProducts(nextPage, currentFilters, productsPerPage, true);
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    const emptyFilters: ProductFiltersType = {};
    setCurrentFilters(emptyFilters);
    setCurrentPage(1);
    updateURL(emptyFilters);
    if (onFiltersChange) {
      onFiltersChange(emptyFilters);
    }
    loadProducts(1, emptyFilters, productsPerPage);
  };

  // Contextos
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();

  // Manejar acciones de productos
  const handleAddToCart = (product: Product) => {
    if (!product.inStock) {
      return;
    }
    addToCart(product, 1);
  };

  const handleAddToWishlist = (product: Product) => {
    toggleWishlist(product);
  };



  return (
    <div className={`w-full ${className}`}>
      {/* Layout principal con sidebar y contenido */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de filtros (solo en desktop): transición suave al mostrar/ocultar */}
        <div
          className={`hidden lg:block flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${showFilters ? "w-80" : "w-0"
            }`}
          style={{ minWidth: 0 }}
        >
          <aside className="w-80 pt-0">
            <div className="sticky top-24">
              <ProductFilters
                filters={currentFilters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={clearFilters}
              />
            </div>
          </aside>
        </div>

        {/* Contenido principal */}
        <main className="flex-1 min-w-0">
          {/* Contenido de productos */}
          {loading ? (
            <div className="py-16">
              <ProductSkeleton count={productsPerPage} />
            </div>
          ) : error ? (
            <ServerError
              onRetry={() =>
                loadProducts(currentPage, currentFilters, productsPerPage)
              }
            />
          ) : products.length === 0 ? (
            <NoProductsFound
              onClearFilters={
                Object.keys(currentFilters).length > 0
                  ? clearFilters
                  : undefined
              }
            />
          ) : (
            <>
              {/* Grid de productos: 4 columnas; cards 338px con filtros, 443px sin filtros */}
              <ProductGrid
                products={products}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
                filtersVisible={showFilters}
                className="mb-8"
              />

              {/* Botón Load more */}
              {currentPage < totalPages && (
                <div className="flex justify-center mt-8">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="bg-negro text-white px-[32px] py-[16px] rounded-[12px] font-semibold text-[16px] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loadingMore ? (
                      <>
                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load more"
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Filtros móviles: se abre desde la izquierda al tocar "Filters" en la barra */}
          <MobileFilters
            filters={currentFilters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={clearFilters}
            isOpen={isMobileFiltersOpen}
            onClose={handleCloseMobileFilters}
          />
        </main>
      </div>
    </div>
  );
};

export default CatalogLayout;
