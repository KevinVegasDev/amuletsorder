"use client";

import React, { useState, useEffect } from "react";
import { Product } from "../types/product";
import { getHomeProducts } from "../lib/wordpress-api";
import ProductGrid from "./ProductGrid";
import LoadingSpinner from "./LoadingSpinner";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface HomeProductsSectionProps {
  className?: string;
}

// Categorías predefinidas que se pueden controlar desde aquí
const CATEGORIES = [
  { id: "all", name: "All" },
  { id: "footwear", name: "Footwear" },
  { id: "hoodies", name: "Hoodies" },
  { id: "necklace", name: "Necklace" },
  { id: "bags", name: "Bags" },
  { id: "jewelry", name: "Jewelry" },
  { id: "t-shirts", name: "T-Shirts" },
  { id: "pants", name: "Pants" },
  { id: "jeans", name: "Jeans" },
  { id: "joggers", name: "Joggers" },
];

const HomeProductsSection: React.FC<HomeProductsSectionProps> = ({
  className = "",
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log("HomeProductsSection: Starting to fetch home products...");
        const homeProducts = await getHomeProducts(12);
        console.log(
          "HomeProductsSection: Received products:",
          homeProducts.length
        );
        console.log(
          "HomeProductsSection: Products details:",
          homeProducts.map((p) => ({ id: p.id, name: p.name, tags: p.tags }))
        );
        setProducts(homeProducts);
        setFilteredProducts(homeProducts);
      } catch (error) {
        console.error("Error fetching home products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por categoría (simulado - en el futuro se puede conectar con categorías reales)
    if (selectedCategory !== "all") {
      // Por ahora solo filtramos por "all", pero se puede extender
      // filtered = filtered.filter(product => product.categories.some(cat => cat.slug === selectedCategory));
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const getCategoryClasses = (categoryId: string) => {
    const isActive = selectedCategory === categoryId;
    const isHovered = hoveredCategory === categoryId;

    let classes =
      "flex items-center gap-3 px-4 py-2 cursor-pointer transition-all duration-200 ";

    if (isActive) {
      classes += "text-black font-medium";
    } else if (isHovered) {
      classes += "text-gray-700";
    } else {
      classes += "text-gray-600 hover:text-gray-700";
    }

    return classes;
  };

  const getBulletClasses = (categoryId: string) => {
    const isActive = selectedCategory === categoryId;

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
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className={`pt-4 pb-16 `}>
      <div className="">
        {/* Layout principal: Filtros a la izquierda, productos a la derecha */}
        <div className="flex gap-8">
          {/* Panel de filtros - Lado izquierdo */}
          <div className="w-80 flex-shrink-0 bg-white p-4">
            {/* Buscador */}
            <div className="">
              <div className="flex items-center justify-between bg-gray-100 rounded-[32px] px-8 py-[18px]">
                <input
                  type="text"
                  placeholder="Look for a product"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-light placeholder-gray-500"
                  style={{ fontFamily: "Teko, sans-serif" }}
                />
                <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
              </div>
            </div>

            {/* Lista de categorías */}
            <div className="px-6">
              <div className="space-y-1">
                {CATEGORIES.map((category) => (
                  <div
                    key={category.id}
                    className={getCategoryClasses(category.id)}
                    onClick={() => handleCategoryClick(category.id)}
                    onMouseEnter={() => setHoveredCategory(category.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className={getBulletClasses(category.id)} />
                    <span className="text-sm">{category.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grid de productos - Lado derecho */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <ProductGrid
                products={filteredProducts}
                onAddToCart={(product) => {
                  console.log("Agregar al carrito:", product);
                }}
                onAddToWishlist={(product) => {
                  console.log("Agregar a favoritos:", product);
                }}
                className=""
              />
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                  <MagnifyingGlassIcon className="w-full h-full" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? "No hay productos que coincidan con tu búsqueda."
                    : "No hay productos destacados disponibles."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeProductsSection;
