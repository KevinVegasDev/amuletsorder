"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ProductFilters as ProductFiltersType,
  ProductCategory,
} from "../types/product";
import { getProductCategories } from "../lib/wordpress-api";

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onFiltersChange: (filters: ProductFiltersType) => void;
  onClearFilters: () => void;
  className?: string;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className = "",
}) => {
  const searchParams = useSearchParams();
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    price: true,
    features: true,
  });

  const [priceRange, setPriceRange] = useState({
    min: filters.priceRange?.min || 0,
    max: filters.priceRange?.max || 100,
  });

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener categorías activas desde la URL para sincronización
  const getActiveCategoriesFromURL = (): string[] => {
    const categoryFromURL = searchParams.get("category");
    return categoryFromURL ? [categoryFromURL] : [];
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getProductCategories();
        // Excluir categorías "All" y "uncategorized" de WordPress
        const filteredCats = cats.filter(
          (cat) => 
            cat.slug.toLowerCase() !== "all" && 
            cat.slug.toLowerCase() !== "uncategorized"
        );
        setCategories(filteredCats);
      } catch (err) {
        console.error("Error loading categories:", err);
        setError("Error loading categories");
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleCategoryChange = (categorySlug: string, checked: boolean) => {
    console.log("📦 Category change:", { categorySlug, checked, currentFilters: filters.categories });
    
    // Si se selecciona "All", limpiar todos los filtros de categorías
    if (categorySlug === "all" || categorySlug === "") {
      const newFilters = {
        ...filters,
        categories: undefined,
      };
      console.log("✅ Clearing all categories, new filters:", newFilters);
      onFiltersChange(newFilters);
      return;
    }

    // Si se selecciona una categoría específica, permitir múltiples selecciones
    const currentCategories = filters.categories || [];
    const newCategories = checked
      ? [...currentCategories, categorySlug]
      : currentCategories.filter((slug) => slug !== categorySlug);

    const newFilters = {
      ...filters,
      categories: newCategories.length > 0 ? newCategories : undefined,
    };
    console.log("✅ Updated categories:", { newCategories, newFilters });
    onFiltersChange(newFilters);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange({ min, max });
    onFiltersChange({
      ...filters,
      priceRange: { min, max },
    });
  };

  // Sincronizar el rango de precio cuando cambien los filtros desde fuera
  useEffect(() => {
    if (filters.priceRange) {
      setPriceRange({
        min: filters.priceRange.min,
        max: filters.priceRange.max,
      });
    } else {
      // Si no hay filtro de precio, resetear a valores por defecto
      setPriceRange({ min: 0, max: 100 });
    }
  }, [filters.priceRange]);

  const handleFeatureChange = (
    feature: "featured" | "onSale",
    checked: boolean
  ) => {
    onFiltersChange({
      ...filters,
      [feature]: checked || undefined,
    });
  };


  const hasActiveFilters = Object.keys(filters).length > 0;

  const FilterSection: React.FC<{
    id: string;
    title: string;
    children: React.ReactNode;
  }> = ({ id, title, children }) => {
    const isOpen = openSections[id];

    return (
      <div className="border-b border-gray-200 last:border-b-0">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors duration-200"
        >
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-96 pb-4" : "max-h-0"
          }`}
        >
          <div className="space-y-3">{children}</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}
      >
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-xl  ${className}`}
      >
        <div className="p-6 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl  ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-negro hover:text-gray-800 font-medium transition-colors duration-200"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 space-y-0">
        {/* Categories */}
        <FilterSection id="categories" title="Categories">
          <div className="space-y-3">
            {/* Categorías de WordPress (excluyendo "All" y "uncategorized") */}
            {categories.map((category) => {
              // Leer estado directamente desde la URL para sincronización perfecta con stories navigation
              const activeCategoriesFromURL = getActiveCategoriesFromURL();
              const isChecked = activeCategoriesFromURL.includes(category.slug);
              
              return (
                <label
                  key={category.id}
                  className="flex items-center group cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      // Si se selecciona una categoría, desmarcar "All" automáticamente
                      handleCategoryChange(category.slug, e.target.checked);
                    }}
                    className="form-checkbox h-4 w-4 text-negro border-gray-300 rounded focus:ring-negro focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                    {category.name}
                  </span>
                </label>
              );
            })}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection id="price" title="Price">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Under $25", min: 0, max: 25 },
                { label: "$25 - $50", min: 25, max: 50 },
                { label: "$50 - $100", min: 50, max: 100 },
                { label: "$100 - $200", min: 100, max: 200 },
                { label: "Over $200", min: 200, max: 1000 },
              ].map((range) => {
                const isActive =
                  priceRange.min === range.min && priceRange.max === range.max;
                return (
                  <button
                    key={range.label}
                    onClick={() => handlePriceRangeChange(range.min, range.max)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                      isActive
                        ? "bg-negro text-white border-negro shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:border-negro hover:bg-gray-50"
                    }`}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          </div>
        </FilterSection>

        {/* Features */}
        <FilterSection id="features" title="Features">
          <div className="space-y-3">
            <label className="flex items-center group cursor-pointer">
              <input
                type="checkbox"
                checked={filters.featured || false}
                onChange={(e) =>
                  handleFeatureChange("featured", e.target.checked)
                }
                className="rounded border-gray-300 text-negro focus:ring-negro focus:ring-offset-0 transition-colors duration-200"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                Featured products
              </span>
            </label>

            <label className="flex items-center group cursor-pointer">
              <input
                type="checkbox"
                checked={filters.onSale || false}
                onChange={(e) =>
                  handleFeatureChange("onSale", e.target.checked)
                }
                className="rounded border-gray-300 text-negro focus:ring-negro focus:ring-offset-0 transition-colors duration-200"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                On sale
              </span>
            </label>
          </div>
        </FilterSection>

      </div>

      {/* Footer with clear button */}
      {hasActiveFilters && (
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClearFilters}
            className="w-full px-4 py-3 text-sm font-medium text-negro border border-negro rounded-lg hover:bg-negro hover:text-white transition-all duration-200"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
