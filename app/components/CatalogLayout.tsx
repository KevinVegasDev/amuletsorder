"use client";

import React, { useState, useEffect, useCallback } from "react";
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
}

const CatalogLayout: React.FC<CatalogLayoutProps> = ({
  initialProducts,
  filters = {},
  onFiltersChange,
  showFilters = true,
  className = "",
}) => {
  const [products, setProducts] = useState<Product[]>(
    initialProducts?.products || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(
    initialProducts?.totalPages || 1
  );
  const [total, setTotal] = useState(initialProducts?.total || 0);
  const [currentFilters, setCurrentFilters] =
    useState<ProductFiltersType>(filters);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [productsPerPage, setProductsPerPage] = useState(12);

  // Función para cargar productos
  const loadProducts = useCallback(
    async (
      page: number = 1,
      newFilters: ProductFiltersType = currentFilters,
      perPage: number = productsPerPage
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await getProducts(page, perPage, newFilters);
        setProducts(response.products);
        setCurrentPage(response.currentPage);
        setTotalPages(response.totalPages);
        setTotal(response.total);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar productos"
        );
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    },
    [currentFilters, productsPerPage]
  );

  // Efecto para cargar productos cuando cambian los filtros
  useEffect(() => {
    if (!initialProducts) {
      loadProducts(1, currentFilters, productsPerPage);
    }
  }, [currentFilters, initialProducts, loadProducts, productsPerPage]);

  // Manejar cambios en filtros
  const handleFiltersChange = (newFilters: ProductFiltersType) => {
    setCurrentFilters(newFilters);
    setCurrentPage(1);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
    loadProducts(1, newFilters, productsPerPage);
  };

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadProducts(page, currentFilters, productsPerPage);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Manejar cambio de productos por página
  const handleProductsPerPageChange = (perPage: number) => {
    setProductsPerPage(perPage);
    setCurrentPage(1);
    loadProducts(1, currentFilters, perPage);
  };

  // Limpiar filtros
  const clearFilters = () => {
    const emptyFilters: ProductFiltersType = {};
    setCurrentFilters(emptyFilters);
    setCurrentPage(1);
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
    // Validar stock antes de agregar
    if (!product.inStock) {
      return;
    }
    addToCart(product, 1);
  };

  const handleAddToWishlist = (product: Product) => {
    toggleWishlist(product);
  };

  // Estado para el ancho de ventana
  const [windowWidth, setWindowWidth] = useState(1024); // Valor por defecto para SSR

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Establecer el ancho inicial
    setWindowWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Componente de paginación optimizado
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = windowWidth < 640 ? 3 : 7; // Responsive: menos páginas en móvil
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex flex-col items-center space-y-4 mt-8">
        {/* Información de página actual */}
        <div className="text-sm text-gray-600 text-center">
          Página <span className="font-semibold text-negro">{currentPage}</span>{" "}
          de <span className="font-semibold text-negro">{totalPages}</span>
        </div>

        {/* Controles de paginación */}
        <div className="flex items-center justify-center space-x-1 sm:space-x-2">
          {/* Botón primera página */}
          {currentPage > 3 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="hidden sm:flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-negro transition-all duration-200"
                title="Primera página"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="hidden sm:block px-2 text-gray-400">...</span>
            </>
          )}

          {/* Botón anterior */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-negro disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all duration-200"
            title="Página anterior"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Números de página */}
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`flex items-center justify-center w-10 h-10 text-sm font-medium transition-all duration-200 ${
                page === currentPage
                  ? "text-white bg-negro border border-negro shadow-md transform scale-105"
                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-negro hover:text-negro"
              }`}
              title={`Página ${page}`}
            >
              {page}
            </button>
          ))}

          {/* Botón siguiente */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-negro disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all duration-200"
            title="Página siguiente"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Botón última página */}
          {currentPage < totalPages - 2 && (
            <>
              <span className="hidden sm:block px-2 text-gray-400">...</span>
              <button
                onClick={() => handlePageChange(totalPages)}
                className="hidden sm:flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-negro transition-all duration-200"
                title="Última página"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Navegación rápida (solo en desktop) */}
        {totalPages > 10 && (
          <div className="hidden lg:flex items-center space-x-3 text-sm">
            <span className="text-gray-600">Ir a página:</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                  }
                }}
                className="w-16 px-2 py-1 text-center border border-gray-300 focus:outline-none focus:ring-2 focus:ring-negro focus:border-transparent"
              />
              <span className="text-gray-500">de {totalPages}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Información de resultados y controles
  const ResultsInfo = () => {
    if (loading || error) return null;

    const start = (currentPage - 1) * productsPerPage + 1;
    const end = Math.min(currentPage * productsPerPage, total);

    return (
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{start}</span> a{" "}
            <span className="font-medium">{end}</span> de{" "}
            <span className="font-medium">{total}</span> productos
          </p>

          {/* Selector de productos por página */}
          <div className="flex items-center gap-2">
            <label htmlFor="perPage" className="text-sm text-gray-600">
              Mostrar:
            </label>
            <select
              id="perPage"
              value={productsPerPage}
              onChange={(e) =>
                handleProductsPerPageChange(Number(e.target.value))
              }
              className="text-sm border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-negro focus:border-transparent"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={36}>36</option>
              <option value={48}>48</option>
            </select>
            <span className="text-sm text-gray-600">por página</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {Object.keys(currentFilters).length > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-negro hover:text-gray-800 underline transition-colors duration-200"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Layout principal con sidebar y contenido */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de filtros (solo en desktop) */}
        {showFilters && (
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <ProductFilters
                filters={currentFilters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={clearFilters}
              />
            </div>
          </aside>
        )}

        {/* Contenido principal */}
        <main className="flex-1 min-w-0">
          {/* Botón de filtros para móviles */}
          {showFilters && (
            <div className="flex justify-end mb-6 lg:hidden">
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filtros
                {Object.keys(currentFilters).length > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-medium text-white bg-negro">
                    {Object.keys(currentFilters).length}
                  </span>
                )}
              </button>
            </div>
          )}

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
              {/* Grid de productos */}
              <ProductGrid
                products={products}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
                className="mb-8"
              />

              {/* Controles de paginación y ordenamiento en la parte inferior */}
              <div className="mt-8 space-y-6">
                <ResultsInfo />
                <Pagination />
              </div>
            </>
          )}

          {/* Filtros móviles */}
          {showFilters && (
            <MobileFilters
              filters={currentFilters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={clearFilters}
              isOpen={isMobileFiltersOpen}
              onClose={() => setIsMobileFiltersOpen(false)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default CatalogLayout;
