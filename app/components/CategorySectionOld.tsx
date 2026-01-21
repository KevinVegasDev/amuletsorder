"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Product, ProductCategory } from "../types/product";
import ProductCard from "./ProductCard";
import ProductGrid from "./ProductGrid";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { getProductCategories } from "../lib/wordpress-api";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

interface CategorySectionOldProps {
  category: ProductCategory;
  products: Product[];
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

const CategorySectionOld: React.FC<CategorySectionOldProps> = ({
  category,
  products,
  onAddToCart,
  onAddToWishlist,
}) => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category.slug);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Cargar categorías al inicio
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getProductCategories();
        const uncategorizedIndex = cats.findIndex(
          (cat) => cat.slug === "uncategorized"
        );
        if (uncategorizedIndex !== -1) {
          cats[uncategorizedIndex].name = "All";
        }
        setCategories(cats);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };
    loadCategories();
  }, []);

  // Filtrar productos
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
    if (selectedCategory && selectedCategory !== "uncategorized") {
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

  if (products.length === 0) return null;

  return (
    <div className="min-h-screen pt-4 flex flex-col px-[50px] max-w-[1440px] mx-auto">
      <div className="h-full">
        {/* Layout principal: Filtros a la izquierda, productos a la derecha */}
        <div className="flex gap-2 h-full">
          {/* Panel de filtros - Lado izquierdo */}
          <div className="w-80 bg-blanco p-4 flex flex-col gap-[20px]">
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
            <div className="flex-1">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={getCategoryClasses(cat.slug)}
                  onClick={() => handleCategoryClick(cat.slug)}
                  onMouseEnter={() => setHoveredCategory(cat.slug)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className={getBulletClasses(cat.slug)} />
                  <span className="text-lg font-light cursor-pointer">
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Grid de productos - Lado derecho */}
          <div className="flex-1 h-full flex flex-col">
            {/* Header de la categoría */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-4xl font-bold text-black uppercase tracking-tight">
                {category.name}
              </h2>
              <Link
                href={`/market?category=${category.slug}`}
                className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors duration-200 group"
              >
                <span className="text-sm font-medium">
                  View all
                </span>
                <ChevronRightIcon className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            {filteredProducts.length > 0 ? (
              <>
                <ProductGrid
                  products={filteredProducts}
                  onAddToCart={onAddToCart}
                  onAddToWishlist={onAddToWishlist}
                  className="min-h-full"
                />
                <div className="flex justify-center items-center text-center pt-4">
                  <Button variant="shine" className="text-white cursor-pointer">
                    View more
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500">No se encontraron productos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySectionOld;





