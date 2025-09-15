"use client";

import React, { useState } from "react";
import { ProductFilters as ProductFiltersType } from "../types/product";

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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    price: true,
    features: true,
    rating: false,
  });

  const [priceRange, setPriceRange] = useState({
    min: filters.priceRange?.min || 0,
    max: filters.priceRange?.max || 100,
  });

  // Categorías disponibles (esto debería venir de una API en producción)
  const categories = [
    { id: "tshirts", name: "T-Shirts", count: 45 },
    { id: "hoodies", name: "Hoodies", count: 23 },
    { id: "accessories", name: "Accesorios", count: 18 },
    { id: "bags", name: "Bolsas", count: 12 },
    { id: "mugs", name: "Tazas", count: 8 },
    { id: "stickers", name: "Stickers", count: 15 },
  ];

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const currentCategories = filters.categories || [];
    const newCategories = checked
      ? [...currentCategories, categoryId]
      : currentCategories.filter((id) => id !== categoryId);

    onFiltersChange({
      ...filters,
      categories: newCategories.length > 0 ? newCategories : undefined,
    });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange({ min, max });
    onFiltersChange({
      ...filters,
      priceRange: { min, max },
    });
  };

  const handleFeatureChange = (
    feature: "featured" | "onSale",
    checked: boolean
  ) => {
    onFiltersChange({
      ...filters,
      [feature]: checked || undefined,
    });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({
      ...filters,
      minRating: rating,
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

  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-negro hover:text-gray-800 font-medium transition-colors duration-200"
            >
              Limpiar todo
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="p-6 space-y-0">
        {/* Categorías */}
        <FilterSection id="categories" title="Categorías">
          <div className="space-y-3">
            {categories.map((category) => {
              const isChecked =
                filters.categories?.includes(category.id) || false;
              return (
                <label
                  key={category.id}
                  className="flex items-center group cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) =>
                      handleCategoryChange(category.id, e.target.checked)
                    }
                    className="rounded border-gray-300 text-negro focus:ring-negro focus:ring-offset-0 transition-colors duration-200"
                  />
                  <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                    {category.name}
                  </span>
                  <span className="ml-auto text-xs text-gray-500">
                    ({category.count})
                  </span>
                </label>
              );
            })}
          </div>
        </FilterSection>

        {/* Rango de Precio */}
        <FilterSection id="price" title="Precio">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Mínimo
                </label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => {
                    const min = parseInt(e.target.value) || 0;
                    handlePriceRangeChange(min, priceRange.max);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-negro focus:border-negro transition-colors duration-200"
                  placeholder="$0"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Máximo
                </label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => {
                    const max = parseInt(e.target.value) || 100;
                    handlePriceRangeChange(priceRange.min, max);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-negro focus:border-negro transition-colors duration-200"
                  placeholder="$100"
                />
              </div>
            </div>

            {/* Rangos predefinidos */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">
                Rangos populares:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Menos de $25", min: 0, max: 25 },
                  { label: "$25 - $50", min: 25, max: 50 },
                  { label: "$50 - $100", min: 50, max: 100 },
                  { label: "Más de $100", min: 100, max: 500 },
                ].map((range) => (
                  <button
                    key={range.label}
                    onClick={() => handlePriceRangeChange(range.min, range.max)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all duration-200 ${
                      priceRange.min === range.min &&
                      priceRange.max === range.max
                        ? "bg-negro text-white border-negro"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Características */}
        <FilterSection id="features" title="Características">
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
                Productos destacados
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
                En oferta
              </span>
            </label>
          </div>
        </FilterSection>

        {/* Rating */}
        <FilterSection id="rating" title="Calificación">
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingChange(rating)}
                className={`w-full flex items-center p-2 rounded-md transition-colors duration-200 ${
                  filters.minRating === rating
                    ? "bg-negro text-white"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < rating
                          ? filters.minRating === rating
                            ? "text-yellow-300"
                            : "text-yellow-400"
                          : filters.minRating === rating
                          ? "text-gray-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm">y más</span>
                </div>
              </button>
            ))}
          </div>
        </FilterSection>
      </div>

      {/* Footer con botón de limpiar */}
      {hasActiveFilters && (
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClearFilters}
            className="w-full px-4 py-3 text-sm font-medium text-negro border border-negro rounded-lg hover:bg-negro hover:text-white transition-all duration-200"
          >
            Limpiar todos los filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
