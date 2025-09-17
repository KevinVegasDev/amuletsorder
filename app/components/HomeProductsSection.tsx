"use client";

import React, { useState, useEffect } from "react";
import { Product, ProductCategory } from "../types/product";
import { getHomeProducts } from "../lib/wordpress-api";
import ProductGrid from "./ProductGrid";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ProductSkeleton from "./ProductSkeleton";
import { NoProductsFound } from "./EmptyState";
import { getProductCategories } from "../lib/wordpress-api";

interface HomeProductsSectionProps {
  className?: string;
}

const HomeProductsSection: React.FC<HomeProductsSectionProps> = ({
  className = "",
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Cargar categorías al inicio
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getProductCategories();
        const uncategorizedIndex = cats.findIndex(cat => cat.slug === 'uncategorized');
        if (uncategorizedIndex !== -1) {
          cats[uncategorizedIndex].name = 'All';
          setCategories(cats);
          setSelectedCategory('uncategorized');
        } else {
          setCategories(cats);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
        setError("Error loading categories");
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const homeProducts = await getHomeProducts(12);
        setProducts(homeProducts);
        setFilteredProducts(homeProducts);
      } catch (error) {
        console.error("Error fetching home products:", error);
        setError("Error loading products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== "uncategorized") {
      filtered = filtered.filter((product) =>
        product.categories.some((cat) => cat.slug === selectedCategory)
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory]);

  const handleCategoryClick = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
  };

  const getCategoryClasses = (categorySlug: string) => {
    const isActive = selectedCategory === categorySlug;
    const isHovered = hoveredCategory === categorySlug;

    let classes =
      "flex items-center gap-3 px-4 py-2 transition-all duration-200 ";

    if (isActive) {
      classes += "text-black font-medium";
    } else if (isHovered) {
      classes += "text-gray-700";
    } else {
      classes += "text-gray-600 hover:text-gray-700";
    }

    return classes;
  };

  const getBulletClasses = (categorySlug: string) => {
    const isActive = selectedCategory === categorySlug;

    let classes = "w-2 h-2 rounded-full transition-all duration-200 ";

    if (isActive) {
      classes += "bg-black";
    } else {
      classes += "bg-gray-400";
    }

    return classes;
  };

  if (loading) {
    return (
      <div className={`pt-4 pb-16 ${className}`}>
        <div className="container mx-auto px-4">
          <ProductSkeleton count={8} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-4 pb-16 flex flex-col px-[50px]`}>
      <div className="flex-1 h-full">
        {/* Layout principal: Filtros a la izquierda, productos a la derecha */}
        <div className="flex gap-2 h-full">
          {/* Panel de filtros - Lado izquierdo */}
          <div className="w-80 bg-blanco p-4 flex flex-col gap-[20px] ">
            {/* Buscador */}
            <div className="flex-none">
              <div className="flex justify-between bg-gris rounded-[32px] px-8 py-[18px]">
                <input
                  type="text"
                  placeholder="Look for a product"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-light placeholder-gray-500"
                />
                <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
              </div>
            </div>

            {/* Lista de categorías */}
            <div className="flex-1 overflow-auto">
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={getCategoryClasses(category.slug)}
                    onClick={() => handleCategoryClick(category.slug)}
                    onMouseEnter={() => setHoveredCategory(category.slug)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className={getBulletClasses(category.slug)} />
                    <span className="text-lg font-roboto-flex font-light cursor-pointer">
                      {category.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grid de productos - Lado derecho */}
          <div className="flex-1 h-full overflow-auto">
            {filteredProducts.length > 0 ? (
              <ProductGrid
                products={filteredProducts}
                onAddToCart={(product) => {
                  console.log("Agregar al carrito:", product);
                }}
                onAddToWishlist={(product) => {
                  console.log("Agregar a favoritos:", product);
                }}
                className="min-h-full"
              />
            ) : (
              <NoProductsFound
                onClearFilters={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeProductsSection;
