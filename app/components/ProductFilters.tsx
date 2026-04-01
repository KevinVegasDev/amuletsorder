"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ProductFilters as ProductFiltersType,
  ProductCategory,
} from "../types/product";
import { getProductCategories } from "../lib/wordpress-api";

/* Acordeón estable fuera del padre para que la transición CSS no se pierda en re-renders */
interface AccordionSectionProps {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isFirst?: boolean;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  id,
  title,
  isOpen,
  onToggle,
  children,
  isFirst = false,
}) => (
  <section className={`border-b border-negro ${isFirst ? "border-t" : ""}`}>
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 rounded-md px-2 transition-colors duration-200"
      aria-controls={`filter-${id}`}
      aria-expanded={isOpen}
      id={`accordion-${id}`}
    >
      <h3 className="text-base font-medium text-negro">{title}</h3>
      <svg
        className={`w-5 h-5 text-negro shrink-0 transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : "rotate-0"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <div
      id={`filter-${id}`}
      role="region"
      aria-labelledby={`accordion-${id}`}
      className="filter-accordion-content"
      data-state={isOpen ? "open" : "closed"}
    >
      <div>
        <div className={`space-y-3 ${isOpen ? "pb-4" : ""}`}>
          {children}
        </div>
      </div>
    </div>
  </section>
);

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
    categories: filters.categories ? filters.categories.length > 0 : false,
    price: true,
    features: false,
  });

  const [priceRange, setPriceRange] = useState({
    min: filters.priceRange?.min || 0,
    max: filters.priceRange?.max || 100,
  });

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



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
    // Si se hace click en el mismo rango, desmarcarlo (toggle)
    const isActive = priceRange.min === min && priceRange.max === max;

    if (isActive) {
      // Desmarcar: resetear a valores por defecto y quitar el filtro
      setPriceRange({ min: 0, max: 100 });
      const newFilters = { ...filters };
      delete newFilters.priceRange;
      onFiltersChange(newFilters);
    } else {
      // Marcar: aplicar el nuevo rango
      setPriceRange({ min, max });
      onFiltersChange({
        ...filters,
        priceRange: { min, max },
      });
    }
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


  if (loading) {
    return (
      <div
        className={`py-8 px-6 rounded-2xl border border-negro flex flex-col ${className}`}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`py-8 px-6 rounded-2xl border border-negro flex flex-col ${className}`}
      >
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className={`py-8 px-6 rounded-2xl border border-negro flex flex-col ${className}`}>
      {/* Título */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-negro">Filters</h2>
      </div>

      {/* Secciones de filtros */}
      <div className="flex flex-col">
        {/* Price Range - Primera sección con border-top */}
        <AccordionSection
          id="price"
          title="Price"
          isFirst
          isOpen={openSections.price}
          onToggle={() => toggleSection("price")}
        >
          <div className="flex flex-col gap-2">
            {[
              { label: "Under $25", min: 0, max: 25 },
              { label: "$25- $50", min: 25, max: 50 },
              { label: "$50- $100", min: 50, max: 100 },
              { label: "$100- $200", min: 100, max: 200 },
              { label: "Over $200", min: 200, max: 1000 },
            ].map((range) => {
              const isActive =
                priceRange.min === range.min && priceRange.max === range.max;
              return (
                <button
                  key={range.label}
                  onClick={() => handlePriceRangeChange(range.min, range.max)}
                  className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg border ${isActive
                    ? "bg-negro text-white border-negro"
                    : "bg-white text-negro border-gray-300 hover:border-negro"
                    }`}
                >
                  {range.label}
                </button>
              );
            })}
          </div>
        </AccordionSection>

        {/* Categories */}
        <AccordionSection
          id="categories"
          title="Categories"
          isOpen={openSections.categories}
          onToggle={() => toggleSection("categories")}
        >
          <div className="space-y-3">
            {categories.map((category) => {
              const isChecked = filters.categories ? filters.categories.includes(category.slug) : false;

              return (
                <label
                  key={category.id}
                  className="flex items-center group cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      handleCategoryChange(category.slug, e.target.checked);
                    }}
                    className="h-5 w-5 text-negro border-gray-300 rounded focus:ring-negro focus:ring-2"
                  />
                  <span className="ml-3 text-base text-negro group-hover:font-medium">
                    {category.name}
                  </span>
                </label>
              );
            })}
          </div>
        </AccordionSection>

        {/* Features */}
        <AccordionSection
          id="features"
          title="Features"
          isOpen={openSections.features}
          onToggle={() => toggleSection("features")}
        >
          <div className="space-y-3">
            <label className="flex items-center group cursor-pointer">
              <input
                type="checkbox"
                checked={filters.featured || false}
                onChange={(e) =>
                  handleFeatureChange("featured", e.target.checked)
                }
                className="h-5 w-5 rounded border-gray-300 text-negro focus:ring-negro focus:ring-2"
              />
              <span className="ml-3 text-base text-negro group-hover:font-medium transition-all duration-200">
                Limited offer
              </span>
            </label>

            <label className="flex items-center group cursor-pointer">
              <input
                type="checkbox"
                checked={filters.onSale || false}
                onChange={(e) =>
                  handleFeatureChange("onSale", e.target.checked)
                }
                className="h-5 w-5 rounded border-gray-300 text-negro focus:ring-negro focus:ring-2"
              />
              <span className="ml-3 text-base text-negro group-hover:font-medium transition-all duration-200">
                Discount
              </span>
            </label>
          </div>
        </AccordionSection>
      </div>
    </div>
  );
};

export default ProductFilters;
